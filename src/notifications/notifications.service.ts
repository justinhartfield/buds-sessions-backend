import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string, pagination: PaginationDto, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
        unreadCount,
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  async updatePreference(
    userId: string,
    notificationType: any,
    data: { emailEnabled?: boolean; pushEnabled?: boolean; smsEnabled?: boolean; inAppEnabled?: boolean },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: { userId, notificationType },
      },
      create: {
        userId,
        notificationType,
        ...data,
      },
      update: data,
    });
  }

  async send(params: {
    userId: string;
    type: any;
    channel: any;
    title: string;
    body: string;
    data?: any;
    scheduledFor?: Date;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        channel: params.channel,
        title: params.title,
        body: params.body,
        data: params.data,
        scheduledFor: params.scheduledFor,
        isSent: !params.scheduledFor,
        sentAt: !params.scheduledFor ? new Date() : null,
      },
    });
  }
}
