import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { FeaturedPlacementLocation } from '@prisma/client';

// Placement pricing in EUR cents per week/month
const PLACEMENT_PRICING: Record<string, number> = {
  HOMEPAGE_PARTNER_BAR: 20000, // EUR 200/week
  PLAYBOOK_SIDEBAR: 15000, // EUR 150/month
  SESSION_RECOMMENDATIONS: 10000, // EUR 100/month
  PARTNER_DIRECTORY_FEATURED: 10000, // EUR 100/month
  EMAIL_NEWSLETTER: 15000, // EUR 150/issue
};

@Injectable()
export class FeaturedPlacementsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  async getAvailableSlots() {
    const now = new Date();
    const threeMonthsOut = new Date();
    threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

    // Get all currently booked placements
    const booked = await this.prisma.featuredPlacement.findMany({
      where: {
        isActive: true,
        endDate: { gte: now },
      },
      select: {
        location: true,
        startDate: true,
        endDate: true,
      },
    });

    const locations = [
      'HOMEPAGE_PARTNER_BAR',
      'PLAYBOOK_SIDEBAR',
      'SESSION_RECOMMENDATIONS',
      'PARTNER_DIRECTORY_FEATURED',
      'EMAIL_NEWSLETTER',
    ];

    return locations.map((location) => {
      const bookedSlots = booked
        .filter((b) => b.location === location)
        .map((b) => ({
          startDate: b.startDate,
          endDate: b.endDate,
        }));

      return {
        location,
        pricingCents: PLACEMENT_PRICING[location],
        pricingPeriod: location === 'HOMEPAGE_PARTNER_BAR' ? 'per_week' : 'per_month',
        bookedPeriods: bookedSlots,
      };
    });
  }

  async purchasePlacement(userId: string, data: {
    location: FeaturedPlacementLocation;
    startDate: string;
    endDate: string;
    assetUrl: string;
    destinationUrl: string;
  }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (partner.status !== 'ACTIVE') {
      throw new ForbiddenException('Partner must be active');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for conflicts
    const conflict = await this.prisma.featuredPlacement.findFirst({
      where: {
        location: data.location,
        isActive: true,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (conflict) {
      throw new ConflictException('This placement slot is already booked for the selected period');
    }

    // Calculate fee
    const pricing = PLACEMENT_PRICING[data.location];
    if (!pricing) throw new BadRequestException('Invalid placement location');

    const durationMs = endDate.getTime() - startDate.getTime();
    const durationWeeks = durationMs / (7 * 24 * 60 * 60 * 1000);
    const durationMonths = durationMs / (30 * 24 * 60 * 60 * 1000);

    const feeCents =
      data.location === 'HOMEPAGE_PARTNER_BAR'
        ? Math.ceil(durationWeeks) * pricing
        : Math.ceil(durationMonths) * pricing;

    // Gold partners get 1 week/quarter of homepage rotation included
    // Check if partner has already used their included placement this quarter
    let effectiveFee = feeCents;
    if (partner.tier === 'GOLD' && data.location === 'HOMEPAGE_PARTNER_BAR') {
      const quarterStart = new Date();
      quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1);
      quarterStart.setHours(0, 0, 0, 0);

      const quarterEnd = new Date(quarterStart);
      quarterEnd.setMonth(quarterEnd.getMonth() + 3);

      const usedThisQuarter = await this.prisma.featuredPlacement.count({
        where: {
          partnerId,
          location: 'HOMEPAGE_PARTNER_BAR',
          startDate: { gte: quarterStart, lt: quarterEnd },
        },
      });

      if (usedThisQuarter === 0 && durationWeeks <= 1) {
        effectiveFee = 0; // 1 week included per quarter for Gold
      }
    }

    const placement = await this.prisma.featuredPlacement.create({
      data: {
        partnerId,
        location: data.location,
        startDate,
        endDate,
        feeCents: effectiveFee,
        assetUrl: data.assetUrl,
        destinationUrl: data.destinationUrl,
        isActive: true,
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'placement.purchase',
        entityType: 'featured_placement',
        entityId: placement.id,
        newState: { location: data.location, feeCents: effectiveFee, startDate, endDate },
      },
    });

    return placement;
  }

  async getMyPlacements(userId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);

    return this.prisma.featuredPlacement.findMany({
      where: { partnerId },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Record an impression for a placement. Called by the frontend when the placement is displayed.
   */
  async recordImpression(placementId: string) {
    await this.prisma.featuredPlacement.update({
      where: { id: placementId },
      data: { impressionCount: { increment: 1 } },
    });
  }

  /**
   * Record a click for a placement. Called by the frontend when the placement is clicked.
   */
  async recordClick(placementId: string) {
    await this.prisma.featuredPlacement.update({
      where: { id: placementId },
      data: { clickCount: { increment: 1 } },
    });
  }

  /**
   * Get active placements for a specific location (used by frontend to render).
   */
  async getActivePlacements(location: FeaturedPlacementLocation) {
    const now = new Date();
    return this.prisma.featuredPlacement.findMany({
      where: {
        location,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        partner: {
          select: { id: true, companyName: true, logoUrl: true },
        },
      },
    });
  }
}
