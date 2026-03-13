import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(sessionId: string, userId: string, dto: CreateFeedbackDto) {
    // Verify the user attended (checked in) to this session
    const sessionGuest = await this.prisma.sessionGuest.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!sessionGuest || sessionGuest.rsvpStatus !== 'CHECKED_IN') {
      throw new BadRequestException('You must have attended this session to submit feedback');
    }

    // Check for existing feedback
    const existing = await this.prisma.guestFeedback.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (existing) throw new BadRequestException('Feedback already submitted');

    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const feedback = await this.prisma.guestFeedback.create({
      data: {
        sessionId,
        sessionGuestId: sessionGuest.id,
        userId,
        hostId: session.hostId,
        overallRating: dto.overallRating,
        atmosphereRating: dto.atmosphereRating,
        hostRating: dto.hostRating,
        conversationQuality: dto.conversationQuality,
        wouldAttendAgain: dto.wouldAttendAgain,
        wouldRecommendHost: dto.wouldRecommendHost,
        highlightMoment: dto.highlightMoment,
        improvementSuggestion: dto.improvementSuggestion,
        feltWelcome: dto.feltWelcome,
        groupSizeFeeling: dto.groupSizeFeeling,
        isAnonymous: dto.isAnonymous ?? false,
        npsScore: dto.npsScore,
        sponsorProductRating: dto.sponsorProductRating,
        sponsorProductComment: dto.sponsorProductComment,
        interestedInSponsorProduct: dto.interestedInSponsorProduct,
        consentShareWithSponsor: dto.consentShareWithSponsor ?? false,
      },
    });

    // Update session guest record
    await this.prisma.sessionGuest.update({
      where: { id: sessionGuest.id },
      data: { feedbackSubmitted: true },
    });

    // Recompute session aggregate ratings
    await this.recomputeSessionRatings(sessionId);

    // Recompute host average rating
    await this.recomputeHostRating(session.hostId);

    return feedback;
  }

  async getSessionFeedback(sessionId: string) {
    return this.prisma.guestFeedback.findMany({
      where: { sessionId },
      include: {
        user: {
          select: { displayName: true, firstName: true, avatarUrl: true },
        },
      },
    });
  }

  async getHostFeedback(hostId: string) {
    return this.prisma.guestFeedback.findMany({
      where: { hostId },
      include: {
        session: { select: { title: true, scheduledDate: true, format: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async recomputeSessionRatings(sessionId: string) {
    const feedback = await this.prisma.guestFeedback.findMany({
      where: { sessionId },
    });

    if (feedback.length === 0) return;

    const avgOverall = feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length;
    const avgAtmosphere = feedback.filter(f => f.atmosphereRating).reduce((sum, f) => sum + f.atmosphereRating!, 0) / (feedback.filter(f => f.atmosphereRating).length || 1);
    const avgHost = feedback.filter(f => f.hostRating).reduce((sum, f) => sum + f.hostRating!, 0) / (feedback.filter(f => f.hostRating).length || 1);
    const avgConvo = feedback.filter(f => f.conversationQuality).reduce((sum, f) => sum + f.conversationQuality!, 0) / (feedback.filter(f => f.conversationQuality).length || 1);

    // Composite score: 40% overall, 20% host, 15% atmosphere, 15% conversation, 10% recap quality
    const sessionScore = avgOverall * 0.4 + avgHost * 0.2 + avgAtmosphere * 0.15 + avgConvo * 0.15;

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        totalFeedbackCount: feedback.length,
        averageFeedbackRating: avgOverall,
        sessionScore,
      },
    });
  }

  private async recomputeHostRating(hostId: string) {
    const result = await this.prisma.guestFeedback.aggregate({
      where: { hostId },
      _avg: { overallRating: true },
      _count: true,
    });

    await this.prisma.host.update({
      where: { id: hostId },
      data: {
        averageRating: result._avg.overallRating,
        totalRatingsCount: result._count,
      },
    });
  }
}
