import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../common/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Age verification: must be 18+
    const dob = new Date(dto.dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())
        ? age - 1
        : age;

    if (actualAge < 18) {
      throw new BadRequestException('You must be at least 18 years old to register');
    }

    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        authProviderId: `local_${uuidv4()}`,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName || `${dto.firstName} ${dto.lastName.charAt(0)}.`,
        dateOfBirth: new Date(dto.dateOfBirth),
        city: dto.city,
        countryCode: dto.countryCode || 'DE',
        weedDeUsername: dto.weedDeUsername,
        role: 'GUEST',
      },
    });

    // Store password hash separately (in production, use auth provider)
    // For this implementation, we store it as the authProviderId prefix
    await this.prisma.user.update({
      where: { id: user.id },
      data: { authProviderId: `local_${passwordHash}` },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        role: user.role,
        city: user.city,
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return null;
    }

    // Extract password hash from authProviderId
    if (!user.authProviderId.startsWith('local_$2')) {
      return null;
    }

    const storedHash = user.authProviderId.replace('local_', '');
    const isValid = await bcrypt.compare(password, storedHash);

    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(userId: string, email: string, role: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(userId, email, role as any);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        role: true,
        city: true,
      },
    });

    return { user, ...tokens };
  }

  private async generateTokens(userId: string, email: string, role: any) {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
