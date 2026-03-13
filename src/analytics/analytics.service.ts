import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminOverview() {
    const [
      totalHosts,
      activeHosts,
      totalGuests,
      totalSessions,
      verifiedSessions,
      liveSessions,
      totalApplications,
      pendingApplications,
      totalPointsInCirculation,
    ] = await Promise.all([
      this.prisma.host.count({ where: { deletedAt: null } }),
      this.prisma.host.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'GUEST', deletedAt: null } }),
      this.prisma.session.count({ where: { deletedAt: null } }),
      this.prisma.session.count({ where: { status: 'VERIFIED' } }),
      this.prisma.session.count({ where: { status: 'LIVE' } }),
      this.prisma.hostApplication.count(),
      this.prisma.hostApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.host.aggregate({ _sum: { pointsBalance: true } }),
    ]);

    // Hosts by tier
    const hostsByTier = await this.prisma.host.groupBy({
      by: ['tier'],
      _count: true,
      where: { deletedAt: null },
    });

    // Sessions by format
    const sessionsByFormat = await this.prisma.session.groupBy({
      by: ['format'],
      _count: true,
      where: { deletedAt: null },
    });

    // Sessions by status
    const sessionsByStatus = await this.prisma.session.groupBy({
      by: ['status'],
      _count: true,
      where: { deletedAt: null },
    });

    // Average session rating
    const avgRating = await this.prisma.session.aggregate({
      _avg: { averageFeedbackRating: true },
      where: { averageFeedbackRating: { not: null } },
    });

    return {
      totalHosts,
      activeHosts,
      totalGuests,
      totalSessions,
      verifiedSessions,
      liveSessions,
      totalApplications,
      pendingApplications,
      totalPointsInCirculation: totalPointsInCirculation._sum.pointsBalance || 0,
      averageSessionRating: avgRating._avg.averageFeedbackRating,
      hostsByTier: hostsByTier.reduce((acc, h) => { acc[h.tier] = h._count; return acc; }, {} as Record<string, number>),
      sessionsByFormat: sessionsByFormat.reduce((acc, s) => { acc[s.format] = s._count; return acc; }, {} as Record<string, number>),
      sessionsByStatus: sessionsByStatus.reduce((acc, s) => { acc[s.status] = s._count; return acc; }, {} as Record<string, number>),
    };
  }

  async getHostAnalytics(hostId: string) {
    const host = await this.prisma.host.findUnique({
      where: { id: hostId },
      include: {
        user: { select: { city: true } },
      },
    });
    if (!host) return null;

    // Session history summary
    const sessions = await this.prisma.session.findMany({
      where: { hostId, status: 'VERIFIED' },
      select: {
        id: true,
        format: true,
        scheduledDate: true,
        averageFeedbackRating: true,
        totalFeedbackCount: true,
        _count: { select: { guests: { where: { rsvpStatus: 'CHECKED_IN' } } } },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    // Rating trends
    const ratingsByFormat = await this.prisma.guestFeedback.aggregate({
      where: { hostId },
      _avg: { overallRating: true, atmosphereRating: true, hostRating: true, conversationQuality: true },
    });

    // Repeat guest rate
    const totalUniqueGuests = await this.prisma.sessionGuest.findMany({
      where: {
        session: { hostId },
        rsvpStatus: 'CHECKED_IN',
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    const guestAttendanceCounts = await this.prisma.sessionGuest.groupBy({
      by: ['userId'],
      where: {
        session: { hostId },
        rsvpStatus: 'CHECKED_IN',
      },
      _count: true,
    });

    const repeatGuests = guestAttendanceCounts.filter(g => g._count >= 2).length;
    const repeatGuestRate = totalUniqueGuests.length > 0
      ? repeatGuests / totalUniqueGuests.length
      : 0;

    // Points earned per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pointTransactions = await this.prisma.pointTransaction.findMany({
      where: { hostId, amount: { gt: 0 }, createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    return {
      host: {
        tier: host.tier,
        totalSessionsHosted: host.totalSessionsHosted,
        totalGuestsHosted: host.totalGuestsHosted,
        averageRating: host.averageRating,
        pointsBalance: host.pointsBalance,
        pointsLifetimeEarned: host.pointsLifetimeEarned,
      },
      sessions,
      ratingAverages: ratingsByFormat._avg || {},
      repeatGuestRate,
      totalUniqueGuests: totalUniqueGuests.length,
      repeatGuests,
      recentPointTransactions: pointTransactions,
    };
  }

  async getSessionsByCity() {
    const result = await this.prisma.session.groupBy({
      by: ['venueCity'],
      _count: true,
      where: { deletedAt: null, status: { not: 'CANCELLED' } },
      orderBy: { _count: { venueCity: 'desc' } },
      take: 20,
    });
    return result.map(r => ({ city: r.venueCity, count: r._count }));
  }

  async getApplicationFunnel() {
    const statuses = await this.prisma.hostApplication.groupBy({
      by: ['status'],
      _count: true,
    });
    return statuses.reduce((acc, s) => { acc[s.status] = s._count; return acc; }, {} as Record<string, number>);
  }

  async getPointsEconomyOverview() {
    const [totalIssued, totalRedeemed, totalInCirculation] = await Promise.all([
      this.prisma.pointTransaction.aggregate({
        _sum: { amount: true },
        where: { amount: { gt: 0 } },
      }),
      this.prisma.pointTransaction.aggregate({
        _sum: { amount: true },
        where: { amount: { lt: 0 } },
      }),
      this.prisma.host.aggregate({
        _sum: { pointsBalance: true },
      }),
    ]);

    const byType = await this.prisma.pointTransaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalIssued: totalIssued._sum.amount || 0,
      totalRedeemed: Math.abs(totalRedeemed._sum.amount || 0),
      totalInCirculation: totalInCirculation._sum.pointsBalance || 0,
      byType: byType.reduce((acc, t) => {
        acc[t.type] = { total: t._sum.amount, count: t._count };
        return acc;
      }, {} as Record<string, any>),
    };
  }
}
