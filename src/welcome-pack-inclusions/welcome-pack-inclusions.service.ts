import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { CreateInclusionDto } from './dto/create-inclusion.dto';
import { WelcomePackInclusionStatus } from '@prisma/client';

// Quarterly submission limits by tier
const QUARTERLY_LIMITS: Record<string, number> = {
  COMMUNITY: 1,
  GOLD: 3,
  PLATINUM: 3, // 1 guaranteed/month = effectively 3/quarter but always included
  TITLE_SPONSOR: Infinity,
};

// Fee in EUR cents per submission by tier
const SUBMISSION_FEES: Record<string, number> = {
  COMMUNITY: 20000, // EUR 200/quarter
  GOLD: 15000, // EUR 150 for additional beyond included
  PLATINUM: 10000, // EUR 100 for additional beyond included
  TITLE_SPONSOR: 0,
};

@Injectable()
export class WelcomePackInclusionsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  async createInclusion(userId: string, dto: CreateInclusionDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (partner.status !== 'ACTIVE') {
      throw new ForbiddenException('Partner must be active to submit welcome pack inclusions');
    }

    // Check quarterly submission limits
    const quarterStart = this.getQuarterStart(dto.targetQuarter);
    const quarterEnd = this.getQuarterEnd(dto.targetQuarter);

    const existingSubmissions = await this.prisma.welcomePackInclusion.count({
      where: {
        partnerId,
        targetQuarter: dto.targetQuarter,
        status: { notIn: ['WPI_REJECTED', 'WITHDRAWN'] as WelcomePackInclusionStatus[] },
      },
    });

    const limit = QUARTERLY_LIMITS[partner.tier];
    if (existingSubmissions >= limit) {
      throw new BadRequestException(
        `Quarterly submission limit reached (${limit} per quarter for ${partner.tier} tier)`,
      );
    }

    const feeAmountCents = SUBMISSION_FEES[partner.tier];

    // For Gold tier, first submission is included; subsequent ones are charged
    const effectiveFee =
      partner.tier === 'GOLD' && existingSubmissions === 0
        ? 0
        : partner.tier === 'PLATINUM'
          ? existingSubmissions === 0
            ? 0
            : feeAmountCents
          : feeAmountCents;

    // Compute rotation priority based on tier
    let rotationPriority = 0;
    if (partner.tier === 'TITLE_SPONSOR') rotationPriority = 100;
    else if (partner.tier === 'PLATINUM') rotationPriority = 75;
    else if (partner.tier === 'GOLD') rotationPriority = 50;
    else rotationPriority = 25;

    const inclusion = await this.prisma.welcomePackInclusion.create({
      data: {
        partnerId,
        productName: dto.productName,
        productDescription: dto.productDescription,
        productImageUrl: dto.productImageUrl,
        productDimensions: dto.productDimensions,
        productWeightGrams: dto.productWeightGrams,
        quantityAvailable: dto.quantityAvailable,
        targetQuarter: dto.targetQuarter,
        rotationPriority,
        feeAmountCents: effectiveFee,
        status: 'SUBMITTED',
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'welcome_pack_inclusion.submit',
        entityType: 'welcome_pack_inclusion',
        entityId: inclusion.id,
        newState: { productName: dto.productName, targetQuarter: dto.targetQuarter, feeAmountCents: effectiveFee },
      },
    });

    return inclusion;
  }

  async getMyInclusions(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { partnerId };
    if (query.status) where.status = query.status;

    const [inclusions, total] = await Promise.all([
      this.prisma.welcomePackInclusion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.welcomePackInclusion.count({ where }),
    ]);

    return {
      data: inclusions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInclusionDetail(userId: string, inclusionId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const inclusion = await this.prisma.welcomePackInclusion.findFirst({
      where: { id: inclusionId, partnerId },
    });
    if (!inclusion) throw new NotFoundException('Welcome pack inclusion not found');
    return inclusion;
  }

  // Admin methods
  async adminListInclusions(query: { status?: string; quarter?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.quarter) where.targetQuarter = query.quarter;

    const [inclusions, total] = await Promise.all([
      this.prisma.welcomePackInclusion.findMany({
        where,
        include: {
          partner: { select: { id: true, companyName: true, tier: true, category: true } },
        },
        orderBy: [{ rotationPriority: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.welcomePackInclusion.count({ where }),
    ]);

    return { data: inclusions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adminReviewInclusion(
    inclusionId: string,
    data: { status: string; reviewNotes?: string; rejectionReason?: string; adminUserId: string },
  ) {
    const inclusion = await this.prisma.welcomePackInclusion.findUnique({ where: { id: inclusionId } });
    if (!inclusion) throw new NotFoundException('Welcome pack inclusion not found');

    // Ensure no two products from the same business category in the same pack
    if (data.status === 'APPROVED') {
      const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
        where: { id: inclusion.partnerId },
      });

      const sameQuarterSameCategory = await this.prisma.welcomePackInclusion.findFirst({
        where: {
          targetQuarter: inclusion.targetQuarter,
          status: { in: ['WPI_APPROVED', 'IN_ROTATION'] as WelcomePackInclusionStatus[] },
          id: { not: inclusionId },
          partner: { category: partner.category },
        },
      });

      if (sameQuarterSameCategory) {
        throw new BadRequestException(
          `Another product from the same business category (${partner.category}) is already approved for ${inclusion.targetQuarter}. No two products from the same category in the same pack.`,
        );
      }
    }

    return this.prisma.welcomePackInclusion.update({
      where: { id: inclusionId },
      data: {
        status: data.status as WelcomePackInclusionStatus,
        reviewNotes: data.reviewNotes,
        rejectionReason: data.rejectionReason,
        reviewedById: data.adminUserId,
        reviewedAt: new Date(),
      },
    });
  }

  private getQuarterStart(quarter: string): Date {
    const [year, q] = quarter.split('-Q');
    const month = (parseInt(q) - 1) * 3;
    return new Date(parseInt(year), month, 1);
  }

  private getQuarterEnd(quarter: string): Date {
    const [year, q] = quarter.split('-Q');
    const month = parseInt(q) * 3;
    return new Date(parseInt(year), month, 0);
  }
}
