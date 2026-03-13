import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async adjustPoints(adminId: string, data: {
    hostId: string;
    amount: number;
    reason: string;
    category: string;
  }) {
    const host = await this.prisma.host.findUnique({ where: { id: data.hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const newBalance = host.pointsBalance + data.amount;

    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId: host.userId,
        hostId: host.id,
        type: 'MANUAL_ADJUSTMENT',
        amount: data.amount,
        baseAmount: Math.abs(data.amount),
        multiplier: 1.0,
        balanceAfter: newBalance,
        description: `Manual adjustment (${data.category}): ${data.reason}`,
        adminId,
        adminNote: data.reason,
      },
    });

    await this.prisma.host.update({
      where: { id: data.hostId },
      data: {
        pointsBalance: newBalance,
        ...(data.amount > 0
          ? { pointsLifetimeEarned: { increment: data.amount } }
          : { pointsLifetimeSpent: { increment: Math.abs(data.amount) } }),
      },
    });

    // Audit log
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'points.adjust',
        entityType: 'host',
        entityId: data.hostId,
        previousState: { pointsBalance: host.pointsBalance },
        newState: { pointsBalance: newBalance, adjustment: data.amount },
        notes: `${data.category}: ${data.reason}`,
      },
    });

    // Notification to host
    await this.prisma.notification.create({
      data: {
        userId: host.userId,
        type: 'POINTS_EARNED',
        channel: 'IN_APP',
        title: data.amount > 0 ? 'Points added to your account' : 'Points adjustment',
        body: `${Math.abs(data.amount)} Buds have been ${data.amount > 0 ? 'added to' : 'removed from'} your account. Reason: ${data.reason}`,
        data: { amount: data.amount, newBalance },
      },
    });

    return transaction;
  }

  async suspendHost(adminId: string, hostId: string, reason: string) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const updated = await this.prisma.host.update({
      where: { id: hostId },
      data: {
        status: 'SUSPENDED',
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedById: adminId,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'host.suspend',
        entityType: 'host',
        entityId: hostId,
        previousState: { status: host.status },
        newState: { status: 'SUSPENDED', reason },
      },
    });

    return updated;
  }

  async unsuspendHost(adminId: string, hostId: string) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const updated = await this.prisma.host.update({
      where: { id: hostId },
      data: {
        status: 'ACTIVE',
        suspensionReason: null,
        suspendedAt: null,
        suspendedById: null,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'host.unsuspend',
        entityType: 'host',
        entityId: hostId,
        previousState: { status: 'SUSPENDED' },
        newState: { status: 'ACTIVE' },
      },
    });

    return updated;
  }

  async flagSession(adminId: string, sessionId: string, reason: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'FLAGGED',
        flagReason: reason,
        flaggedAt: new Date(),
        flaggedById: adminId,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'session.flag',
        entityType: 'session',
        entityId: sessionId,
        previousState: { status: session.status },
        newState: { status: 'FLAGGED', reason },
      },
    });

    return updated;
  }

  async getAuditLog(pagination: PaginationDto, filters?: { adminId?: string; entityType?: string; action?: string }) {
    const where: any = {};
    if (filters?.adminId) where.adminId = filters.adminId;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.action) where.action = { contains: filters.action };

    const [data, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        include: {
          admin: { select: { displayName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async getLiveSessions() {
    return this.prisma.session.findMany({
      where: { status: 'LIVE' },
      include: {
        host: {
          include: {
            user: { select: { displayName: true, firstName: true } },
          },
        },
        _count: {
          select: {
            guests: { where: { rsvpStatus: 'CHECKED_IN' } },
            incidents: { where: { resolvedAt: null } },
          },
        },
      },
      orderBy: { actualStartTime: 'asc' },
    });
  }

  async getChurnRiskHosts() {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    return this.prisma.host.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        OR: [
          { lastSessionAt: { lt: sixtyDaysAgo } },
          { lastSessionAt: null, createdAt: { lt: sixtyDaysAgo } },
        ],
      },
      include: {
        user: { select: { displayName: true, city: true, lastLoginAt: true } },
      },
      orderBy: { lastSessionAt: 'asc' },
    });
  }
}
