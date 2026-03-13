import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { SponsorshipStatus } from '@prisma/client';

// Tier-based data access restrictions
const TIER_ACCESS: Record<string, string[]> = {
  COMMUNITY: ['overview', 'campaigns', 'sessions_basic', 'products_aggregate', 'geographic_basic'],
  GOLD: ['overview', 'campaigns', 'sessions', 'products', 'geographic', 'leads_basic', 'roi', 'benchmarks_basic'],
  PLATINUM: ['overview', 'campaigns', 'sessions', 'products', 'geographic', 'leads', 'roi', 'benchmarks', 'export', 'nps'],
  TITLE_SPONSOR: ['overview', 'campaigns', 'sessions', 'products', 'geographic', 'leads', 'roi', 'benchmarks', 'export', 'nps', 'api', 'custom_bi'],
};

@Injectable()
export class PartnerAnalyticsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  private async getPartnerWithTier(userId: string) {
    const partner = await this.partnersService.getPartnerForUser(userId);
    return partner;
  }

  private assertAccess(tier: string, feature: string) {
    const access = TIER_ACCESS[tier] || [];
    if (!access.includes(feature)) {
      throw new ForbiddenException(
        `${feature} analytics are not available for ${tier} tier. Please upgrade for access.`,
      );
    }
  }

  async getOverview(userId: string) {
    const partner = await this.getPartnerWithTier(userId);

    const [
      totalSponsorships,
      activeSponsorships,
      totalImpressions,
      avgRating,
      totalLeads,
      totalSpend,
      monthlyMetrics,
    ] = await Promise.all([
      this.prisma.sponsorship.count({
        where: { partnerId: partner.id, deletedAt: null },
      }),
      this.prisma.sponsorship.count({
        where: { partnerId: partner.id, status: { in: ['SS_ACTIVE', 'SS_APPROVED'] as SponsorshipStatus[] } },
      }),
      this.prisma.sponsorship.aggregate({
        where: { partnerId: partner.id },
        _sum: { totalImpressions: true },
      }),
      this.prisma.sponsorProductFeedback.aggregate({
        where: { partnerId: partner.id },
        _avg: { rating: true },
      }),
      this.prisma.partnerLead.count({
        where: { partnerId: partner.id },
      }),
      this.prisma.partnerInvoice.aggregate({
        where: { partnerId: partner.id, status: 'PAID' },
        _sum: { totalCents: true },
      }),
      // Last 6 months trend
      this.getMonthlyTrend(partner.id, 6),
    ]);

    return {
      totalSponsorships,
      activeSponsorships,
      totalImpressions: totalImpressions._sum.totalImpressions || 0,
      averageProductRating: avgRating._avg.rating || 0,
      totalLeads,
      totalSpendCents: totalSpend._sum.totalCents || 0,
      monthlyTrend: monthlyMetrics,
    };
  }

  async getCampaignAnalytics(userId: string, query: { campaignId?: string; dateFrom?: string; dateTo?: string }) {
    const partner = await this.getPartnerWithTier(userId);
    this.assertAccess(partner.tier, 'campaigns');

    const where: any = { partnerId: partner.id };
    if (query.campaignId) where.id = query.campaignId;

    const campaigns = await this.prisma.partnerCampaign.findMany({
      where,
      include: {
        sponsorships: {
          select: {
            id: true,
            type: true,
            status: true,
            totalImpressions: true,
            averageProductRating: true,
            totalLeadsGenerated: true,
            amountCents: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budgetCents: campaign.budgetCents,
      spentCents: campaign.spentCents,
      totalSponsorships: campaign.sponsorships.length,
      totalImpressions: campaign.sponsorships.reduce((sum, s) => sum + s.totalImpressions, 0),
      averageRating:
        campaign.sponsorships.filter((s) => s.averageProductRating).length > 0
          ? campaign.sponsorships.reduce((sum, s) => sum + (s.averageProductRating?.toNumber() || 0), 0) /
            campaign.sponsorships.filter((s) => s.averageProductRating).length
          : null,
      totalLeads: campaign.sponsorships.reduce((sum, s) => sum + s.totalLeadsGenerated, 0),
    }));
  }

  async getSessionAnalytics(userId: string, query: { dateFrom?: string; dateTo?: string; city?: string; format?: string }) {
    const partner = await this.getPartnerWithTier(userId);
    const isBasic = partner.tier === 'COMMUNITY';
    this.assertAccess(partner.tier, isBasic ? 'sessions_basic' : 'sessions');

    const where: any = {
      partnerId: partner.id,
      type: { in: ['SESSION_BASIC', 'SESSION_ENHANCED', 'SESSION_PREMIUM'] },
      status: { in: ['SS_ACTIVE', 'SS_COMPLETED'] as SponsorshipStatus[] },
    };

    if (query.dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(query.dateFrom) };
    if (query.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(query.dateTo) };

    const sponsorships = await this.prisma.sponsorship.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            format: true,
            venueCity: true,
            scheduledDate: true,
            status: true,
          },
        },
        productFeedback: isBasic
          ? false
          : {
              select: {
                rating: true,
                comment: isBasic ? false : true,
                wouldPurchase: true,
              },
            },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (isBasic) {
      // Community tier: aggregate only
      return {
        totalSessions: sponsorships.length,
        totalImpressions: sponsorships.reduce((sum, s) => sum + s.totalImpressions, 0),
        averageRating: partner.averageProductRating,
      };
    }

    return sponsorships.map((sp: any) => ({
      sponsorshipId: sp.id,
      type: sp.type,
      session: sp.session,
      impressions: sp.totalImpressions,
      productRatings: sp.totalProductRatings,
      averageProductRating: sp.averageProductRating,
      leadsGenerated: sp.totalLeadsGenerated,
      recapMentions: sp.recapMentions,
      feedback: sp.productFeedback,
    }));
  }

  async getProductAnalytics(userId: string, query: { dateFrom?: string; dateTo?: string }) {
    const partner = await this.getPartnerWithTier(userId);
    const isAggregate = partner.tier === 'COMMUNITY';
    this.assertAccess(partner.tier, isAggregate ? 'products_aggregate' : 'products');

    const where: any = { partnerId: partner.id };
    if (query.dateFrom) where.createdAt = { gte: new Date(query.dateFrom) };
    if (query.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(query.dateTo) };

    const feedback = await this.prisma.sponsorProductFeedback.findMany({
      where,
      select: {
        productName: true,
        rating: true,
        comment: isAggregate ? false : true,
        wouldPurchase: true,
        wantsMoreInfo: true,
        createdAt: true,
      },
    });

    // Group by product
    const productMap = new Map<string, any>();
    for (const fb of feedback) {
      if (!productMap.has(fb.productName)) {
        productMap.set(fb.productName, {
          productName: fb.productName,
          totalRatings: 0,
          ratingSum: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          wouldPurchaseCount: 0,
          wantsMoreInfoCount: 0,
          comments: [],
        });
      }
      const product = productMap.get(fb.productName);
      product.totalRatings++;
      product.ratingSum += fb.rating;
      product.ratingDistribution[fb.rating]++;
      if (fb.wouldPurchase) product.wouldPurchaseCount++;
      if (fb.wantsMoreInfo) product.wantsMoreInfoCount++;
      if (!isAggregate && fb.comment) product.comments.push(fb.comment);
    }

    return Array.from(productMap.values()).map((p) => ({
      ...p,
      averageRating: p.totalRatings > 0 ? p.ratingSum / p.totalRatings : 0,
      purchaseIntentRate: p.totalRatings > 0 ? p.wouldPurchaseCount / p.totalRatings : 0,
      comments: isAggregate ? undefined : p.comments.slice(0, 20),
    }));
  }

  async getGeographicAnalytics(userId: string) {
    const partner = await this.getPartnerWithTier(userId);
    const isBasic = partner.tier === 'COMMUNITY';
    this.assertAccess(partner.tier, isBasic ? 'geographic_basic' : 'geographic');

    const sponsorships = await this.prisma.sponsorship.findMany({
      where: {
        partnerId: partner.id,
        status: { in: ['SS_ACTIVE', 'SS_COMPLETED'] as SponsorshipStatus[] },
      },
      include: {
        session: { select: { venueCity: true } },
      },
    });

    const cityMap = new Map<string, { sessions: number; impressions: number }>();
    for (const sp of sponsorships) {
      const city = (sp.session as any)?.venueCity || sp.city || 'Unknown';
      if (!cityMap.has(city)) {
        cityMap.set(city, { sessions: 0, impressions: 0 });
      }
      const entry = cityMap.get(city)!;
      entry.sessions++;
      entry.impressions += sp.totalImpressions;
    }

    const cities = Array.from(cityMap.entries())
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.sessions - a.sessions);

    return {
      cities,
      totalCities: cities.length,
    };
  }

  async getLeadAnalytics(userId: string, query: { dateFrom?: string; dateTo?: string; status?: string }) {
    const partner = await this.getPartnerWithTier(userId);
    const isBasic = !['PLATINUM', 'TITLE_SPONSOR'].includes(partner.tier);
    this.assertAccess(partner.tier, isBasic ? 'leads_basic' : 'leads');

    const where: any = { partnerId: partner.id };
    if (query.dateFrom) where.createdAt = { gte: new Date(query.dateFrom) };
    if (query.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(query.dateTo) };
    if (query.status) where.status = query.status;

    const [total, byStatus, conversionValue] = await Promise.all([
      this.prisma.partnerLead.count({ where }),
      this.prisma.partnerLead.groupBy({
        by: ['status'],
        where: { partnerId: partner.id },
        _count: true,
      }),
      this.prisma.partnerLead.aggregate({
        where: { partnerId: partner.id, status: 'CONVERTED' },
        _sum: { conversionValueCents: true },
        _count: true,
      }),
    ]);

    const funnel = {
      generated: 0,
      delivered: 0,
      acknowledged: 0,
      converted: 0,
      expired: 0,
    };
    for (const group of byStatus) {
      const key = group.status.toLowerCase() as keyof typeof funnel;
      if (key in funnel) funnel[key] = group._count;
    }

    return {
      total,
      funnel,
      conversionRate: total > 0 ? funnel.converted / total : 0,
      totalConversionValueCents: conversionValue._sum.conversionValueCents || 0,
      averageConversionValueCents:
        conversionValue._count > 0
          ? (conversionValue._sum.conversionValueCents || 0) / conversionValue._count
          : 0,
    };
  }

  async getRoiAnalytics(userId: string, query: { dateFrom?: string; dateTo?: string }) {
    const partner = await this.getPartnerWithTier(userId);
    this.assertAccess(partner.tier, 'roi');

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    const [spend, impressions, leads, conversions] = await Promise.all([
      this.prisma.partnerInvoice.aggregate({
        where: {
          partnerId: partner.id,
          status: 'PAID',
          paidAt: { gte: dateFrom, lte: dateTo },
        },
        _sum: { totalCents: true },
      }),
      this.prisma.sponsorship.aggregate({
        where: {
          partnerId: partner.id,
          createdAt: { gte: dateFrom, lte: dateTo },
          status: { in: ['SS_ACTIVE', 'SS_COMPLETED'] as SponsorshipStatus[] },
        },
        _sum: { totalImpressions: true },
      }),
      this.prisma.partnerLead.count({
        where: {
          partnerId: partner.id,
          createdAt: { gte: dateFrom, lte: dateTo },
        },
      }),
      this.prisma.partnerLead.aggregate({
        where: {
          partnerId: partner.id,
          status: 'CONVERTED',
          convertedAt: { gte: dateFrom, lte: dateTo },
        },
        _sum: { conversionValueCents: true },
        _count: true,
      }),
    ]);

    const totalSpendCents = spend._sum.totalCents || 0;
    const totalImpressions = impressions._sum?.totalImpressions || 0;

    return {
      period: { from: dateFrom, to: dateTo },
      totalSpendCents,
      totalImpressions,
      totalLeads: leads,
      totalConversions: conversions._count,
      totalConversionValueCents: conversions._sum.conversionValueCents || 0,
      costPerImpressionCents: totalImpressions > 0 ? totalSpendCents / totalImpressions : 0,
      cpm: totalImpressions > 0 ? (totalSpendCents / totalImpressions) * 1000 : 0, // Cost per mille
      costPerLeadCents: leads > 0 ? totalSpendCents / leads : 0,
      costPerConversionCents: conversions._count > 0 ? totalSpendCents / conversions._count : 0,
      roi:
        totalSpendCents > 0
          ? ((conversions._sum.conversionValueCents || 0) - totalSpendCents) / totalSpendCents
          : 0,
    };
  }

  async getBenchmarks(userId: string) {
    const partner = await this.getPartnerWithTier(userId);
    this.assertAccess(partner.tier, partner.tier === 'GOLD' ? 'benchmarks_basic' : 'benchmarks');

    // Get category averages
    const categoryPartners = await this.prisma.partnerOrganization.findMany({
      where: { category: partner.category, status: 'ACTIVE', id: { not: partner.id } },
      select: {
        averageProductRating: true,
        totalSessionsSponsored: true,
        totalImpressions: true,
      },
    });

    const categoryAvg = {
      rating:
        categoryPartners.length > 0
          ? categoryPartners.reduce((sum, p) => sum + (p.averageProductRating?.toNumber() || 0), 0) /
            categoryPartners.length
          : 0,
      sessions:
        categoryPartners.length > 0
          ? categoryPartners.reduce((sum, p) => sum + p.totalSessionsSponsored, 0) /
            categoryPartners.length
          : 0,
      impressions:
        categoryPartners.length > 0
          ? categoryPartners.reduce((sum, p) => sum + p.totalImpressions, 0) /
            categoryPartners.length
          : 0,
    };

    const result: any = {
      yourRating: partner.averageProductRating?.toNumber() || 0,
      categoryAverageRating: categoryAvg.rating,
      yourSessions: partner.totalSessionsSponsored,
      categoryAverageSessions: categoryAvg.sessions,
      yourImpressions: partner.totalImpressions,
      categoryAverageImpressions: categoryAvg.impressions,
    };

    // Platinum+ get city-level benchmarks too
    if (['PLATINUM', 'TITLE_SPONSOR'].includes(partner.tier)) {
      const cityPartners = await this.prisma.partnerOrganization.findMany({
        where: { city: partner.city, status: 'ACTIVE', id: { not: partner.id } },
        select: {
          averageProductRating: true,
          totalSessionsSponsored: true,
        },
      });

      result.cityAverageRating =
        cityPartners.length > 0
          ? cityPartners.reduce((sum, p) => sum + (p.averageProductRating?.toNumber() || 0), 0) /
            cityPartners.length
          : 0;
      result.cityAverageSessions =
        cityPartners.length > 0
          ? cityPartners.reduce((sum, p) => sum + p.totalSessionsSponsored, 0) /
            cityPartners.length
          : 0;
    }

    return result;
  }

  async exportAnalytics(userId: string, query: { dateFrom?: string; dateTo?: string; format?: string }) {
    const partner = await this.getPartnerWithTier(userId);
    this.assertAccess(partner.tier, 'export');

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    // Gather all analytics data
    const [sponsorships, feedback, leads] = await Promise.all([
      this.prisma.sponsorship.findMany({
        where: {
          partnerId: partner.id,
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        include: {
          session: { select: { title: true, format: true, venueCity: true, scheduledDate: true } },
        },
      }),
      this.prisma.sponsorProductFeedback.findMany({
        where: {
          partnerId: partner.id,
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        select: {
          productName: true,
          rating: true,
          wouldPurchase: true,
          createdAt: true,
        },
      }),
      this.prisma.partnerLead.findMany({
        where: {
          partnerId: partner.id,
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        select: {
          status: true,
          userCity: true,
          conversionValueCents: true,
          createdAt: true,
        },
      }),
    ]);

    // In production, this would generate a CSV/JSON file, upload to S3,
    // and return a signed URL. For now, return the data directly.
    if (query.format === 'csv') {
      // Would generate CSV and return signed URL
      return {
        message: 'CSV export would be generated and uploaded to S3',
        downloadUrl: `https://s3.eu-central-1.amazonaws.com/buds-exports/${partner.id}/analytics-${Date.now()}.csv`,
        expiresIn: 3600,
      };
    }

    return {
      exportedAt: new Date(),
      period: { from: dateFrom, to: dateTo },
      sponsorships: sponsorships.length,
      feedbackRecords: feedback.length,
      leads: leads.length,
      data: { sponsorships, feedback, leads },
    };
  }

  // Admin analytics
  async adminGetRevenueDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [mrr, arr, activePartners, byTier, pipeline, churnedThisMonth] = await Promise.all([
      this.prisma.partnerSubscription.aggregate({
        where: { status: 'active' },
        _sum: { monthlyAmountCents: true },
      }),
      this.prisma.partnerInvoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: yearStart },
        },
        _sum: { totalCents: true },
      }),
      this.prisma.partnerOrganization.count({ where: { status: 'ACTIVE' } }),
      this.prisma.partnerOrganization.groupBy({
        by: ['tier'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
      this.prisma.partnerOrganization.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.partnerOrganization.count({
        where: { status: 'CHURNED', churnedAt: { gte: monthStart } },
      }),
    ]);

    return {
      mrr: mrr._sum.monthlyAmountCents || 0,
      projectedArr: (mrr._sum.monthlyAmountCents || 0) * 12,
      ytdRevenue: arr._sum.totalCents || 0,
      activePartners,
      partnersByTier: byTier.map((t) => ({ tier: t.tier, count: t._count })),
      pipeline: pipeline.map((p) => ({ status: p.status, count: p._count })),
      churnThisMonth: churnedThisMonth,
      churnRate: activePartners > 0 ? churnedThisMonth / activePartners : 0,
    };
  }

  async adminGetPipeline() {
    const pipeline = await this.prisma.partnerOrganization.groupBy({
      by: ['status', 'tier'],
      _count: true,
      orderBy: { status: 'asc' },
    });

    return pipeline.map((p) => ({
      status: p.status,
      tier: p.tier,
      count: p._count,
    }));
  }

  private async getMonthlyTrend(partnerId: string, months: number) {
    const snapshots = await this.prisma.partnerAnalyticsSnapshot.findMany({
      where: {
        partnerId,
        snapshotDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
        },
        metricName: { in: ['impressions', 'leads', 'spend', 'product_rating_avg'] },
        dimension: null,
      },
      orderBy: { snapshotDate: 'asc' },
    });

    return snapshots;
  }
}
