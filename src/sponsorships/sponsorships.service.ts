import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import {
  CreateSponsorshipDto,
  UpdateSponsorshipDto,
  SponsorshipType,
  HostCounterProposalDto,
  HostDeclineDto,
} from './dto/create-sponsorship.dto';
import {
  SponsorshipStatus,
  ConversationCardSponsorStatus,
  SessionPhase,
  GatheringFormat,
} from '@prisma/client';

// Pricing from MONETIZATION_PLAN Section 1.3
// Session sponsorship costs in EUR cents (per-session add-on fees)
const SESSION_PRICING: Record<string, Record<string, number>> = {
  SESSION_BASIC: { COMMUNITY: 7500, GOLD: 6000, PLATINUM: 0, TITLE_SPONSOR: 0 },
  SESSION_ENHANCED: { COMMUNITY: 15000, GOLD: 12000, PLATINUM: 0, TITLE_SPONSOR: 0 },
  SESSION_PREMIUM: { COMMUNITY: 30000, GOLD: 25000, PLATINUM: 0, TITLE_SPONSOR: 0 },
};

// Format sponsorship pricing (per quarter, in EUR cents)
const FORMAT_PRICING: Record<string, number> = {
  FORMAT_CITY: 75000,
  FORMAT_NATIONAL: 300000,
  FORMAT_EXCLUSIVE_NATIONAL: 500000,
};

// Monthly sponsorship limits by tier
const MONTHLY_SESSION_LIMITS: Record<string, number> = {
  COMMUNITY: 2,
  GOLD: 8,
  PLATINUM: Infinity,
  TITLE_SPONSOR: Infinity,
};

@Injectable()
export class SponsorshipsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  async getAvailableSessions(query: {
    city?: string;
    format?: string;
    dateFrom?: string;
    dateTo?: string;
    hostTier?: string;
    isSponsored?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {
      status: { in: ['SCHEDULED', 'RSVP_CLOSED'] },
      deletedAt: null,
    };

    if (query.city) where.venueCity = query.city;
    if (query.format) where.format = query.format;
    if (query.dateFrom || query.dateTo) {
      where.scheduledDate = {};
      if (query.dateFrom) where.scheduledDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.scheduledDate.lte = new Date(query.dateTo);
    }
    if (query.isSponsored === 'false') {
      where.isSponsored = false;
    } else if (query.isSponsored === 'true') {
      where.isSponsored = true;
    }

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        select: {
          id: true,
          title: true,
          format: true,
          venueCity: true,
          scheduledDate: true,
          isSponsored: true,
          host: {
            select: {
              id: true,
              tier: true,
              user: { select: { firstName: true } },
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.session.count({ where }),
    ]);

    return {
      data: sessions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createSponsorship(userId: string, dto: CreateSponsorshipDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (partner.status !== 'ACTIVE') {
      throw new ForbiddenException('Partner organization must be active to create sponsorships');
    }

    // Validate based on sponsorship type
    if (dto.type.startsWith('SESSION_')) {
      return this.createSessionSponsorship(partner, userId, dto);
    } else if (dto.type.startsWith('FORMAT_')) {
      return this.createFormatSponsorship(partner, userId, dto);
    }

    throw new BadRequestException('Invalid sponsorship type');
  }

  private async createSessionSponsorship(partner: any, userId: string, dto: CreateSponsorshipDto) {
    if (!dto.sessionId) {
      throw new BadRequestException('sessionId is required for session sponsorships');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: { host: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    // Community-first rule: max 1 sponsor per session (Title Sponsors don't count)
    if (session.isSponsored && partner.tier !== 'TITLE_SPONSOR') {
      throw new ConflictException(
        'This session already has a sponsor. Only one sponsor per session is allowed.',
      );
    }

    // Check monthly limits
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const monthlyCount = await this.prisma.sponsorship.count({
      where: {
        partnerId: partner.id,
        type: { in: ['SESSION_BASIC', 'SESSION_ENHANCED', 'SESSION_PREMIUM'] },
        status: { notIn: ['SS_CANCELLED', 'HOST_DECLINED', 'SS_EXPIRED'] as SponsorshipStatus[] },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    });

    const monthlyLimit = MONTHLY_SESSION_LIMITS[partner.tier];
    if (monthlyCount >= monthlyLimit) {
      throw new BadRequestException(
        `Monthly session sponsorship limit reached (${monthlyLimit} per month for ${partner.tier} tier). Upgrade your tier for more.`,
      );
    }

    // Validate branded cards count per type
    const brandedCardsCount = dto.brandedCards?.length || 0;
    if (dto.type === SponsorshipType.SESSION_BASIC && brandedCardsCount > 0) {
      throw new BadRequestException('Basic sponsorship does not include branded cards');
    }
    if (dto.type === SponsorshipType.SESSION_ENHANCED && brandedCardsCount > 1) {
      throw new BadRequestException('Enhanced sponsorship allows at most 1 branded card');
    }
    if (dto.type === SponsorshipType.SESSION_PREMIUM && brandedCardsCount > 3) {
      throw new BadRequestException('Premium sponsorship allows at most 3 branded cards');
    }

    // Calculate pricing
    const amountCents = SESSION_PRICING[dto.type]?.[partner.tier] || 0;

    const needsEditorialReview = brandedCardsCount > 0 || !!dto.leaveBehindDescription;
    const initialStatus = needsEditorialReview ? 'PENDING_REVIEW' : 'PENDING_HOST_APPROVAL';

    const sponsorship = await this.prisma.$transaction(async (tx) => {
      const sp = await tx.sponsorship.create({
        data: {
          partnerId: partner.id,
          type: dto.type,
          status: initialStatus,
          sessionId: dto.sessionId,
          hostId: session.hostId,
          amountCents,
          brandedCardsCount,
          productSamplesRequired: !!dto.productSamplesDescription,
          includeProductFeedback: dto.type !== SponsorshipType.SESSION_BASIC,
          includeLeadCapture: dto.type === SponsorshipType.SESSION_PREMIUM,
          leaveBehindDescription: dto.leaveBehindDescription,
          notes: dto.notes,
          campaignId: dto.campaignId,
        },
      });

      // Create branded card records if provided
      if (dto.brandedCards && dto.brandedCards.length > 0) {
        for (const card of dto.brandedCards) {
          await tx.sponsoredConversationCard.create({
            data: {
              partnerId: partner.id,
              sponsorshipId: sp.id,
              promptText: card.promptText,
              attributionText: card.attributionText,
              targetPhase: card.targetPhase as SessionPhase,
              status: 'CCS_SUBMITTED' as ConversationCardSponsorStatus,
              feeAmountCents: 0, // Included in sponsorship price
            },
          });
        }
      }

      await tx.partnerAuditLog.create({
        data: {
          partnerId: partner.id,
          userId,
          action: 'sponsorship.create',
          entityType: 'sponsorship',
          entityId: sp.id,
          newState: { type: dto.type, sessionId: dto.sessionId, amountCents },
        },
      });

      return sp;
    });

    return sponsorship;
  }

  private async createFormatSponsorship(partner: any, userId: string, dto: CreateSponsorshipDto) {
    if (!dto.format) {
      throw new BadRequestException('format is required for format sponsorships');
    }

    // Tier restrictions for format sponsorships
    if (dto.type === SponsorshipType.FORMAT_CITY && !['GOLD', 'PLATINUM', 'TITLE_SPONSOR'].includes(partner.tier)) {
      throw new ForbiddenException('City-level format sponsorship requires Gold tier or higher');
    }
    if (
      (dto.type === SponsorshipType.FORMAT_NATIONAL || dto.type === SponsorshipType.FORMAT_EXCLUSIVE_NATIONAL) &&
      !['PLATINUM', 'TITLE_SPONSOR'].includes(partner.tier)
    ) {
      throw new ForbiddenException('National format sponsorship requires Platinum tier or higher');
    }

    if (dto.type === SponsorshipType.FORMAT_CITY && !dto.city) {
      throw new BadRequestException('city is required for city-level format sponsorships');
    }

    // Check exclusivity locks
    if (dto.type === SponsorshipType.FORMAT_EXCLUSIVE_NATIONAL) {
      const existingLock = await this.prisma.partnerExclusivityLock.findFirst({
        where: {
          exclusivityType: 'format_national',
          format: dto.format as GatheringFormat,
          isActive: true,
          endDate: { gte: new Date() },
        },
      });
      if (existingLock) {
        throw new ConflictException('This format already has an exclusive national sponsor');
      }
    }

    // Check city-level limit (max 2 non-exclusive sponsors per format per city)
    if (dto.type === SponsorshipType.FORMAT_CITY) {
      const existingCitySponsors = await this.prisma.sponsorship.count({
        where: {
          type: 'FORMAT_CITY',
          format: dto.format as GatheringFormat,
          city: dto.city,
          status: { in: ['SS_APPROVED', 'SS_ACTIVE'] as SponsorshipStatus[] },
          endDate: { gte: new Date() },
        },
      });
      if (existingCitySponsors >= 2) {
        throw new ConflictException('Maximum 2 sponsors per format per city already reached');
      }
    }

    const amountCents = FORMAT_PRICING[dto.type] || 0;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : new Date(new Date(startDate).setMonth(startDate.getMonth() + 3));

    const sponsorship = await this.prisma.$transaction(async (tx) => {
      const sp = await tx.sponsorship.create({
        data: {
          partnerId: partner.id,
          type: dto.type,
          status: 'PENDING_REVIEW',
          format: dto.format as GatheringFormat,
          city: dto.city,
          startDate,
          endDate,
          amountCents,
          brandedCardsCount: dto.brandedCards?.length || 0,
          productSamplesRequired: false,
          includeProductFeedback: false,
          includeLeadCapture: false,
          notes: dto.notes,
          campaignId: dto.campaignId,
        },
      });

      // Create exclusivity lock for exclusive national
      if (dto.type === SponsorshipType.FORMAT_EXCLUSIVE_NATIONAL) {
        await tx.partnerExclusivityLock.create({
          data: {
            partnerId: partner.id,
            exclusivityType: 'format_national',
            format: dto.format as GatheringFormat,
            startDate,
            endDate,
            feeCents: amountCents,
            isActive: true,
          },
        });
      }

      await tx.partnerAuditLog.create({
        data: {
          partnerId: partner.id,
          userId,
          action: 'sponsorship.format.create',
          entityType: 'sponsorship',
          entityId: sp.id,
          newState: { type: dto.type, format: dto.format, city: dto.city, amountCents },
        },
      });

      return sp;
    });

    return sponsorship;
  }

  async getMySponsorships(userId: string, query: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { partnerId, deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [sponsorships, total] = await Promise.all([
      this.prisma.sponsorship.findMany({
        where,
        include: {
          session: {
            select: { id: true, title: true, format: true, venueCity: true, scheduledDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sponsorship.count({ where }),
    ]);

    return {
      data: sponsorships,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSponsorshipDetail(userId: string, sponsorshipId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, partnerId },
      include: {
        session: {
          select: {
            id: true, title: true, format: true, venueCity: true,
            scheduledDate: true, status: true,
          },
        },
        sponsoredCards: true,
        productFeedback: {
          select: { rating: true, comment: true, wouldPurchase: true, createdAt: true },
        },
        leads: {
          select: { id: true, status: true, createdAt: true },
        },
      },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship not found');
    return sponsorship;
  }

  async updateSponsorship(userId: string, sponsorshipId: string, dto: UpdateSponsorshipDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, partnerId },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship not found');

    if (!['SS_DRAFT', 'PENDING_REVIEW', 'PENDING_HOST_APPROVAL'].includes(sponsorship.status)) {
      throw new BadRequestException('Can only update sponsorships in draft or pending status');
    }

    return this.prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: {
        ...(dto.leaveBehindDescription !== undefined && { leaveBehindDescription: dto.leaveBehindDescription }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.productSamplesDescription && { productSamplesRequired: true }),
        ...(dto.brandedCards && { brandedCardsCount: dto.brandedCards.length }),
      },
    });
  }

  async cancelSponsorship(userId: string, sponsorshipId: string, reason: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, partnerId },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship not found');

    if (['SS_COMPLETED', 'SS_CANCELLED'].includes(sponsorship.status)) {
      throw new BadRequestException('Cannot cancel a completed or already cancelled sponsorship');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const sp = await tx.sponsorship.update({
        where: { id: sponsorshipId },
        data: { status: 'SS_CANCELLED' as SponsorshipStatus, notes: reason },
      });

      // If session was marked as sponsored, un-mark it
      if (sponsorship.sessionId) {
        await tx.session.update({
          where: { id: sponsorship.sessionId },
          data: { isSponsored: false, primarySponsorId: null, sponsorshipId: null },
        });
      }

      // Deactivate any exclusivity locks
      if (sponsorship.type.startsWith('FORMAT_')) {
        await tx.partnerExclusivityLock.updateMany({
          where: { partnerId, format: sponsorship.format, isActive: true },
          data: { isActive: false },
        });
      }

      await tx.partnerAuditLog.create({
        data: {
          partnerId,
          userId,
          action: 'sponsorship.cancel',
          entityType: 'sponsorship',
          entityId: sponsorshipId,
          newState: { reason },
        },
      });

      return sp;
    });

    return updated;
  }

  async confirmShipment(userId: string, sponsorshipId: string, trackingNumber?: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, partnerId },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship not found');

    return this.prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { productSamplesShipped: true },
    });
  }

  // Host-side methods
  async getHostSponsorshipRequests(hostUserId: string) {
    // Find the host by user ID
    const host = await this.prisma.host.findFirst({
      where: { userId: hostUserId },
    });
    if (!host) throw new NotFoundException('Host profile not found');

    return this.prisma.sponsorship.findMany({
      where: {
        hostId: host.id,
        status: 'PENDING_HOST_APPROVAL',
      },
      include: {
        partner: {
          select: {
            id: true, companyName: true, category: true, tier: true,
            logoUrl: true, description: true,
          },
        },
        session: {
          select: { id: true, title: true, format: true, scheduledDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveSponsorship(hostUserId: string, sponsorshipId: string) {
    const host = await this.prisma.host.findFirst({ where: { userId: hostUserId } });
    if (!host) throw new NotFoundException('Host profile not found');

    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, hostId: host.id, status: 'PENDING_HOST_APPROVAL' },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship request not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sponsorship.update({
        where: { id: sponsorshipId },
        data: {
          status: 'SS_APPROVED' as SponsorshipStatus,
          hostApproved: true,
          hostApprovedAt: new Date(),
        },
      });

      // Mark session as sponsored
      if (sponsorship.sessionId) {
        await tx.session.update({
          where: { id: sponsorship.sessionId },
          data: {
            isSponsored: true,
            primarySponsorId: sponsorship.partnerId,
            sponsorshipId: sponsorship.id,
            sponsorProductFeedbackEnabled: sponsorship.includeProductFeedback,
            sponsorLeadCaptureEnabled: sponsorship.includeLeadCapture,
          },
        });
      }

      return updated;
    });
  }

  async declineSponsorship(hostUserId: string, sponsorshipId: string, dto: HostDeclineDto) {
    const host = await this.prisma.host.findFirst({ where: { userId: hostUserId } });
    if (!host) throw new NotFoundException('Host profile not found');

    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, hostId: host.id, status: 'PENDING_HOST_APPROVAL' },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship request not found');

    return this.prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: {
        status: 'HOST_DECLINED',
        hostApproved: false,
        hostDeclineReason: dto.reason,
      },
    });
  }

  async counterPropose(hostUserId: string, sponsorshipId: string, dto: HostCounterProposalDto) {
    const host = await this.prisma.host.findFirst({ where: { userId: hostUserId } });
    if (!host) throw new NotFoundException('Host profile not found');

    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, hostId: host.id, status: 'PENDING_HOST_APPROVAL' },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship request not found');

    return this.prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: {
        hostCounterProposal: dto.counterProposal,
        // Status stays PENDING_HOST_APPROVAL -- partner needs to accept counter
      },
    });
  }

  async confirmReceipt(hostUserId: string, sponsorshipId: string) {
    const host = await this.prisma.host.findFirst({ where: { userId: hostUserId } });
    if (!host) throw new NotFoundException('Host profile not found');

    const sponsorship = await this.prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, hostId: host.id },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorship not found');

    return this.prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { productSamplesReceived: true },
    });
  }

  // Admin methods
  async adminListSponsorships(query: {
    status?: string;
    type?: string;
    partnerId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.partnerId) where.partnerId = query.partnerId;

    const [sponsorships, total] = await Promise.all([
      this.prisma.sponsorship.findMany({
        where,
        include: {
          partner: { select: { id: true, companyName: true, tier: true } },
          session: { select: { id: true, title: true, venueCity: true, scheduledDate: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sponsorship.count({ where }),
    ]);

    return { data: sponsorships, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adminUpdateSponsorship(sponsorshipId: string, data: {
    status?: string;
    editorialNotes?: string;
    editorialApproved?: boolean;
    adminUserId: string;
  }) {
    const sponsorship = await this.prisma.sponsorship.findUnique({ where: { id: sponsorshipId } });
    if (!sponsorship) throw new NotFoundException('Sponsorship not found');

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.editorialNotes !== undefined) updateData.editorialNotes = data.editorialNotes;
    if (data.editorialApproved !== undefined) {
      updateData.editorialApproved = data.editorialApproved;
      updateData.editorialApprovedAt = data.editorialApproved ? new Date() : null;
      updateData.editorialApprovedById = data.editorialApproved ? data.adminUserId : null;

      // If editorial approved and was PENDING_REVIEW, move to PENDING_HOST_APPROVAL
      if (data.editorialApproved && sponsorship.status === 'PENDING_REVIEW') {
        updateData.status = 'PENDING_HOST_APPROVAL';
      }
    }

    return this.prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: updateData,
    });
  }
}
