import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { SubscribeDto, PartnerTier, BillingCycle, CancelSubscriptionDto } from './dto/subscribe.dto';

// Pricing in EUR cents - from MONETIZATION_PLAN.md Section 1.3
const PRICING: Record<PartnerTier, Record<BillingCycle, number>> = {
  [PartnerTier.COMMUNITY]: {
    [BillingCycle.MONTHLY]: 14900, // EUR 149/month
    [BillingCycle.ANNUAL]: 124167, // EUR 1,490/year -> EUR 124.17/month
  },
  [PartnerTier.GOLD]: {
    [BillingCycle.MONTHLY]: 49900, // EUR 499/month
    [BillingCycle.ANNUAL]: 415833, // EUR 4,990/year -> EUR 415.83/month
  },
  [PartnerTier.PLATINUM]: {
    [BillingCycle.MONTHLY]: 149900, // EUR 1,499/month
    [BillingCycle.ANNUAL]: 1249167, // EUR 14,990/year -> EUR 1,249.17/month
  },
  [PartnerTier.TITLE_SPONSOR]: {
    [BillingCycle.MONTHLY]: 500000, // EUR 5,000/month (base, custom pricing)
    [BillingCycle.ANNUAL]: 416667, // EUR 50,000/year -> EUR 4,166.67/month (base)
  },
};

// Stripe price IDs - would be configured via env vars in production
const STRIPE_PRICE_IDS: Record<string, string> = {
  'COMMUNITY_monthly': 'price_community_monthly',
  'COMMUNITY_annual': 'price_community_annual',
  'GOLD_monthly': 'price_gold_monthly',
  'GOLD_annual': 'price_gold_annual',
  'PLATINUM_monthly': 'price_platinum_monthly',
  'PLATINUM_annual': 'price_platinum_annual',
  'TITLE_SPONSOR_monthly': 'price_title_monthly',
  'TITLE_SPONSOR_annual': 'price_title_annual',
};

@Injectable()
export class PartnerBillingService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  async getBillingOverview(userId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);

    const [partner, subscription, upcomingInvoices] = await Promise.all([
      this.prisma.partnerOrganization.findUniqueOrThrow({
        where: { id: partnerId },
        select: {
          id: true,
          tier: true,
          stripeCustomerId: true,
          billingCycle: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
        },
      }),
      this.prisma.partnerSubscription.findFirst({
        where: { partnerId, status: { in: ['active', 'trialing'] } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnerInvoice.findMany({
        where: { partnerId, status: { in: ['PI_DRAFT', 'ISSUED'] } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    return {
      currentPlan: {
        tier: partner.tier,
        billingCycle: partner.billingCycle,
        monthlyAmountCents: subscription?.monthlyAmountCents || 0,
        currentPeriodStart: partner.currentPeriodStart,
        currentPeriodEnd: partner.currentPeriodEnd,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            trialEnd: subscription.trialEnd,
            cancelledAt: subscription.cancelledAt,
          }
        : null,
      hasPaymentMethod: !!partner.stripeCustomerId,
      upcomingCharges: upcomingInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        totalCents: inv.totalCents,
        dueDate: inv.dueDate,
        status: inv.status,
      })),
    };
  }

  async createSetupIntent(userId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    // In production, this calls Stripe API:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // let customerId = partner.stripeCustomerId;
    // if (!customerId) {
    //   const customer = await stripe.customers.create({
    //     email: partner.billingEmail,
    //     name: partner.companyName,
    //     metadata: { partnerId: partner.id },
    //   });
    //   customerId = customer.id;
    //   await this.prisma.partnerOrganization.update({
    //     where: { id: partnerId },
    //     data: { stripeCustomerId: customerId },
    //   });
    // }
    // const setupIntent = await stripe.setupIntents.create({
    //   customer: customerId,
    //   payment_method_types: ['sepa_debit', 'card'],
    // });
    // return { clientSecret: setupIntent.client_secret };

    // Placeholder until Stripe integration is wired up
    const clientSecret = `seti_placeholder_${partnerId}_${Date.now()}`;

    if (!partner.stripeCustomerId) {
      await this.prisma.partnerOrganization.update({
        where: { id: partnerId },
        data: { stripeCustomerId: `cus_placeholder_${partnerId}` },
      });
    }

    return { clientSecret };
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const role = await this.partnersService.getUserPartnerRole(userId);
    if (role !== 'PARTNER_ADMIN') {
      throw new ForbiddenException('Only partner admins can manage subscriptions');
    }

    if (dto.tier === PartnerTier.TITLE_SPONSOR) {
      throw new BadRequestException(
        'Title Sponsor subscriptions require a custom contract. Please contact our sales team.',
      );
    }

    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (!partner.stripeCustomerId) {
      throw new BadRequestException('Please set up a payment method first');
    }

    if (partner.verificationStatus !== 'VERIFIED') {
      throw new BadRequestException('Partner must be verified before subscribing');
    }

    const monthlyAmountCents = PRICING[dto.tier][dto.billingCycle];
    const stripePriceId = STRIPE_PRICE_IDS[`${dto.tier}_${dto.billingCycle}`];

    // Cancel existing subscription if upgrading/downgrading
    const existingSub = await this.prisma.partnerSubscription.findFirst({
      where: { partnerId, status: 'active' },
    });

    if (existingSub) {
      await this.prisma.partnerSubscription.update({
        where: { id: existingSub.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: `Switching to ${dto.tier} ${dto.billingCycle}`,
        },
      });

      // In production: await stripe.subscriptions.cancel(existingSub.stripeSubscriptionId);
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (dto.billingCycle === BillingCycle.ANNUAL) {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // In production: create Stripe subscription
    // const stripeSubscription = await stripe.subscriptions.create({
    //   customer: partner.stripeCustomerId,
    //   items: [{ price: stripePriceId }],
    // });

    const subscription = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.partnerSubscription.create({
        data: {
          partnerId,
          tier: dto.tier,
          billingCycle: dto.billingCycle,
          monthlyAmountCents,
          stripePriceId,
          stripeSubscriptionId: `sub_placeholder_${Date.now()}`,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      await tx.partnerOrganization.update({
        where: { id: partnerId },
        data: {
          tier: dto.tier,
          billingCycle: dto.billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeSubscriptionId: sub.stripeSubscriptionId,
        },
      });

      await tx.partnerAuditLog.create({
        data: {
          partnerId,
          userId,
          action: 'billing.subscribe',
          entityType: 'partner_subscription',
          entityId: sub.id,
          newState: { tier: dto.tier, billingCycle: dto.billingCycle, monthlyAmountCents },
        },
      });

      return sub;
    });

    return subscription;
  }

  async cancelSubscription(userId: string, dto: CancelSubscriptionDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const role = await this.partnersService.getUserPartnerRole(userId);
    if (role !== 'PARTNER_ADMIN') {
      throw new ForbiddenException('Only partner admins can cancel subscriptions');
    }

    const subscription = await this.prisma.partnerSubscription.findFirst({
      where: { partnerId, status: 'active' },
    });
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // In production: cancel at period end via Stripe
    // await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    //   cancel_at_period_end: true,
    // });

    const updated = await this.prisma.partnerSubscription.update({
      where: { id: subscription.id },
      data: {
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
        // Status remains 'active' until period end -- Stripe webhook will change it
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'billing.cancel',
        entityType: 'partner_subscription',
        entityId: subscription.id,
        newState: { reason: dto.reason, effectiveDate: subscription.currentPeriodEnd },
      },
    });

    return {
      ...updated,
      message: `Subscription will remain active until ${subscription.currentPeriodEnd.toISOString()}`,
    };
  }

  async getInvoices(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { partnerId };
    if (query.status) where.status = query.status;

    const [invoices, total] = await Promise.all([
      this.prisma.partnerInvoice.findMany({
        where,
        include: { lineItems: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.partnerInvoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInvoiceDetail(userId: string, invoiceId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const invoice = await this.prisma.partnerInvoice.findFirst({
      where: { id: invoiceId, partnerId },
      include: { lineItems: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // Stripe webhook handler
  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        // Unhandled event type
        break;
    }
  }

  private async handleInvoicePaid(stripeInvoice: any) {
    const subscription = await this.prisma.partnerSubscription.findFirst({
      where: { stripeSubscriptionId: stripeInvoice.subscription },
    });
    if (!subscription) return;

    // Update invoice status if we have a matching record
    await this.prisma.partnerInvoice.updateMany({
      where: {
        partnerId: subscription.partnerId,
        stripeInvoiceId: stripeInvoice.id,
      },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId: stripeInvoice.payment_intent,
      },
    });

    // Update subscription period
    await this.prisma.partnerSubscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: new Date(stripeInvoice.period_start * 1000),
        currentPeriodEnd: new Date(stripeInvoice.period_end * 1000),
        status: 'active',
      },
    });

    // Update denormalized spend on partner org
    await this.prisma.partnerOrganization.update({
      where: { id: subscription.partnerId },
      data: {
        totalSpend: { increment: stripeInvoice.amount_paid / 100 },
        currentPeriodStart: new Date(stripeInvoice.period_start * 1000),
        currentPeriodEnd: new Date(stripeInvoice.period_end * 1000),
      },
    });
  }

  private async handleInvoicePaymentFailed(stripeInvoice: any) {
    const subscription = await this.prisma.partnerSubscription.findFirst({
      where: { stripeSubscriptionId: stripeInvoice.subscription },
    });
    if (!subscription) return;

    await this.prisma.partnerInvoice.updateMany({
      where: {
        partnerId: subscription.partnerId,
        stripeInvoiceId: stripeInvoice.id,
      },
      data: { status: 'OVERDUE' },
    });

    await this.prisma.partnerSubscription.update({
      where: { id: subscription.id },
      data: { status: 'past_due' },
    });
  }

  private async handleSubscriptionUpdated(stripeSubscription: any) {
    await this.prisma.partnerSubscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });
  }

  private async handleSubscriptionDeleted(stripeSubscription: any) {
    const subscription = await this.prisma.partnerSubscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (!subscription) return;

    await this.prisma.partnerSubscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    // Downgrade partner to lowest tier or deactivate
    await this.prisma.partnerOrganization.update({
      where: { id: subscription.partnerId },
      data: {
        status: 'CHURNED',
        churnedAt: new Date(),
        churnReason: 'Subscription ended',
      },
    });
  }
}
