import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            tier: true,
            status: true,
            hostNumber: true,
            referralCode: true,
            pointsBalance: true,
            totalSessionsHosted: true,
            averageRating: true,
          },
        },
      },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(userId: string, data: Partial<{
    displayName: string;
    phone: string;
    city: string;
    avatarUrl: string;
    locale: string;
    timezone: string;
  }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateRole(userId: string, role: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
