import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';

// Listing fee: EUR 50/month per active item (Gold+); included for Platinum/Title
const LISTING_FEES: Record<string, number> = {
  COMMUNITY: 0, // Not available
  GOLD: 5000, // EUR 50/month
  PLATINUM: 0, // Included
  TITLE_SPONSOR: 0, // Included
};

@Injectable()
export class PartnerRewardsService {
  constructor(
    private prisma: PrismaService,
    private partnersService: PartnersService,
  ) {}

  async submitCatalogItem(userId: string, data: {
    name: string;
    description: string;
    pointsCost: number;
    retailValueCents: number;
    imageUrl?: string;
    stockQuantity: number;
    fulfillmentInstructions?: string;
  }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partner = await this.prisma.partnerOrganization.findUniqueOrThrow({
      where: { id: partnerId },
    });

    if (!['GOLD', 'PLATINUM', 'TITLE_SPONSOR'].includes(partner.tier)) {
      throw new ForbiddenException('Rewards catalog items are available for Gold tier and above');
    }

    if (partner.status !== 'ACTIVE') {
      throw new ForbiddenException('Partner must be active');
    }

    const listingFeeCents = LISTING_FEES[partner.tier];

    // Create the reward catalog item and the partner link in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const catalogItem = await tx.rewardCatalogItem.create({
        data: {
          name: data.name,
          description: data.description,
          pointsCost: data.pointsCost,
          category: 'partner_contributed',
          imageUrl: data.imageUrl,
          stockQuantity: data.stockQuantity,
          isActive: false, // Needs admin approval
          isPartnerContributed: true,
          partnerId,
        },
      });

      const partnerItem = await tx.partnerRewardCatalogItem.create({
        data: {
          rewardCatalogItemId: catalogItem.id,
          partnerId,
          retailValueCents: data.retailValueCents,
          listingFeeCents,
          fulfillmentInstructions: data.fulfillmentInstructions,
        },
      });

      await tx.partnerAuditLog.create({
        data: {
          partnerId,
          userId,
          action: 'rewards_catalog.submit',
          entityType: 'partner_reward_catalog_item',
          entityId: partnerItem.id,
          newState: { name: data.name, pointsCost: data.pointsCost, listingFeeCents },
        },
      });

      return { catalogItem, partnerItem };
    });

    return result;
  }

  async getMyCatalogItems(userId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);

    const items = await this.prisma.partnerRewardCatalogItem.findMany({
      where: { partnerId },
      include: {
        rewardCatalogItem: {
          select: {
            id: true,
            name: true,
            description: true,
            pointsCost: true,
            imageUrl: true,
            stockQuantity: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item.rewardCatalogItem,
      id: item.id,
      retailValueCents: item.retailValueCents,
      listingFeeCents: item.listingFeeCents,
      totalRedemptions: item.totalRedemptions,
      lastRedeemedAt: item.lastRedeemedAt,
    }));
  }

  async updateCatalogItem(userId: string, itemId: string, data: {
    name?: string;
    description?: string;
    pointsCost?: number;
    imageUrl?: string;
    stockQuantity?: number;
    fulfillmentInstructions?: string;
  }) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partnerItem = await this.prisma.partnerRewardCatalogItem.findFirst({
      where: { id: itemId, partnerId },
    });
    if (!partnerItem) throw new NotFoundException('Catalog item not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.pointsCost) updateData.pointsCost = data.pointsCost;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;

    await this.prisma.rewardCatalogItem.update({
      where: { id: partnerItem.rewardCatalogItemId },
      data: updateData,
    });

    if (data.fulfillmentInstructions !== undefined) {
      await this.prisma.partnerRewardCatalogItem.update({
        where: { id: itemId },
        data: { fulfillmentInstructions: data.fulfillmentInstructions },
      });
    }

    return { updated: true };
  }

  async getRedemptions(userId: string, itemId: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partnerItem = await this.prisma.partnerRewardCatalogItem.findFirst({
      where: { id: itemId, partnerId },
    });
    if (!partnerItem) throw new NotFoundException('Catalog item not found');

    // Get redemptions for this catalog item
    const redemptions = await this.prisma.pointRedemption.findMany({
      where: {
        rewardCatalogItemId: partnerItem.rewardCatalogItemId,
        fulfillmentStatus: { in: ['PENDING', 'APPROVED'] },
      },
      select: {
        id: true,
        fulfillmentStatus: true,
        createdAt: true,
        updatedAt: true,
        host: {
          select: {
            id: true,
            tier: true,
            user: {
              select: {
                city: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return redemptions;
  }

  async fulfillRedemption(userId: string, itemId: string, redemptionId: string, trackingNumber?: string) {
    const partnerId = await this.partnersService.getPartnerIdForUser(userId);
    const partnerItem = await this.prisma.partnerRewardCatalogItem.findFirst({
      where: { id: itemId, partnerId },
    });
    if (!partnerItem) throw new NotFoundException('Catalog item not found');

    const redemption = await this.prisma.pointRedemption.findFirst({
      where: {
        id: redemptionId,
        rewardCatalogItemId: partnerItem.rewardCatalogItemId,
      },
    });
    if (!redemption) throw new NotFoundException('Redemption not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.pointRedemption.update({
        where: { id: redemptionId },
        data: {
          fulfillmentStatus: 'FULFILLED',
          externalOrderId: trackingNumber,
        },
      });

      await tx.partnerRewardCatalogItem.update({
        where: { id: partnerItem.id },
        data: {
          totalRedemptions: { increment: 1 },
          lastRedeemedAt: new Date(),
        },
      });
    });

    return { fulfilled: true };
  }
}
