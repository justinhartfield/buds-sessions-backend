import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { LeadStatus } from '@prisma/client';

// Lead fee: EUR 5/lead in cents
const LEAD_FEE_CENTS = 500;

// Lead expiry: 30 days
const LEAD_EXPIRY_DAYS = 30;

@Injectable()
export class PartnerLeadsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  /**
   * Generate a lead from guest interest during a session.
   * Called by the session/feedback system when a guest opts in.
   */
  async generateLead(data: {
    partnerId: string;
    sponsorshipId: string;
    sessionId: string;
    userId: string;
    userEmail?: string;
    userCity?: string;
    productInterest?: string;
    consentedAt: Date;
  }) {
    const expiresAt = new Date(data.consentedAt);
    expiresAt.setDate(expiresAt.getDate() + LEAD_EXPIRY_DAYS);

    const lead = await this.prisma.partnerLead.create({
      data: {
        partnerId: data.partnerId,
        sponsorshipId: data.sponsorshipId,
        sessionId: data.sessionId,
        userId: data.userId,
        status: 'GENERATED',
        userConsentedAt: data.consentedAt,
        userEmail: data.userEmail,
        userCity: data.userCity,
        productInterest: data.productInterest,
        leadFeeCents: LEAD_FEE_CENTS,
        expiresAt,
      },
    });

    // Update denormalized counters
    await this.prisma.sponsorship.update({
      where: { id: data.sponsorshipId },
      data: { totalLeadsGenerated: { increment: 1 } },
    });

    return lead;
  }

  /**
   * Deliver leads to partner. Transitions from GENERATED to DELIVERED.
   * This should be called by a scheduled job or when the partner views their leads.
   */
  async deliverPendingLeads(partnerId: string) {
    const leads = await this.prisma.partnerLead.findMany({
      where: {
        partnerId,
        status: 'GENERATED',
        expiresAt: { gt: new Date() },
      },
    });

    if (leads.length === 0) return { delivered: 0 };

    await this.prisma.partnerLead.updateMany({
      where: {
        id: { in: leads.map((l) => l.id) },
      },
      data: {
        status: 'DELIVERED',
        deliveredToPartnerAt: new Date(),
      },
    });

    return { delivered: leads.length };
  }

  async getLeads(userId: string, query: {
    status?: string;
    sessionId?: string;
    page?: number;
    limit?: number;
  }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    // Auto-deliver any pending leads when partner views them
    await this.deliverPendingLeads(partnerId);

    const where: any = { partnerId };
    if (query.status) where.status = query.status;
    if (query.sessionId) where.sessionId = query.sessionId;

    // Exclude expired leads unless specifically requested
    if (query.status !== 'LEAD_EXPIRED') {
      where.OR = [
        { expiresAt: { gt: new Date() } },
        { status: 'CONVERTED' },
      ];
    }

    const [leads, total] = await Promise.all([
      this.prisma.partnerLead.findMany({
        where,
        select: {
          id: true,
          status: true,
          userCity: true,
          productInterest: true,
          userEmail: true,
          userConsentedAt: true,
          deliveredToPartnerAt: true,
          partnerAcknowledgedAt: true,
          convertedAt: true,
          conversionValueCents: true,
          leadFeeCents: true,
          expiresAt: true,
          createdAt: true,
          session: {
            select: { id: true, title: true, format: true, venueCity: true, scheduledDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.partnerLead.count({ where }),
    ]);

    return {
      data: leads,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async acknowledgeLead(userId: string, leadId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const lead = await this.prisma.partnerLead.findFirst({
      where: { id: leadId, partnerId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (lead.status === ('LEAD_EXPIRED' as LeadStatus)) {
      throw new BadRequestException('Cannot acknowledge an expired lead');
    }

    if (lead.expiresAt < new Date()) {
      // Auto-expire
      await this.prisma.partnerLead.update({
        where: { id: leadId },
        data: { status: 'LEAD_EXPIRED' as LeadStatus },
      });
      throw new BadRequestException('This lead has expired (30-day limit reached)');
    }

    return this.prisma.partnerLead.update({
      where: { id: leadId },
      data: {
        status: 'ACKNOWLEDGED',
        partnerAcknowledgedAt: new Date(),
      },
    });
  }

  async convertLead(userId: string, leadId: string, conversionValueCents?: number) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const lead = await this.prisma.partnerLead.findFirst({
      where: { id: leadId, partnerId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (lead.status === ('LEAD_EXPIRED' as LeadStatus)) {
      throw new BadRequestException('Cannot convert an expired lead');
    }
    if (lead.status === 'CONVERTED') {
      throw new BadRequestException('Lead is already converted');
    }

    return this.prisma.partnerLead.update({
      where: { id: leadId },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
        conversionValueCents,
      },
    });
  }

  /**
   * Expire leads that have passed their 30-day window.
   * Should be called by a daily cron job.
   */
  async expireOldLeads() {
    const result = await this.prisma.partnerLead.updateMany({
      where: {
        status: { in: ['GENERATED', 'DELIVERED', 'ACKNOWLEDGED'] },
        expiresAt: { lte: new Date() },
      },
      data: { status: 'LEAD_EXPIRED' as LeadStatus },
    });

    return { expiredCount: result.count };
  }
}
