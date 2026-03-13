import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('points/adjust')
  @ApiOperation({ summary: 'Manually adjust host points' })
  async adjustPoints(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() data: { hostId: string; amount: number; reason: string; category: string },
  ) {
    return this.adminService.adjustPoints(admin.id, data);
  }

  @Post('hosts/:id/suspend')
  @ApiOperation({ summary: 'Suspend a host' })
  async suspendHost(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body('reason') reason: string,
  ) {
    return this.adminService.suspendHost(admin.id, id, reason);
  }

  @Post('hosts/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend a host' })
  async unsuspendHost(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.unsuspendHost(admin.id, id);
  }

  @Post('sessions/:id/flag')
  @ApiOperation({ summary: 'Flag a session for review' })
  async flagSession(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body('reason') reason: string,
  ) {
    return this.adminService.flagSession(admin.id, id, reason);
  }

  @Get('live-sessions')
  @ApiOperation({ summary: 'Get all currently live sessions' })
  async getLiveSessions() {
    return this.adminService.getLiveSessions();
  }

  @Get('churn-risk')
  @ApiOperation({ summary: 'Get hosts at risk of churning' })
  async getChurnRisk() {
    return this.adminService.getChurnRiskHosts();
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get admin audit log' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'action', required: false })
  async getAuditLog(
    @Query() pagination: PaginationDto,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLog(pagination, { entityType, action });
  }
}
