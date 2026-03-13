import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('admin/overview')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin dashboard overview metrics' })
  async getAdminOverview() {
    return this.analyticsService.getAdminOverview();
  }

  @Get('admin/sessions-by-city')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Session distribution by city' })
  async getSessionsByCity() {
    return this.analyticsService.getSessionsByCity();
  }

  @Get('admin/application-funnel')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Application status funnel' })
  async getApplicationFunnel() {
    return this.analyticsService.getApplicationFunnel();
  }

  @Get('admin/points-economy')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Points economy health overview' })
  async getPointsEconomy() {
    return this.analyticsService.getPointsEconomyOverview();
  }

  @Get('host/me')
  @Roles('HOST')
  @ApiOperation({ summary: 'Personal host analytics' })
  async getHostAnalytics(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getHostAnalytics(user.hostId!);
  }
}
