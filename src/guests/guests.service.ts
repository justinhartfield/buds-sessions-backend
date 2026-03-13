import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddGuestsDto } from './dto/add-guests.dto';
import { RsvpDto } from './dto/rsvp.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async addGuests(sessionId: string, hostId: string, dto: AddGuestsDto) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();

    const results = [];

    for (const guest of dto.guests) {
      let userId = guest.userId;

      // Look up by email if no userId
      if (!userId && guest.email) {
        const user = await this.prisma.user.findUnique({ where: { email: guest.email } });
        if (user) userId = user.id;
      }

      if (!userId) {
        results.push({ email: guest.email, status: 'user_not_found' });
        continue;
      }

      // Check if already invited
      const existing = await this.prisma.sessionGuest.findUnique({
        where: { sessionId_userId: { sessionId, userId } },
      });
      if (existing) {
        results.push({ userId, status: 'already_invited' });
        continue;
      }

      // Check capacity
      const acceptedCount = await this.prisma.sessionGuest.count({
        where: { sessionId, rsvpStatus: { in: ['INVITED', 'ACCEPTED'] } },
      });

      // Determine if first-time guest
      const previousAttendance = await this.prisma.sessionGuest.count({
        where: { userId, rsvpStatus: 'CHECKED_IN' },
      });
      const previousWithHost = await this.prisma.sessionGuest.count({
        where: {
          userId,
          rsvpStatus: 'CHECKED_IN',
          session: { hostId },
        },
      });

      const rsvpStatus = acceptedCount >= session.maxGuests ? 'WAITLISTED' : 'INVITED';

      const sessionGuest = await this.prisma.sessionGuest.create({
        data: {
          sessionId,
          userId,
          rsvpStatus,
          invitedAt: new Date(),
          invitedBy: dto.invitedBy || 'host_direct',
          inviteMessage: guest.inviteMessage,
          isFirstTimeGuest: previousAttendance === 0,
          isFirstTimeWithHost: previousWithHost === 0,
          waitlistPosition: rsvpStatus === 'WAITLISTED' ? acceptedCount - session.maxGuests + 1 : null,
        },
      });

      // Send invitation notification
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'SESSION_INVITATION',
          channel: 'EMAIL',
          title: `You're invited to ${session.title}`,
          body: guest.inviteMessage || `You've been invited to a Buds Session on ${session.scheduledDate.toISOString().split('T')[0]}.`,
          data: { sessionId, sessionTitle: session.title },
        },
      });

      results.push({ userId, status: rsvpStatus, guestId: sessionGuest.id });
    }

    return results;
  }

  async rsvp(sessionId: string, userId: string, dto: RsvpDto) {
    const guest = await this.prisma.sessionGuest.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!guest) throw new NotFoundException('You are not invited to this session');

    if (guest.rsvpStatus === 'CHECKED_IN') {
      throw new BadRequestException('Already checked in');
    }

    const data: any = {
      rsvpStatus: dto.response,
      respondedAt: new Date(),
      dietaryNotes: dto.dietaryNotes,
      isPlusOne: dto.isPlusOne ?? false,
      plusOneName: dto.plusOneName,
    };

    if (dto.response === 'DECLINED') {
      data.declineReason = dto.declineReason;

      // Auto-promote from waitlist
      const nextWaitlisted = await this.prisma.sessionGuest.findFirst({
        where: { sessionId, rsvpStatus: 'WAITLISTED' },
        orderBy: { waitlistPosition: 'asc' },
      });
      if (nextWaitlisted) {
        await this.prisma.sessionGuest.update({
          where: { id: nextWaitlisted.id },
          data: { rsvpStatus: 'INVITED', waitlistPosition: null },
        });
        await this.prisma.notification.create({
          data: {
            userId: nextWaitlisted.userId,
            type: 'SESSION_RSVP_UPDATE',
            channel: 'EMAIL',
            title: 'A spot opened up!',
            body: 'A spot has opened up for the session. You have been moved from the waitlist.',
            data: { sessionId },
          },
        });
      }
    }

    return this.prisma.sessionGuest.update({
      where: { id: guest.id },
      data,
    });
  }

  async checkIn(sessionId: string, userId: string, method: string = 'code_entry') {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'LIVE') {
      throw new BadRequestException('Session is not live');
    }

    const guest = await this.prisma.sessionGuest.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!guest) throw new NotFoundException('Guest not found for this session');
    if (guest.checkedInAt) throw new BadRequestException('Already checked in');
    if (!['INVITED', 'ACCEPTED'].includes(guest.rsvpStatus)) {
      throw new BadRequestException('RSVP status does not allow check-in');
    }

    return this.prisma.sessionGuest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedInMethod: method,
      },
    });
  }

  async checkInByCode(code: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { checkInCode: code.toUpperCase() },
    });
    if (!session || session.status !== 'LIVE') {
      throw new BadRequestException('Invalid check-in code or session not live');
    }

    return this.checkIn(session.id, userId, 'code_entry');
  }

  async hostManualCheckIn(sessionId: string, hostId: string, guestUserId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();

    return this.checkIn(sessionId, guestUserId, 'host_manual');
  }

  async getSessionGuests(sessionId: string) {
    return this.prisma.sessionGuest.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true, displayName: true, firstName: true, avatarUrl: true,
          },
        },
      },
      orderBy: { invitedAt: 'asc' },
    });
  }
}
