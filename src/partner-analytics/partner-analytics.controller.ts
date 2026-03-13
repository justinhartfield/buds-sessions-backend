import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnerAnalyticsService } from './partner-analytics.service';

@Controller()
export class PartnerAnalyticsController {
  constructor(private readonly analyticsService: PartnerAnalyticsService) {}

  // Partner-facing endpoints
  @Get('partners/analytics/overview')
  @UseGuards(JwtAuthGuard)
  async getOverview(@CurrentUser('id') userId: string) {
    return this.analyticsService.getOverview(userId);
  }

  @Get('partners/analytics/campaigns')
  @UseGuards(JwtAuthGuard)
  async getCampaigns(
    @CurrentUser('id') userId: string,
    @Query('campaign_id') campaignId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.analyticsService.getCampaignAnalytics(userId, { campaignId, dateFrom, dateTo });
  }

  @Get('partners/analytics/sessions')
  @UseGuards(JwtAuthGuard)
  async getSessionAnalytics(
    @CurrentUser('id') userId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('city') city?: string,
    @Query('format') format?: string,
  ) {
    return this.analyticsService.getSessionAnalytics(userId, { dateFrom, dateTo, city, format });
  }

  @Get('partners/analytics/products')
  @UseGuards(JwtAuthGuard)
  async getProductAnalytics(
    @CurrentUser('id') userId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.analyticsService.getProductAnalytics(userId, { dateFrom, dateTo });
  }

  @Get('partners/analytics/geographic')
  @UseGuards(JwtAuthGuard)
  async getGeographicAnalytics(@CurrentUser('id') userId: string) {
    return this.analyticsService.getGeographicAnalytics(userId);
  }

  @Get('partners/analytics/leads')
  @UseGuards(JwtAuthGuard)
  async getLeadAnalytics(
    @CurrentUser('id') userId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('status') status?: string,
  ) {
    return this.analyticsService.getLeadAnalytics(userId, { dateFrom, dateTo, status });
  }

  @Get('partners/analytics/roi')
  @UseGuards(JwtAuthGuard)
  async getRoiAnalytics(
    @CurrentUser('id') userId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.analyticsService.getRoiAnalytics(userId, { dateFrom, dateTo });
  }

  @Get('partners/analytics/benchmarks')
  @UseGuards(JwtAuthGuard)
  async getBenchmarks(@CurrentUser('id') userId: string) {
    return this.analyticsService.getBenchmarks(userId);
  }

  @Get('partners/analytics/export')
  @UseGuards(JwtAuthGuard)
  async exportAnalytics(
    @CurrentUser('id') userId: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('format') format?: string,
  ) {
    return this.analyticsService.exportAnalytics(userId, { dateFrom, dateTo, format });
  }

  // Admin endpoints
  @Get('admin/partner-analytics/revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminRevenueDashboard() {
    return this.analyticsService.adminGetRevenueDashboard();
  }

  @Get('admin/partner-analytics/pipeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminPipeline() {
    return this.analyticsService.adminGetPipeline();
  }
}
