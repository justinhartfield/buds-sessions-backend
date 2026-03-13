import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class WelcomePacksService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, filters?: { status?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.welcomePack.findMany({
        where,
        include: {
          host: {
            include: {
              user: { select: { displayName: true, firstName: true, lastName: true, city: true } },
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.welcomePack.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findById(id: string) {
    const pack = await this.prisma.welcomePack.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: { select: { displayName: true, firstName: true, lastName: true, email: true, city: true } },
          },
        },
        items: true,
      },
    });
    if (!pack) throw new NotFoundException('Welcome pack not found');
    return pack;
  }

  async findByHostId(hostId: string) {
    const pack = await this.prisma.welcomePack.findUnique({
      where: { hostId },
      include: { items: true },
    });
    if (!pack) throw new NotFoundException('Welcome pack not found');
    return pack;
  }

  async updateStatus(id: string, data: {
    status: any;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    fulfillmentOrderId?: string;
    estimatedDeliveryDate?: string;
    notes?: string;
  }) {
    const pack = await this.prisma.welcomePack.findUnique({ where: { id } });
    if (!pack) throw new NotFoundException('Welcome pack not found');

    const updateData: any = { status: data.status };
    if (data.trackingNumber) updateData.trackingNumber = data.trackingNumber;
    if (data.trackingUrl) updateData.trackingUrl = data.trackingUrl;
    if (data.carrier) updateData.carrier = data.carrier;
    if (data.fulfillmentOrderId) updateData.fulfillmentOrderId = data.fulfillmentOrderId;
    if (data.estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(data.estimatedDeliveryDate);
    if (data.notes) updateData.notes = data.notes;

    if (data.status === 'SHIPPED') updateData.shippedAt = new Date();
    if (data.status === 'DELIVERED') updateData.deliveredAt = new Date();

    const updated = await this.prisma.welcomePack.update({
      where: { id },
      data: updateData,
    });

    // Send notification on status change
    const host = await this.prisma.host.findUnique({ where: { id: pack.hostId } });
    if (host) {
      const notifType = data.status === 'SHIPPED' ? 'WELCOME_PACK_SHIPPED' : data.status === 'DELIVERED' ? 'WELCOME_PACK_DELIVERED' : null;
      if (notifType) {
        await this.prisma.notification.create({
          data: {
            userId: host.userId,
            type: notifType as any,
            channel: 'EMAIL',
            title: data.status === 'SHIPPED'
              ? 'Your welcome pack has been shipped!'
              : 'Your welcome pack has been delivered!',
            body: data.status === 'SHIPPED'
              ? `Your Buds Sessions welcome pack is on its way! ${data.trackingNumber ? `Tracking: ${data.trackingNumber}` : ''}`
              : 'Your Buds Sessions welcome pack has been delivered. Check your doorstep!',
            data: { welcomePackId: id, trackingNumber: data.trackingNumber },
          },
        });
      }
    }

    return updated;
  }

  async addItem(welcomePackId: string, data: {
    itemName: string;
    itemSku?: string;
    quantity?: number;
  }) {
    return this.prisma.welcomePackItem.create({
      data: {
        welcomePackId,
        itemName: data.itemName,
        itemSku: data.itemSku,
        quantity: data.quantity ?? 1,
      },
    });
  }

  async getStatusCounts() {
    const counts = await this.prisma.welcomePack.groupBy({
      by: ['status'],
      _count: true,
    });
    return counts.reduce((acc, c) => {
      acc[c.status] = c._count;
      return acc;
    }, {} as Record<string, number>);
  }
}
