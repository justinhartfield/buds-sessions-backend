import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  RawBodyRequest,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnerBillingService } from './partner-billing.service';
import { SubscribeDto, CancelSubscriptionDto } from './dto/subscribe.dto';
import { Request } from 'express';

@Controller()
export class PartnerBillingController {
  constructor(private readonly billingService: PartnerBillingService) {}

  @Get('partners/me/billing')
  @UseGuards(JwtAuthGuard)
  async getBillingOverview(@CurrentUser('id') userId: string) {
    return this.billingService.getBillingOverview(userId);
  }

  @Post('partners/me/billing/setup-intent')
  @UseGuards(JwtAuthGuard)
  async createSetupIntent(@CurrentUser('id') userId: string) {
    return this.billingService.createSetupIntent(userId);
  }

  @Post('partners/me/billing/subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.billingService.subscribe(userId, dto);
  }

  @Post('partners/me/billing/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(
    @CurrentUser('id') userId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.billingService.cancelSubscription(userId, dto);
  }

  @Get('partners/me/invoices')
  @UseGuards(JwtAuthGuard)
  async getInvoices(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billingService.getInvoices(userId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('partners/me/invoices/:id')
  @UseGuards(JwtAuthGuard)
  async getInvoiceDetail(
    @CurrentUser('id') userId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.billingService.getInvoiceDetail(userId, invoiceId);
  }

  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // In production, verify the webhook signature:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(
    //   req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET
    // );

    // For now, parse the body directly (signature verification should be added)
    const event = req.body;
    await this.billingService.handleStripeWebhook(event);
    return { received: true };
  }
}
