import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { CreateKitDto } from './dto/create-kit.dto';
import { RequestKitDto } from './dto/request-kit.dto';
import { v4 as uuidv4 } from 'uuid';
import { GatheringFormat, HostTier, HostKitAddOnStatus, HostKitRequestStatus } from '@prisma/client';

// Listing fee: EUR 100/month per active kit (Gold+); included for Platinum/Title
const KIT_LISTING_FEE: Record<string, number> = {
  COMMUNITY: 0, // Not available for Community
  GOLD: 10000, // EUR 100/month
  PLATINUM: 0, // Included
  TITLE_SPONSOR: 0, // Included
};

// Featured add-on: EUR 50/month
const FEATURED_FEE = 5000;

// Max 3 different kit add-ons per session
const MAX_KITS_PER_SESSION = 3;

@Injectable()
export class HostKitsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  // Partner-side: create a kit listing
  async createKit(userId: string, dto: CreateKitDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (!['GOLD', 'PLATINUM', 'TITLE_SPONSOR'].includes(partner.tier)) {
      throw new ForbiddenException('Host kit add-ons are available for Gold tier and above');
    }

    if (partner.status !== 'ACTIVE') {
      throw new ForbiddenException('Partner must be active');
    }

    const listingFeeCents = KIT_LISTING_FEE[partner.tier];
    const totalFee = listingFeeCents + (dto.isFeatured ? FEATURED_FEE : 0);

    const kit = await this.prisma.hostKitAddOn.create({
      data: {
        partnerId,
        name: dto.name,
        description: dto.description,
        contentsDescription: dto.contentsDescription,
        imageUrl: dto.imageUrl,
        targetFormats: (dto.targetFormats || []) as GatheringFormat[],
        minHostTier: dto.minHostTier as HostTier | undefined,
        quantityAvailable: dto.quantityAvailable,
        shippingLeadDays: dto.shippingLeadDays,
        status: 'HKAO_DRAFT' as HostKitAddOnStatus,
        isFeatured: dto.isFeatured || false,
        listingFeeCents: totalFee,
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'host_kit.create',
        entityType: 'host_kit_add_on',
        entityId: kit.id,
        newState: { name: dto.name, listingFeeCents: totalFee },
      },
    });

    return kit;
  }

  async getMyKits(userId: string, query: { page?: number; limit?: number }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const [kits, total] = await Promise.all([
      this.prisma.hostKitAddOn.findMany({
        where: { partnerId },
        include: {
          _count: { select: { requests: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.hostKitAddOn.count({ where: { partnerId } }),
    ]);

    return {
      data: kits.map((k) => ({ ...k, totalRequests: k._count.requests })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateKit(userId: string, kitId: string, dto: Partial<CreateKitDto>) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const kit = await this.prisma.hostKitAddOn.findFirst({
      where: { id: kitId, partnerId },
    });
    if (!kit) throw new NotFoundException('Kit not found');

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;
    if (dto.contentsDescription) updateData.contentsDescription = dto.contentsDescription;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.targetFormats) updateData.targetFormats = dto.targetFormats;
    if (dto.minHostTier !== undefined) updateData.minHostTier = dto.minHostTier;
    if (dto.quantityAvailable !== undefined) updateData.quantityAvailable = dto.quantityAvailable;
    if (dto.shippingLeadDays !== undefined) updateData.shippingLeadDays = dto.shippingLeadDays;
    if (dto.isFeatured !== undefined) updateData.isFeatured = dto.isFeatured;

    return this.prisma.hostKitAddOn.update({
      where: { id: kitId },
      data: updateData,
    });
  }

  async getKitRequests(userId: string, kitId: string, query: { status?: string }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const kit = await this.prisma.hostKitAddOn.findFirst({
      where: { id: kitId, partnerId },
    });
    if (!kit) throw new NotFoundException('Kit not found');

    const where: any = { kitId };
    if (query.status) where.status = query.status;

    return this.prisma.hostKitRequest.findMany({
      where,
      include: {
        host: {
          select: { id: true, tier: true, user: { select: { firstName: true } } },
        },
        session: {
          select: { id: true, title: true, format: true, venueCity: true, scheduledDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmKitAvailability(userId: string, kitId: string, requestId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const request = await this.prisma.hostKitRequest.findFirst({
      where: { id: requestId, kitId, partnerId, status: 'REQUESTED' },
    });
    if (!request) throw new NotFoundException('Kit request not found');

    // Generate a time-limited address share token (expires in 7 days)
    const shareToken = uuidv4();
    const shareExpires = new Date();
    shareExpires.setDate(shareExpires.getDate() + 7);

    return this.prisma.hostKitRequest.update({
      where: { id: requestId },
      data: {
        status: 'CONFIRMED',
        shippingAddressShared: true,
        shippingAddressShareToken: shareToken,
        shippingAddressShareExpires: shareExpires,
      },
    });
  }

  async confirmKitShipped(userId: string, kitId: string, requestId: string, trackingNumber?: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const request = await this.prisma.hostKitRequest.findFirst({
      where: { id: requestId, kitId, partnerId, status: 'CONFIRMED' },
    });
    if (!request) throw new NotFoundException('Kit request not found or not yet confirmed');

    const updated = await this.prisma.$transaction(async (tx) => {
      const req = await tx.hostKitRequest.update({
        where: { id: requestId },
        data: {
          status: 'HKR_SHIPPED' as HostKitRequestStatus,
          trackingNumber,
          shippedAt: new Date(),
        },
      });

      // Increment fulfilled count
      await tx.hostKitAddOn.update({
        where: { id: kitId },
        data: { quantityFulfilled: { increment: 1 } },
      });

      return req;
    });

    return updated;
  }

  // Host-side: browse available kits
  async getAvailableKits(hostUserId: string, query: { format?: string }) {
    const host = await this.prisma.host.findFirst({ where: { userId: hostUserId } });
    if (!host) throw new NotFoundException('Host profile not found');

    const where: any = {
      status: 'HKAO_ACTIVE' as HostKitAddOnStatus,
      quantityAvailable: { gt: 0 },
    };

    // Filter by host tier -- only show kits where host meets minimum tier
    // We'll do this in application logic after fetching
    if (query.format) {
      where.targetFormats = { has: query.format };
    }

    const kits = await this.prisma.hostKitAddOn.findMany({
      where,
      include: {
        partner: {
          select: { id: true, companyName: true, tier: true, logoUrl: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' }, // Featured kits first (Platinum priority)
        { averageRating: 'desc' },
      ],
    });

    // Filter by host tier eligibility
    const HOST_TIER_ORDER = ['BUDS_HOST', 'BUDS_PRO', 'FOUNDING_HOST'];
    const hostTierIndex = HOST_TIER_ORDER.indexOf(host.tier);

    return kits.filter((kit) => {
      if (!kit.minHostTier) return true;
      const minIndex = HOST_TIER_ORDER.indexOf(kit.minHostTier);
      return hostTierIndex >= minIndex;
    });
  }

  // Host-side: request a kit for a session
  async requestKit(hostUserId: string, dto: RequestKitDto) {
    const host = await this.prisma.host.findFirst({ where: { userId: hostUserId } });
    if (!host) throw new NotFoundException('Host profile not found');

    const kit = await this.prisma.hostKitAddOn.findUnique({
      where: { id: dto.kitId },
    });
    if (!kit || kit.status !== ('HKAO_ACTIVE' as HostKitAddOnStatus)) {
      throw new NotFoundException('Kit not found or not available');
    }

    if (kit.quantityAvailable <= kit.quantityFulfilled) {
      throw new BadRequestException('Kit is out of stock');
    }

    // Check max 3 kits per session
    const existingRequests = await this.prisma.hostKitRequest.count({
      where: {
        sessionId: dto.sessionId,
        status: { notIn: ['HKR_CANCELLED' as HostKitRequestStatus] },
      },
    });
    if (existingRequests >= MAX_KITS_PER_SESSION) {
      throw new BadRequestException(`Maximum ${MAX_KITS_PER_SESSION} kit add-ons per session`);
    }

    // Check no duplicate kit for same session
    const duplicate = await this.prisma.hostKitRequest.findFirst({
      where: { kitId: dto.kitId, sessionId: dto.sessionId },
    });
    if (duplicate) {
      throw new ConflictException('This kit has already been requested for this session');
    }

    return this.prisma.hostKitRequest.create({
      data: {
        kitId: dto.kitId,
        sessionId: dto.sessionId,
        hostId: host.id,
        partnerId: kit.partnerId,
        status: 'REQUESTED',
      },
    });
  }

  // Admin methods
  async adminListKits(query: { status?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;

    const [kits, total] = await Promise.all([
      this.prisma.hostKitAddOn.findMany({
        where,
        include: {
          partner: { select: { id: true, companyName: true, tier: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.hostKitAddOn.count({ where }),
    ]);

    return { data: kits, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adminReviewKit(kitId: string, data: { status: string; reviewNotes?: string; adminUserId: string }) {
    const kit = await this.prisma.hostKitAddOn.findUnique({ where: { id: kitId } });
    if (!kit) throw new NotFoundException('Kit not found');

    return this.prisma.hostKitAddOn.update({
      where: { id: kitId },
      data: {
        status: data.status as HostKitAddOnStatus,
        reviewNotes: data.reviewNotes,
        reviewedById: data.adminUserId,
        reviewedAt: new Date(),
      },
    });
  }
}
