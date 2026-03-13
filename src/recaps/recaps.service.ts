import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecapDto } from './dto/create-recap.dto';

@Injectable()
export class RecapsService {
  constructor(private prisma: PrismaService) {}

  async create(sessionId: string, hostId: string, dto: CreateRecapDto) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== hostId) throw new ForbiddenException();
    if (!['COMPLETED', 'VERIFIED'].includes(session.status)) {
      throw new BadRequestException('Session must be completed to submit a recap');
    }

    // Check if recap already exists
    const existing = await this.prisma.sessionRecap.findUnique({
      where: { sessionId },
    });
    if (existing) throw new BadRequestException('Recap already submitted for this session');

    const now = new Date();
    const recap = await this.prisma.sessionRecap.create({
      data: {
        sessionId,
        hostId,
        summary: dto.summary,
        highlights: dto.highlights || [],
        whatWorked: dto.whatWorked,
        whatToImprove: dto.whatToImprove,
        guestCountActual: dto.guestCountActual,
        energyLevel: dto.energyLevel,
        conversationDepth: dto.conversationDepth,
        overallSatisfaction: dto.overallSatisfaction,
        bestConversationTopic: dto.bestConversationTopic,
        signatureMoment: dto.signatureMoment,
        wouldRepeatFormat: dto.wouldRepeatFormat,
        strainsFeatured: dto.strainsFeatured || [],
        foodServed: dto.foodServed,
        musicPlaylistUrl: dto.musicPlaylistUrl,
        postcardFilled: dto.postcardFilled ?? false,
        isPublished: dto.isPublished ?? false,
        submittedAt: now,
        sponsorMentioned: dto.sponsorMentioned ?? false,
        sponsorProductUsed: dto.sponsorProductUsed,
        sponsorProductReception: dto.sponsorProductReception,
      },
    });

    // Award bonus points if submitted within 72 hours
    const sessionEndTime = session.actualEndTime || session.updatedAt;
    const hoursSinceEnd = (now.getTime() - sessionEndTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceEnd <= 72) {
      const host = await this.prisma.host.findUnique({ where: { id: hostId } });
      if (host) {
        const bonusPoints = 50;
        const newBalance = host.pointsBalance + bonusPoints;

        await this.prisma.pointTransaction.create({
          data: {
            userId: host.userId,
            hostId: host.id,
            sessionId,
            type: 'SUBMIT_RECAP',
            amount: bonusPoints,
            baseAmount: bonusPoints,
            multiplier: 1.0,
            balanceAfter: newBalance,
            description: `Recap bonus for session: ${session.title}`,
          },
        });

        await this.prisma.host.update({
          where: { id: hostId },
          data: {
            pointsBalance: newBalance,
            pointsLifetimeEarned: { increment: bonusPoints },
          },
        });

        await this.prisma.sessionRecap.update({
          where: { id: recap.id },
          data: { pointsAwarded: true },
        });
      }
    }

    return recap;
  }

  async findBySessionId(sessionId: string) {
    const recap = await this.prisma.sessionRecap.findUnique({
      where: { sessionId },
      include: {
        photos: { orderBy: { displayOrder: 'asc' } },
        session: {
          select: { title: true, format: true, scheduledDate: true },
        },
        host: {
          include: {
            user: { select: { displayName: true, firstName: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!recap) throw new NotFoundException('Recap not found');
    return recap;
  }

  async addPhoto(recapId: string, hostId: string, data: {
    photoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    displayOrder?: number;
    isCover?: boolean;
  }) {
    const recap = await this.prisma.sessionRecap.findUnique({ where: { id: recapId } });
    if (!recap) throw new NotFoundException('Recap not found');
    if (recap.hostId !== hostId) throw new ForbiddenException();

    return this.prisma.sessionRecapPhoto.create({
      data: {
        recapId,
        sessionId: recap.sessionId,
        photoUrl: data.photoUrl,
        thumbnailUrl: data.thumbnailUrl,
        caption: data.caption,
        displayOrder: data.displayOrder ?? 0,
        isCover: data.isCover ?? false,
      },
    });
  }
}
