import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(hostId: string, dto: CreateSessionDto) {
    // Validate: no overlapping sessions for this host on same date
    const existing = await this.prisma.session.findFirst({
      where: {
        hostId,
        scheduledDate: new Date(dto.scheduledDate),
        status: { notIn: ['CANCELLED', 'REJECTED'] },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException('You already have a session scheduled on this date');
    }

    // Validate: max 2 sessions per week
    const weekStart = new Date(dto.scheduledDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekCount = await this.prisma.session.count({
      where: {
        hostId,
        scheduledDate: { gte: weekStart, lt: weekEnd },
        status: { notIn: ['CANCELLED', 'REJECTED'] },
        deletedAt: null,
      },
    });
    if (weekCount >= 2) {
      throw new BadRequestException('Maximum 2 sessions per week');
    }

    const session = await this.prisma.session.create({
      data: {
        hostId,
        title: dto.title,
        description: dto.description,
        format: dto.format,
        customFormatName: dto.customFormatName,
        scheduledDate: new Date(dto.scheduledDate),
        scheduledStartTime: new Date(`1970-01-01T${dto.scheduledStartTime}:00`),
        scheduledEndTime: new Date(`1970-01-01T${dto.scheduledEndTime}:00`),
        timezone: dto.timezone || 'Europe/Berlin',
        venueType: dto.venueType,
        venueName: dto.venueName,
        venueAddress: dto.venueAddress,
        venueCity: dto.venueCity,
        venueCountryCode: dto.venueCountryCode || 'DE',
        minGuests: dto.minGuests ?? 4,
        maxGuests: dto.maxGuests ?? 12,
        idealGuests: dto.idealGuests,
        isPrivate: dto.isPrivate ?? true,
        atmosphereChecklist: dto.atmosphereChecklist,
        supplyChecklist: dto.supplyChecklist,
        conversationCardDeckId: dto.conversationCardDeckId,
        playlistUrl: dto.playlistUrl,
        signatureElement: dto.signatureElement,
        hostPrivateNotes: dto.hostPrivateNotes,
        status: 'DRAFT',
        currentPhase: 'NOT_STARTED',
      },
    });

    return session;
  }

  async findAll(pagination: PaginationDto, filters?: {
    hostId?: string;
    status?: string;
    format?: string;
    city?: string;
  }) {
    const where: any = { deletedAt: null };
    if (filters?.hostId) where.hostId = filters.hostId;
    if (filters?.status) where.status = filters.status;
    if (filters?.format) where.format = filters.format;
    if (filters?.city) where.venueCity = { contains: filters.city, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        include: {
          host: {
            include: {
              user: { select: { displayName: true, firstName: true, avatarUrl: true } },
            },
          },
          _count: {
            select: {
              guests: { where: { rsvpStatus: 'CHECKED_IN' } },
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.session.count({ where }),
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
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: { select: { displayName: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        guests: {
          include: {
            user: { select: { id: true, displayName: true, firstName: true, avatarUrl: true } },
          },
        },
        recap: true,
        conversationCardDeck: { include: { cards: true } },
        feedback: { select: { overallRating: true, atmosphereRating: true, hostRating: true, conversationQuality: true } },
      },
    });
    if (!session || session.deletedAt) throw new NotFoundException('Session not found');
    return session;
  }

  async update(id: string, hostId: string, dto: UpdateSessionDto) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (!['DRAFT', 'SCHEDULED'].includes(session.status)) {
      throw new BadRequestException('Can only update draft or scheduled sessions');
    }

    const data: any = { ...dto };
    if (dto.scheduledDate) data.scheduledDate = new Date(dto.scheduledDate);
    if (dto.scheduledStartTime) data.scheduledStartTime = new Date(`1970-01-01T${dto.scheduledStartTime}:00`);
    if (dto.scheduledEndTime) data.scheduledEndTime = new Date(`1970-01-01T${dto.scheduledEndTime}:00`);

    return this.prisma.session.update({ where: { id }, data });
  }

  async publish(id: string, hostId: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (session.status !== 'DRAFT') {
      throw new BadRequestException('Only draft sessions can be published');
    }

    return this.prisma.session.update({
      where: { id },
      data: { status: 'SCHEDULED' },
    });
  }

  async startSession(id: string, hostId: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (!['SCHEDULED', 'RSVP_CLOSED'].includes(session.status)) {
      throw new BadRequestException('Session must be scheduled to start');
    }

    // Generate check-in code: 6-char alphanumeric
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let checkInCode = '';
    for (let i = 0; i < 6; i++) {
      checkInCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const checkInQrUrl = `https://app.budssessions.com/checkin/${id}?code=${checkInCode}`;

    return this.prisma.session.update({
      where: { id },
      data: {
        status: 'LIVE',
        currentPhase: 'WARM_UP',
        actualStartTime: new Date(),
        warmUpStartedAt: new Date(),
        checkInCode,
        checkInQrUrl,
      },
    });
  }

  async advancePhase(id: string, hostId: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (session.status !== 'LIVE') {
      throw new BadRequestException('Session must be live to advance phase');
    }

    const now = new Date();
    const phaseTransitions: Record<string, any> = {
      WARM_UP: {
        currentPhase: 'MAIN_EVENT',
        warmUpEndedAt: now,
        mainEventStartedAt: now,
      },
      MAIN_EVENT: {
        currentPhase: 'WIND_DOWN',
        mainEventEndedAt: now,
        windDownStartedAt: now,
      },
      WIND_DOWN: {
        currentPhase: 'ENDED',
        windDownEndedAt: now,
        actualEndTime: now,
        status: 'COMPLETED',
      },
    };

    const transition = phaseTransitions[session.currentPhase];
    if (!transition) {
      throw new BadRequestException('Cannot advance from current phase');
    }

    const updated = await this.prisma.session.update({
      where: { id },
      data: transition,
    });

    // If session completed, mark no-shows and check verification
    if (transition.status === 'COMPLETED') {
      await this.onSessionComplete(id);
    }

    return updated;
  }

  async endSession(id: string, hostId: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (session.status !== 'LIVE') {
      throw new BadRequestException('Session must be live to end');
    }

    const now = new Date();
    const data: any = {
      status: 'COMPLETED',
      currentPhase: 'ENDED',
      actualEndTime: now,
    };

    // Close any open phase
    if (session.currentPhase === 'WARM_UP') data.warmUpEndedAt = now;
    if (session.currentPhase === 'MAIN_EVENT') data.mainEventEndedAt = now;
    if (session.currentPhase === 'WIND_DOWN') data.windDownEndedAt = now;

    const updated = await this.prisma.session.update({ where: { id }, data });
    await this.onSessionComplete(id);
    return updated;
  }

  async cancelSession(id: string, hostId: string, reason: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(session.status)) {
      throw new BadRequestException('Cannot cancel this session');
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });
  }

  private async onSessionComplete(sessionId: string) {
    // Mark accepted but not checked-in guests as NO_SHOW
    await this.prisma.sessionGuest.updateMany({
      where: {
        sessionId,
        rsvpStatus: 'ACCEPTED',
        checkedInAt: null,
      },
      data: { rsvpStatus: 'NO_SHOW' },
    });

    // Count check-ins for auto-verification
    const checkedInCount = await this.prisma.sessionGuest.count({
      where: { sessionId, rsvpStatus: 'CHECKED_IN' },
    });

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { host: true },
    });

    if (!session) return;

    // Auto-verify if: enough guests, no incidents, host has 2+ prior verified sessions
    const openIncidents = await this.prisma.sessionIncident.count({
      where: { sessionId, resolvedAt: null },
    });

    const priorVerifiedSessions = await this.prisma.session.count({
      where: {
        hostId: session.hostId,
        status: 'VERIFIED',
        id: { not: sessionId },
      },
    });

    if (
      checkedInCount >= session.minGuests &&
      openIncidents === 0 &&
      priorVerifiedSessions >= 2
    ) {
      await this.verifySession(sessionId);
    }

    // Send recap reminder notification to host
    await this.prisma.notification.create({
      data: {
        userId: session.host.userId,
        type: 'SESSION_COMPLETED',
        channel: 'EMAIL',
        title: 'Session complete! Submit your recap',
        body: `Your session "${session.title}" is complete. Submit your recap within 3 days to earn +50 Buds.`,
        data: { sessionId },
      },
    });
  }

  async verifySession(sessionId: string, adminId?: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { host: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: adminId,
      },
    });

    // Distribute points
    await this.distributePoints(sessionId);
  }

  private async distributePoints(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        host: true,
        guests: { where: { rsvpStatus: 'CHECKED_IN' }, include: { user: true } },
      },
    });

    if (!session || session.pointsDistributed) return;

    const host = session.host;
    const multiplier = host.tier === 'BUDS_HOST' ? 1.0 : 1.5;
    const baseHostPoints = 100;
    const hostPoints = Math.round(baseHostPoints * multiplier);

    // Award host points
    let hostBalance = host.pointsBalance + hostPoints;
    await this.prisma.pointTransaction.create({
      data: {
        userId: host.userId,
        hostId: host.id,
        sessionId,
        type: 'HOST_SESSION',
        amount: hostPoints,
        baseAmount: baseHostPoints,
        multiplier,
        balanceAfter: hostBalance,
        description: `Hosted session: ${session.title}`,
      },
    });

    // Pro tier multiplier bonus transaction (if applicable)
    if (multiplier > 1.0) {
      const bonusAmount = hostPoints - baseHostPoints;
      await this.prisma.pointTransaction.create({
        data: {
          userId: host.userId,
          hostId: host.id,
          sessionId,
          type: 'PRO_TIER_MULTIPLIER',
          amount: bonusAmount,
          baseAmount: 0,
          multiplier,
          balanceAfter: hostBalance,
          description: `Pro tier bonus for session: ${session.title}`,
        },
      });
    }

    // First session bonus
    const isFirstSession = host.totalSessionsHosted === 0;
    if (isFirstSession) {
      hostBalance += 250;
      await this.prisma.pointTransaction.create({
        data: {
          userId: host.userId,
          hostId: host.id,
          sessionId,
          type: 'FIRST_SESSION_BONUS',
          amount: 250,
          baseAmount: 250,
          multiplier: 1.0,
          balanceAfter: hostBalance,
          description: 'First session bonus!',
        },
      });

      await this.prisma.hostMilestone.create({
        data: {
          hostId: host.id,
          milestoneKey: 'first_session',
          achievedAt: new Date(),
        },
      });
    }

    // Update host counters
    const checkedInCount = session.guests.length;
    await this.prisma.host.update({
      where: { id: host.id },
      data: {
        pointsBalance: hostBalance,
        pointsLifetimeEarned: { increment: hostPoints + (isFirstSession ? 250 : 0) },
        totalSessionsHosted: { increment: 1 },
        totalGuestsHosted: { increment: checkedInCount },
        firstSessionAt: isFirstSession ? new Date() : undefined,
        lastSessionAt: new Date(),
      },
    });

    // Award guest points
    for (const guest of session.guests) {
      const guestPoints = 25;
      // Get or compute guest balance
      const lastTx = await this.prisma.pointTransaction.findFirst({
        where: { userId: guest.userId },
        orderBy: { createdAt: 'desc' },
      });
      const guestBalance = (lastTx?.balanceAfter ?? 0) + guestPoints;

      await this.prisma.pointTransaction.create({
        data: {
          userId: guest.userId,
          sessionId,
          type: 'ATTEND_SESSION',
          amount: guestPoints,
          baseAmount: guestPoints,
          multiplier: 1.0,
          balanceAfter: guestBalance,
          description: `Attended session: ${session.title}`,
        },
      });

      await this.prisma.sessionGuest.update({
        where: { id: guest.id },
        data: { pointsAwarded: guestPoints, pointsAwardedAt: new Date() },
      });
    }

    // Mark points as distributed
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { pointsDistributed: true, pointsDistributedAt: new Date() },
    });

    // Check tier promotion for host
    const updatedHost = await this.prisma.host.findUnique({ where: { id: host.id } });
    if (updatedHost && updatedHost.tier === 'BUDS_HOST' && updatedHost.totalSessionsHosted >= 5) {
      await this.prisma.host.update({
        where: { id: host.id },
        data: { tier: 'BUDS_PRO', tierPromotedAt: new Date() },
      });

      const milestoneBalance = updatedHost.pointsBalance + 500;
      await this.prisma.pointTransaction.create({
        data: {
          userId: host.userId,
          hostId: host.id,
          type: 'FIVE_SESSION_MILESTONE',
          amount: 500,
          baseAmount: 500,
          multiplier: 1.0,
          balanceAfter: milestoneBalance,
          description: '5 session milestone! Upgraded to Buds Pro.',
        },
      });

      await this.prisma.host.update({
        where: { id: host.id },
        data: {
          pointsBalance: milestoneBalance,
          pointsLifetimeEarned: { increment: 500 },
        },
      });

      await this.prisma.hostMilestone.create({
        data: { hostId: host.id, milestoneKey: 'five_sessions', achievedAt: new Date() },
      });

      await this.prisma.notification.create({
        data: {
          userId: host.userId,
          type: 'TIER_UPGRADED',
          channel: 'IN_APP',
          title: 'Welcome to Buds Pro!',
          body: 'You have hosted 5 sessions and earned Buds Pro status! You now earn 1.5x points.',
          data: { tier: 'BUDS_PRO' },
        },
      });
    }
  }

  async getHostSessions(hostId: string, pagination: PaginationDto) {
    return this.findAll(pagination, { hostId });
  }
}
