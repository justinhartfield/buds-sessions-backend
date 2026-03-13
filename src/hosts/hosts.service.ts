import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHostDto } from './dto/update-host.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class HostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, filters?: {
    tier?: string;
    status?: string;
    city?: string;
  }) {
    const where: any = { deletedAt: null };
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.status) where.status = filters.status;
    if (filters?.city) {
      where.user = { city: { contains: filters.city, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      this.prisma.host.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, email: true, firstName: true, lastName: true,
              displayName: true, city: true, avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.host.count({ where }),
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
    const host = await this.prisma.host.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true, lastName: true,
            displayName: true, city: true, avatarUrl: true, countryCode: true,
          },
        },
        welcomePack: true,
        milestones: true,
      },
    });
    if (!host || host.deletedAt) throw new NotFoundException('Host not found');
    return host;
  }

  async findByUserId(userId: string) {
    const host = await this.prisma.host.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true, lastName: true,
            displayName: true, city: true, avatarUrl: true,
          },
        },
        welcomePack: { select: { status: true, variant: true, trackingNumber: true } },
        milestones: true,
      },
    });
    if (!host) throw new NotFoundException('Host profile not found');
    return host;
  }

  async update(hostId: string, userId: string, dto: UpdateHostDto) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');
    if (host.userId !== userId) throw new ForbiddenException();

    return this.prisma.host.update({
      where: { id: hostId },
      data: {
        bio: dto.bio,
        specialties: dto.specialties,
      },
    });
  }

  async getPointsHistory(hostId: string, pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where: { hostId },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.pointTransaction.count({ where: { hostId } }),
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

  async getTierProgress(hostId: string) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const sessionsToProTier = 5;
    const currentSessions = host.totalSessionsHosted;
    const progress = Math.min(currentSessions / sessionsToProTier, 1);

    return {
      currentTier: host.tier,
      hostNumber: host.hostNumber,
      totalSessionsHosted: currentSessions,
      sessionsToNextTier: host.tier === 'BUDS_HOST' ? Math.max(0, sessionsToProTier - currentSessions) : 0,
      progress,
      pointsBalance: host.pointsBalance,
      pointsLifetimeEarned: host.pointsLifetimeEarned,
      earningMultiplier: host.tier === 'BUDS_HOST' ? 1.0 : 1.5,
    };
  }

  async checkTierPromotion(hostId: string) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host || host.tier !== 'BUDS_HOST') return null;

    if (host.totalSessionsHosted >= 5) {
      const updated = await this.prisma.host.update({
        where: { id: hostId },
        data: {
          tier: 'BUDS_PRO',
          tierPromotedAt: new Date(),
        },
      });

      // Award milestone bonus
      const balanceAfter = host.pointsBalance + 500;
      await this.prisma.pointTransaction.create({
        data: {
          userId: host.userId,
          hostId: host.id,
          type: 'FIVE_SESSION_MILESTONE',
          amount: 500,
          baseAmount: 500,
          multiplier: 1.0,
          balanceAfter,
          description: 'Milestone bonus: 5 sessions hosted! Promoted to Buds Pro.',
        },
      });

      await this.prisma.host.update({
        where: { id: hostId },
        data: {
          pointsBalance: balanceAfter,
          pointsLifetimeEarned: { increment: 500 },
        },
      });

      // Create milestone record
      await this.prisma.hostMilestone.create({
        data: {
          hostId,
          milestoneKey: 'five_sessions',
          achievedAt: new Date(),
        },
      });

      // Notification
      await this.prisma.notification.create({
        data: {
          userId: host.userId,
          type: 'TIER_UPGRADED',
          channel: 'IN_APP',
          title: 'Congratulations! You are now a Buds Pro host!',
          body: 'You have hosted 5 sessions and earned your Buds Pro status. You now earn 1.5x points on all sessions!',
          data: { tier: 'BUDS_PRO', bonus: 500 },
        },
      });

      return updated;
    }

    return null;
  }

  async suspend(hostId: string, adminId: string, reason: string) {
    return this.prisma.host.update({
      where: { id: hostId },
      data: {
        status: 'SUSPENDED',
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedById: adminId,
      },
    });
  }

  async unsuspend(hostId: string) {
    return this.prisma.host.update({
      where: { id: hostId },
      data: {
        status: 'ACTIVE',
        suspensionReason: null,
        suspendedAt: null,
        suspendedById: null,
      },
    });
  }
}
