import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedeemDto } from './dto/redeem.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async getCatalog(pagination: PaginationDto, filters?: { category?: string; minTier?: string }) {
    const where: any = { isActive: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.minTier) where.minTier = filters.minTier;

    const now = new Date();
    where.OR = [
      { validFrom: null },
      { validFrom: { lte: now } },
    ];

    const [data, total] = await Promise.all([
      this.prisma.rewardCatalogItem.findMany({
        where,
        orderBy: { pointsCost: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.rewardCatalogItem.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async redeem(hostId: string, userId: string, dto: RedeemDto) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const item = await this.prisma.rewardCatalogItem.findUnique({
      where: { id: dto.rewardCatalogItemId },
    });
    if (!item || !item.isActive) throw new NotFoundException('Reward not found or no longer available');

    // Check tier requirement
    const tierOrder = { BUDS_HOST: 0, BUDS_PRO: 1, FOUNDING_HOST: 2 };
    if (item.minTier && tierOrder[host.tier] < tierOrder[item.minTier]) {
      throw new BadRequestException(`This reward requires ${item.minTier} tier or higher`);
    }

    // Check stock
    if (item.stockQuantity !== null && item.stockQuantity <= 0) {
      throw new BadRequestException('Reward out of stock');
    }

    // Check points balance
    if (host.pointsBalance < item.pointsCost) {
      throw new BadRequestException(`Insufficient points. You have ${host.pointsBalance} but need ${item.pointsCost}`);
    }

    // Check validity
    const now = new Date();
    if (item.validUntil && item.validUntil < now) {
      throw new BadRequestException('This reward has expired');
    }

    // Deduct points
    const newBalance = host.pointsBalance - item.pointsCost;
    const transaction = await this.prisma.pointTransaction.create({
      data: {
        userId,
        hostId,
        type: 'REDEMPTION',
        amount: -item.pointsCost,
        baseAmount: item.pointsCost,
        multiplier: 1.0,
        balanceAfter: newBalance,
        description: `Redeemed: ${item.name}`,
      },
    });

    // Create redemption record
    const redemption = await this.prisma.pointRedemption.create({
      data: {
        userId,
        hostId,
        transactionId: transaction.id,
        pointsSpent: item.pointsCost,
        rewardCatalogItemId: item.id,
        fulfillmentStatus: 'pending',
      },
    });

    // Update host balance
    await this.prisma.host.update({
      where: { id: hostId },
      data: {
        pointsBalance: newBalance,
        pointsLifetimeSpent: { increment: item.pointsCost },
      },
    });

    // Decrement stock if tracked
    if (item.stockQuantity !== null) {
      await this.prisma.rewardCatalogItem.update({
        where: { id: item.id },
        data: { stockQuantity: { decrement: 1 } },
      });
    }

    return redemption;
  }

  async getRedemptionHistory(hostId: string, pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.pointRedemption.findMany({
        where: { hostId },
        include: {
          rewardCatalogItem: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.pointRedemption.count({ where: { hostId } }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }
}
