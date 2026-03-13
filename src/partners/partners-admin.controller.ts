import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnersService } from './partners.service';

@Controller('admin/partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class PartnersAdminController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  async listPartners(
    @Query('status') status?: string,
    @Query('tier') tier?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.partnersService.adminListPartners({
      status,
      tier,
      category,
      city,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('revenue')
  async getRevenue(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('group_by') groupBy?: string,
  ) {
    return this.partnersService.adminGetRevenue({ dateFrom, dateTo, groupBy });
  }

  @Get(':id')
  async getPartner(@Param('id') partnerId: string) {
    return this.partnersService.adminGetPartner(partnerId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') partnerId: string,
    @Body('status') status: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.partnersService.adminUpdateStatus(partnerId, status, reason, adminUserId);
  }

  @Patch(':id/tier')
  async updateTier(
    @Param('id') partnerId: string,
    @Body('tier') tier: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.partnersService.adminUpdateTier(partnerId, tier, reason, adminUserId);
  }

  @Post(':id/verify')
  async verify(
    @Param('id') partnerId: string,
    @Body('verificationNotes') verificationNotes: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.partnersService.adminVerifyPartner(partnerId, verificationNotes, adminUserId);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') partnerId: string,
    @Body('rejectionReason') rejectionReason: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.partnersService.adminRejectPartner(partnerId, rejectionReason, adminUserId);
  }
}
