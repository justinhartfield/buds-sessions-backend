import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { CreateSponsoredCardDto } from './dto/create-sponsored-card.dto';
import { ConversationCardSponsorStatus, SessionPhase, GatheringFormat } from '@prisma/client';

// Quarterly card submission limits by tier
const QUARTERLY_CARD_LIMITS: Record<string, number> = {
  COMMUNITY: 2,
  GOLD: 6,
  PLATINUM: 4, // 4 active cards at any time (included)
  TITLE_SPONSOR: 15, // Full branded deck
};

// Fee per card submission in EUR cents
const CARD_FEES: Record<string, number> = {
  COMMUNITY: 5000, // EUR 50/card
  GOLD: 4000, // EUR 40/card, 2 guaranteed/quarter included
  PLATINUM: 0, // 4 active cards included
  TITLE_SPONSOR: 0, // Full branded deck included
};

// 10% cap: max 3 branded cards per deck of 30
const MAX_BRANDED_CARDS_PER_DECK = 3;
const DECK_SIZE = 30;

// Auto-retirement threshold
const MIN_ENGAGEMENT_RATING = 3.0;
const MIN_USES_BEFORE_RETIREMENT_CHECK = 30;

@Injectable()
export class SponsoredCardsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  async submitCard(userId: string, dto: CreateSponsoredCardDto) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (partner.status !== 'ACTIVE') {
      throw new ForbiddenException('Partner must be active to submit conversation cards');
    }

    // Check active card limits for Platinum (4 active at any time)
    if (partner.tier === 'PLATINUM' || partner.tier === 'TITLE_SPONSOR') {
      const activeCards = await this.prisma.sponsoredConversationCard.count({
        where: {
          partnerId,
          status: { in: ['CCS_APPROVED', 'CCS_ACTIVE'] as ConversationCardSponsorStatus[] },
        },
      });

      const maxActive = partner.tier === 'PLATINUM' ? 4 : 15;
      if (activeCards >= maxActive) {
        throw new BadRequestException(
          `Maximum ${maxActive} active cards allowed for ${partner.tier} tier`,
        );
      }
    } else {
      // Check quarterly limits for Community/Gold
      const quarterStart = new Date();
      quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1);
      quarterStart.setHours(0, 0, 0, 0);

      const quarterEnd = new Date(quarterStart);
      quarterEnd.setMonth(quarterEnd.getMonth() + 3);

      const quarterlySubmissions = await this.prisma.sponsoredConversationCard.count({
        where: {
          partnerId,
          status: { notIn: ['CCS_REJECTED'] as ConversationCardSponsorStatus[] },
          createdAt: { gte: quarterStart, lt: quarterEnd },
        },
      });

      const limit = QUARTERLY_CARD_LIMITS[partner.tier];
      if (quarterlySubmissions >= limit) {
        throw new BadRequestException(
          `Quarterly card submission limit reached (${limit} per quarter for ${partner.tier} tier)`,
        );
      }
    }

    // Enforce 10% cap: check how many branded cards are already active globally
    // This ensures no deck has more than 3 branded cards out of 30
    const totalActiveBrandedCards = await this.prisma.sponsoredConversationCard.count({
      where: { status: 'CCS_ACTIVE' as ConversationCardSponsorStatus },
    });
    const totalCards = await this.prisma.conversationCard.count({
      where: { isActive: true },
    });

    if (totalCards > 0 && totalActiveBrandedCards >= Math.floor(totalCards * 0.1)) {
      throw new BadRequestException(
        'The 10% branded card cap has been reached. Please wait for a slot to open.',
      );
    }

    // Calculate fee
    let feeAmountCents = CARD_FEES[partner.tier];
    // Gold gets 2 guaranteed per quarter included
    if (partner.tier === 'GOLD') {
      const quarterStart = new Date();
      quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1);
      quarterStart.setHours(0, 0, 0, 0);
      const quarterEnd = new Date(quarterStart);
      quarterEnd.setMonth(quarterEnd.getMonth() + 3);

      const includedCount = await this.prisma.sponsoredConversationCard.count({
        where: {
          partnerId,
          status: { notIn: ['CCS_REJECTED'] as ConversationCardSponsorStatus[] },
          feeAmountCents: 0,
          createdAt: { gte: quarterStart, lt: quarterEnd },
        },
      });
      if (includedCount < 2) feeAmountCents = 0; // Still within included quota
    }

    const card = await this.prisma.sponsoredConversationCard.create({
      data: {
        partnerId,
        promptText: dto.promptText,
        attributionText: dto.attributionText,
        targetPhase: dto.targetPhase as SessionPhase,
        targetFormat: dto.targetFormat as GatheringFormat | undefined,
        status: 'CCS_SUBMITTED' as ConversationCardSponsorStatus,
        feeAmountCents,
      },
    });

    await this.prisma.partnerAuditLog.create({
      data: {
        partnerId,
        userId,
        action: 'conversation_card.submit',
        entityType: 'sponsored_conversation_card',
        entityId: card.id,
        newState: { promptText: dto.promptText, feeAmountCents },
      },
    });

    return card;
  }

  async getMyCards(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { partnerId };
    if (query.status) where.status = query.status;

    const [cards, total] = await Promise.all([
      this.prisma.sponsoredConversationCard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sponsoredConversationCard.count({ where }),
    ]);

    return {
      data: cards,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCardDetail(userId: string, cardId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const card = await this.prisma.sponsoredConversationCard.findFirst({
      where: { id: cardId, partnerId },
    });
    if (!card) throw new NotFoundException('Sponsored card not found');
    return card;
  }

  /**
   * Auto-retirement check: cards used 30+ times with avg engagement below 3.0 are retired.
   * This should be called by a scheduled job (cron).
   */
  async checkAndRetireUnderperformingCards() {
    const underperforming = await this.prisma.sponsoredConversationCard.findMany({
      where: {
        status: 'CCS_ACTIVE' as ConversationCardSponsorStatus,
        timesUsed: { gte: MIN_USES_BEFORE_RETIREMENT_CHECK },
        averageEngagement: { lt: MIN_ENGAGEMENT_RATING },
      },
    });

    const retired: string[] = [];
    for (const card of underperforming) {
      await this.prisma.sponsoredConversationCard.update({
        where: { id: card.id },
        data: { status: 'RETIRED' },
      });

      // Also deactivate the linked conversation card if it exists
      if (card.cardId) {
        await this.prisma.conversationCard.update({
          where: { id: card.cardId },
          data: { isActive: false },
        });
      }

      retired.push(card.id);
    }

    return { retiredCount: retired.length, retiredIds: retired };
  }

  /**
   * Record engagement for a sponsored card (called after session feedback).
   */
  async recordEngagement(cardId: string, rating: number) {
    const card = await this.prisma.sponsoredConversationCard.findUnique({
      where: { id: cardId },
    });
    if (!card) return;

    const newTimesUsed = card.timesUsed + 1;
    const currentTotal = (card.averageEngagement?.toNumber() || 0) * card.timesUsed;
    const newAverage = (currentTotal + rating) / newTimesUsed;

    await this.prisma.sponsoredConversationCard.update({
      where: { id: cardId },
      data: {
        timesUsed: newTimesUsed,
        averageEngagement: newAverage,
      },
    });

    // Check auto-retirement
    if (newTimesUsed >= MIN_USES_BEFORE_RETIREMENT_CHECK && newAverage < MIN_ENGAGEMENT_RATING) {
      await this.prisma.sponsoredConversationCard.update({
        where: { id: cardId },
        data: { status: 'RETIRED' },
      });
    }
  }

  // Validate 10% cap for a specific session's card deck
  async validateDeckComposition(sessionId: string, additionalBrandedCards: number = 0): Promise<boolean> {
    // Get the session's card deck count
    const totalDeckCards = await this.prisma.conversationCard.count({
      where: {
        // Cards assigned to this session's format
        isActive: true,
      },
    });

    const brandedInDeck = await this.prisma.conversationCard.count({
      where: {
        isActive: true,
        isSponsored: true,
      },
    });

    const totalBranded = brandedInDeck + additionalBrandedCards;
    const deckSize = Math.max(totalDeckCards, DECK_SIZE);

    // 10% cap: max 3 branded per 30-card deck
    return totalBranded <= Math.floor(deckSize / 10);
  }

  // Admin methods
  async adminListSponsoredCards(query: { status?: string; partnerId?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.partnerId) where.partnerId = query.partnerId;

    const [cards, total] = await Promise.all([
      this.prisma.sponsoredConversationCard.findMany({
        where,
        include: {
          partner: { select: { id: true, companyName: true, tier: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sponsoredConversationCard.count({ where }),
    ]);

    return { data: cards, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adminReviewCard(
    cardId: string,
    data: { status: string; editorialNotes?: string; adminUserId: string },
  ) {
    const card = await this.prisma.sponsoredConversationCard.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Sponsored card not found');

    const updateData: any = {
      status: data.status,
      reviewNotes: data.editorialNotes,
      reviewedById: data.adminUserId,
      reviewedAt: new Date(),
    };

    // If approved, create the actual conversation card
    if (data.status === 'APPROVED') {
      // Validate 10% cap before approving
      const canAdd = await this.validateDeckComposition('', 1);
      if (!canAdd) {
        throw new BadRequestException(
          'Cannot approve: 10% branded card cap would be exceeded (max 3 per deck of 30)',
        );
      }

      // Find a deck matching the target format, or use the default deck
      const deck = await this.prisma.conversationCardDeck.findFirst({
        where: card.targetFormat
          ? { format: card.targetFormat }
          : { isDefault: true },
        orderBy: { isDefault: 'desc' },
      });

      if (!deck) {
        throw new BadRequestException('No conversation card deck found for the target format');
      }

      const conversationCard = await this.prisma.conversationCard.create({
        data: {
          deckId: deck.id,
          promptText: card.promptText,
          phase: card.targetPhase,
          isActive: true,
          isSponsored: true,
          sponsorPartnerId: card.partnerId,
          sponsoredCardId: card.id,
          attributionText: card.attributionText,
        },
      });

      updateData.cardId = conversationCard.id;
      updateData.status = 'CCS_ACTIVE';
      updateData.activeFrom = new Date();
    }

    return this.prisma.sponsoredConversationCard.update({
      where: { id: cardId },
      data: updateData,
    });
  }
}
