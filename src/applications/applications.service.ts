import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    // Check for existing pending application
    const existing = await this.prisma.hostApplication.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });
    if (existing) {
      throw new ConflictException('You already have a pending application');
    }

    // Resolve referral code to host
    let referredByHostId: string | null = null;
    if (dto.referralCode) {
      const referringHost = await this.prisma.host.findUnique({
        where: { referralCode: dto.referralCode },
      });
      if (!referringHost) {
        throw new BadRequestException('Invalid referral code');
      }
      referredByHostId = referringHost.id;
    }

    // Check founding host eligibility
    const approvedHostCount = await this.prisma.host.count();
    const foundingHostEligible = approvedHostCount < 50;

    const application = await this.prisma.hostApplication.create({
      data: {
        userId,
        motivation: dto.motivation,
        gatheringVision: dto.gatheringVision,
        city: dto.city,
        weedDeUsername: dto.weedDeUsername,
        preferredFormats: dto.preferredFormats || [],
        hostingExperience: dto.hostingExperience,
        referralCode: dto.referralCode,
        referredByHostId,
        foundingHostEligible,
      },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });

    return application;
  }

  async findAll(pagination: PaginationDto, filters?: { status?: string; city?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.hostApplication.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, displayName: true } },
          referredByHost: { select: { id: true, referralCode: true, user: { select: { displayName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.hostApplication.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findById(id: string) {
    const application = await this.prisma.hostApplication.findUnique({
      where: { id },
      include: {
        user: true,
        referredByHost: {
          include: {
            user: { select: { displayName: true, firstName: true, lastName: true } },
          },
        },
        reviewer: { select: { id: true, displayName: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async review(applicationId: string, reviewerId: string, dto: ReviewApplicationDto) {
    const application = await this.prisma.hostApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) throw new NotFoundException('Application not found');

    if (dto.status === 'REJECTED' && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    // Update application
    const updated = await this.prisma.hostApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        reviewerId,
        reviewedAt: new Date(),
        reviewNotes: dto.reviewNotes,
        rejectionReason: dto.rejectionReason,
        applicationScore: dto.applicationScore,
      },
    });

    // If approved, run the approval side effects
    if (dto.status === 'APPROVED') {
      await this.approveApplication(application);
    }

    return updated;
  }

  private async approveApplication(application: any) {
    const userId = application.userId;
    const user = application.user;

    // Count current hosts to determine founding status and host number
    const hostCount = await this.prisma.host.count();
    const isFoundingHost = hostCount < 50;

    // Generate referral code: BUDS-FIRSTNAME-XXXX
    const code = `BUDS-${user.firstName.toUpperCase().slice(0, 6)}-${uuidv4().slice(0, 4).toUpperCase()}`;

    // Create host record
    const host = await this.prisma.host.create({
      data: {
        userId,
        applicationId: application.id,
        tier: isFoundingHost ? 'FOUNDING_HOST' : 'BUDS_HOST',
        referralCode: code,
        specialties: application.preferredFormats || [],
      },
    });

    // Update user role to HOST
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'HOST' },
    });

    // Create welcome pack
    await this.prisma.welcomePack.create({
      data: {
        hostId: host.id,
        variant: isFoundingHost ? 'FOUNDING_HOST_LIMITED_EDITION' : 'STANDARD',
        shippingName: `${user.firstName} ${user.lastName}`,
        shippingAddressLine1: 'TBD',
        shippingCity: user.city,
        shippingPostalCode: 'TBD',
        shippingCountryCode: user.countryCode,
      },
    });

    // If referred, update the referral record
    if (application.referredByHostId) {
      await this.prisma.hostReferral.create({
        data: {
          referringHostId: application.referredByHostId,
          referredApplicationId: application.id,
          referredUserId: userId,
          referralCodeUsed: application.referralCode,
          status: 'approved',
        },
      });
    }

    // Create notification for the user
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'APPLICATION_APPROVED',
        channel: 'EMAIL',
        title: 'Your Buds Sessions application has been approved!',
        body: `Welcome to Buds Sessions, ${user.firstName}! You are now Host #${host.hostNumber}. ${isFoundingHost ? 'Congratulations on being a Founding Host!' : ''} Your welcome pack is on its way.`,
        data: { hostId: host.id, hostNumber: host.hostNumber, tier: host.tier },
      },
    });

    return host;
  }
}
