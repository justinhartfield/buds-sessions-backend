import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPartnerDto, BusinessCategory } from './dto/register-partner.dto';
import { UpdatePartnerDto, InviteTeamMemberDto, UpdateTeamMemberDto } from './dto/update-partner.dto';
import { ComplianceTier, PartnerStatus, PartnerTier, SponsorshipStatus } from '@prisma/client';

const COMPLIANCE_TIER_MAP: Record<BusinessCategory, string> = {
  [BusinessCategory.PHARMACY]: 'HIGH',
  [BusinessCategory.MANUFACTURER]: 'HIGH',
  [BusinessCategory.DOCTOR]: 'HIGH',
  [BusinessCategory.CANNABIS_SOCIAL_CLUB]: 'HIGH',
  [BusinessCategory.CBD_STORE]: 'MEDIUM',
  [BusinessCategory.WELLNESS_SPA]: 'MEDIUM',
  [BusinessCategory.RESTAURANT_CAFE]: 'LOW',
  [BusinessCategory.SMOKE_SHOP]: 'LOW',
  [BusinessCategory.MUSIC_VENUE]: 'LOW',
  [BusinessCategory.FOOD_BEVERAGE]: 'LOW',
  [BusinessCategory.LIFESTYLE_ACCESSORIES]: 'LOW',
  [BusinessCategory.OTHER]: 'MEDIUM',
};

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterPartnerDto, userId: string) {
    // Check if user already belongs to a partner org
    const existingMembership = await this.prisma.partnerTeamMember.findFirst({
      where: { userId, removedAt: null },
    });
    if (existingMembership) {
      throw new ConflictException('User already belongs to a partner organization');
    }

    const complianceTier = COMPLIANCE_TIER_MAP[dto.category];

    const partner = await this.prisma.$transaction(async (tx) => {
      const org = await tx.partnerOrganization.create({
        data: {
          companyName: dto.companyName,
          legalName: dto.legalName,
          category: dto.category,
          complianceTier: complianceTier as ComplianceTier,
          tier: 'COMMUNITY',
          status: 'PENDING_VERIFICATION',
          website: dto.website,
          description: dto.description,
          primaryContactEmail: dto.primaryContactEmail,
          primaryContactName: dto.primaryContactName,
          primaryContactPhone: dto.primaryContactPhone,
          billingEmail: dto.billingEmail,
          streetAddress: dto.streetAddress,
          city: dto.city,
          postalCode: dto.postalCode,
          countryCode: dto.countryCode,
          taxId: dto.taxId,
          handelsregisterNumber: dto.handelsregisterNumber,
          verificationStatus: 'PENDING',
        },
      });

      // Create team membership for the registering user as PARTNER_ADMIN
      await tx.partnerTeamMember.create({
        data: {
          partnerId: org.id,
          userId,
          role: 'PARTNER_ADMIN',
          isPrimaryContact: true,
          acceptedAt: new Date(),
        },
      });

      // Log the registration in the audit log
      await tx.partnerAuditLog.create({
        data: {
          partnerId: org.id,
          userId,
          action: 'partner.register',
          entityType: 'partner_organization',
          entityId: org.id,
          newState: {
            companyName: org.companyName,
            category: org.category,
            tier: org.tier,
          },
        },
      });

      return org;
    });

    return partner;
  }

  async getPartnerForUser(userId: string) {
    const membership = await this.prisma.partnerTeamMember.findFirst({
      where: { userId, removedAt: null },
      include: { partner: true },
    });
    if (!membership) {
      throw new NotFoundException('No partner organization found for this user');
    }
    return membership.partner;
  }

  async getPartnerIdForUser(userId: string): Promise<string> {
    const partner = await this.getPartnerForUser(userId);
    return partner.id;
  }

  async getUserPartnerRole(userId: string): Promise<string | null> {
    const membership = await this.prisma.partnerTeamMember.findFirst({
      where: { userId, removedAt: null },
    });
    return membership?.role ?? null;
  }

  async getMe(userId: string) {
    const membership = await this.prisma.partnerTeamMember.findFirst({
      where: { userId, removedAt: null },
      include: {
        partner: {
          include: {
            _count: {
              select: {
                sponsorships: true,
                teamMembers: { where: { removedAt: null } },
              },
            },
          },
        },
      },
    });
    if (!membership) {
      throw new NotFoundException('No partner organization found for this user');
    }

    const partner = membership.partner;
    return {
      ...partner,
      currentUserRole: membership.role,
      teamSize: partner._count.teamMembers,
      totalSponsorships: partner._count.sponsorships,
    };
  }

  async updateMe(userId: string, dto: UpdatePartnerDto) {
    const partnerId = await this.getPartnerIdForUser(userId);
    await this.assertPartnerRole(userId, ['PARTNER_ADMIN']);

    const updated = await this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: {
        ...(dto.companyName && { companyName: dto.companyName }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.primaryContactName && { primaryContactName: dto.primaryContactName }),
        ...(dto.primaryContactEmail && { primaryContactEmail: dto.primaryContactEmail }),
        ...(dto.primaryContactPhone !== undefined && { primaryContactPhone: dto.primaryContactPhone }),
        ...(dto.billingEmail && { billingEmail: dto.billingEmail }),
        ...(dto.streetAddress && { streetAddress: dto.streetAddress }),
        ...(dto.city && { city: dto.city }),
        ...(dto.postalCode && { postalCode: dto.postalCode }),
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'partner.update',
        entityType: 'partner_organization',
        entityId: partnerId,
        newState: dto as any,
      },
    });

    return updated;
  }

  async uploadLogo(userId: string, logoUrl: string) {
    const partnerId = await this.getPartnerIdForUser(userId);
    return this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: { logoUrl },
    });
  }

  async uploadVerificationDocs(userId: string, documentUrls: string[]) {
    const partnerId = await this.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    const existingDocs = (partner.verificationDocumentsUrls as string[]) || [];
    const allDocs = [...existingDocs, ...documentUrls];

    const updated = await this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: {
        verificationDocumentsUrls: allDocs,
        verificationStatus: 'IN_REVIEW',
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'partner.verification_docs_uploaded',
        entityType: 'partner_organization',
        entityId: partnerId,
        newState: { documentsCount: allDocs.length },
      },
    });

    return updated;
  }

  // Team management
  async getTeamMembers(userId: string) {
    const partnerId = await this.getPartnerIdForUser(userId);
    return this.prisma.partnerTeamMember.findMany({
      where: { partnerId, removedAt: null },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteTeamMember(userId: string, dto: InviteTeamMemberDto) {
    const partnerId = await this.getPartnerIdForUser(userId);
    await this.assertPartnerRole(userId, ['PARTNER_ADMIN']);

    // Find or validate the invited user by email
    const invitedUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!invitedUser) {
      throw new NotFoundException('No user found with this email. They must create an account first.');
    }

    // Check if already a member
    const existing = await this.prisma.partnerTeamMember.findFirst({
      where: { partnerId, userId: invitedUser.id, removedAt: null },
    });
    if (existing) {
      throw new ConflictException('User is already a team member');
    }

    const member = await this.prisma.partnerTeamMember.create({
      data: {
        partnerId,
        userId: invitedUser.id,
        role: dto.role,
        invitedAt: new Date(),
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'partner.team_member_invited',
        entityType: 'partner_team_member',
        entityId: member.id,
        newState: { email: dto.email, role: dto.role },
      },
    });

    return member;
  }

  async updateTeamMember(userId: string, memberId: string, dto: UpdateTeamMemberDto) {
    const partnerId = await this.getPartnerIdForUser(userId);
    await this.assertPartnerRole(userId, ['PARTNER_ADMIN']);

    const member = await this.prisma.partnerTeamMember.findFirst({
      where: { id: memberId, partnerId, removedAt: null },
    });
    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    // Cannot change the primary contact's role
    if (member.isPrimaryContact && dto.role !== 'PARTNER_ADMIN') {
      throw new BadRequestException('Cannot change the primary contact role from PARTNER_ADMIN');
    }

    return this.prisma.partnerTeamMember.update({
      where: { id: memberId },
      data: { role: dto.role },
    });
  }

  async removeTeamMember(userId: string, memberId: string) {
    const partnerId = await this.getPartnerIdForUser(userId);
    await this.assertPartnerRole(userId, ['PARTNER_ADMIN']);

    const member = await this.prisma.partnerTeamMember.findFirst({
      where: { id: memberId, partnerId, removedAt: null },
    });
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    if (member.isPrimaryContact) {
      throw new BadRequestException('Cannot remove the primary contact');
    }
    if (member.userId === userId) {
      throw new BadRequestException('Cannot remove yourself. Transfer primary contact first.');
    }

    return this.prisma.partnerTeamMember.update({
      where: { id: memberId },
      data: { removedAt: new Date() },
    });
  }

  // Public directory
  async getDirectory(query: {
    city?: string;
    category?: string;
    tier?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
      deletedAt: null,
    };

    if (query.city) where.city = query.city;
    if (query.category) where.category = query.category;
    if (query.tier) where.tier = query.tier;

    const [partners, total] = await Promise.all([
      this.prisma.partnerOrganization.findMany({
        where,
        select: {
          id: true,
          companyName: true,
          category: true,
          tier: true,
          website: true,
          description: true,
          logoUrl: true,
          coverImageUrl: true,
          city: true,
        },
        orderBy: [
          { tier: 'desc' }, // Title > Platinum > Gold > Community
          { companyName: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.partnerOrganization.count({ where }),
    ]);

    return {
      data: partners,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin methods
  async adminListPartners(query: {
    status?: string;
    tier?: string;
    category?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.tier) where.tier = query.tier;
    if (query.category) where.category = query.category;
    if (query.city) where.city = query.city;

    const [partners, total] = await Promise.all([
      this.prisma.partnerOrganization.findMany({
        where,
        include: {
          _count: {
            select: { sponsorships: true, teamMembers: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.partnerOrganization.count({ where }),
    ]);

    return { data: partners, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adminGetPartner(partnerId: string) {
    const partner = await this.prisma.partnerOrganization.findUnique({
      where: { id: partnerId },
      include: {
        teamMembers: { where: { removedAt: null } },
        sponsorships: { orderBy: { createdAt: 'desc' }, take: 20 },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async adminUpdateStatus(partnerId: string, status: string, reason: string, adminUserId: string) {
    const partner = await this.prisma.partnerOrganization.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const previousStatus = partner.status;
    const updated = await this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: {
        status: status as PartnerStatus,
        ...(status === 'CHURNED' && { churnedAt: new Date(), churnReason: reason }),
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId: adminUserId,
        action: 'admin.partner.status_change',
        entityType: 'partner_organization',
        entityId: partnerId,
        previousState: { status: previousStatus },
        newState: { status, reason },
      },
    });

    return updated;
  }

  async adminUpdateTier(partnerId: string, tier: string, reason: string, adminUserId: string) {
    const partner = await this.prisma.partnerOrganization.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const previousTier = partner.tier;
    const updated = await this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: { tier: tier as PartnerTier },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId: adminUserId,
        action: 'admin.partner.tier_change',
        entityType: 'partner_organization',
        entityId: partnerId,
        previousState: { tier: previousTier },
        newState: { tier, reason },
      },
    });

    return updated;
  }

  async adminVerifyPartner(partnerId: string, verificationNotes: string, adminUserId: string) {
    const partner = await this.prisma.partnerOrganization.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    if (partner.verificationStatus === 'VERIFIED') {
      throw new ConflictException('Partner is already verified');
    }

    const updated = await this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: adminUserId,
        verificationNotes,
        status: 'ACTIVE',
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId: adminUserId,
        action: 'admin.partner.verified',
        entityType: 'partner_organization',
        entityId: partnerId,
        newState: { verificationNotes },
      },
    });

    return updated;
  }

  async adminRejectPartner(partnerId: string, rejectionReason: string, adminUserId: string) {
    const partner = await this.prisma.partnerOrganization.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const updated = await this.prisma.partnerOrganization.update({
      where: { id: partnerId },
      data: {
        verificationStatus: 'REJECTED',
        verificationNotes: rejectionReason,
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId: adminUserId,
        action: 'admin.partner.rejected',
        entityType: 'partner_organization',
        entityId: partnerId,
        newState: { rejectionReason },
      },
    });

    return updated;
  }

  async adminGetRevenue(query: { dateFrom?: string; dateTo?: string; groupBy?: string }) {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(new Date().getFullYear(), 0, 1);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    const [subscriptionRevenue, sponsorshipRevenue, invoiceRevenue] = await Promise.all([
      this.prisma.partnerSubscription.aggregate({
        where: {
          status: 'active',
          currentPeriodStart: { gte: dateFrom },
          currentPeriodEnd: { lte: dateTo },
        },
        _sum: { monthlyAmountCents: true },
        _count: true,
      }),
      this.prisma.sponsorship.aggregate({
        where: {
          status: { in: ['SS_ACTIVE', 'SS_COMPLETED'] as SponsorshipStatus[] },
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.partnerInvoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: dateFrom, lte: dateTo },
        },
        _sum: { totalCents: true },
        _count: true,
      }),
    ]);

    return {
      period: { from: dateFrom, to: dateTo },
      subscriptionRevenue: {
        totalCents: subscriptionRevenue._sum.monthlyAmountCents || 0,
        count: subscriptionRevenue._count,
      },
      sponsorshipRevenue: {
        totalCents: sponsorshipRevenue._sum?.amountCents || 0,
        count: sponsorshipRevenue._count,
      },
      invoiceRevenue: {
        totalCents: invoiceRevenue._sum.totalCents || 0,
        count: invoiceRevenue._count,
      },
    };
  }

  // Helpers
  private async assertPartnerRole(userId: string, allowedRoles: string[]) {
    const role = await this.getUserPartnerRole(userId);
    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient partner role');
    }
  }
}
