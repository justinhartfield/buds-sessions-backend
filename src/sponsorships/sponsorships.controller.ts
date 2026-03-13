import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SponsorshipsService } from './sponsorships.service';
import {
  CreateSponsorshipDto,
  UpdateSponsorshipDto,
  CancelSponsorshipDto,
  HostDeclineDto,
  HostCounterProposalDto,
} from './dto/create-sponsorship.dto';

@Controller()
export class SponsorshipsController {
  constructor(private readonly sponsorshipsService: SponsorshipsService) {}

  // Partner endpoints
  @Get('partners/sessions/available')
  @UseGuards(JwtAuthGuard)
  async getAvailableSessions(
    @Query('city') city?: string,
    @Query('format') format?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('host_tier') hostTier?: string,
    @Query('is_sponsored') isSponsored?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sponsorshipsService.getAvailableSessions({
      city,
      format,
      dateFrom,
      dateTo,
      hostTier,
      isSponsored,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('partners/sponsorships')
  @UseGuards(JwtAuthGuard)
  async createSponsorship(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSponsorshipDto,
  ) {
    return this.sponsorshipsService.createSponsorship(userId, dto);
  }

  @Get('partners/sponsorships')
  @UseGuards(JwtAuthGuard)
  async getMySponsorships(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sponsorshipsService.getMySponsorships(userId, {
      status,
      type,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('partners/sponsorships/:id')
  @UseGuards(JwtAuthGuard)
  async getSponsorshipDetail(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.sponsorshipsService.getSponsorshipDetail(userId, id);
  }

  @Patch('partners/sponsorships/:id')
  @UseGuards(JwtAuthGuard)
  async updateSponsorship(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSponsorshipDto,
  ) {
    return this.sponsorshipsService.updateSponsorship(userId, id, dto);
  }

  @Post('partners/sponsorships/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSponsorship(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelSponsorshipDto,
  ) {
    return this.sponsorshipsService.cancelSponsorship(userId, id, dto.reason);
  }

  @Post('partners/sponsorships/:id/confirm-shipment')
  @UseGuards(JwtAuthGuard)
  async confirmShipment(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('trackingNumber') trackingNumber?: string,
  ) {
    return this.sponsorshipsService.confirmShipment(userId, id, trackingNumber);
  }

  // Host-side endpoints
  @Get('hosts/me/sponsorship-requests')
  @UseGuards(JwtAuthGuard)
  async getHostSponsorshipRequests(@CurrentUser('id') userId: string) {
    return this.sponsorshipsService.getHostSponsorshipRequests(userId);
  }

  @Post('hosts/me/sponsorship-requests/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveSponsorship(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.sponsorshipsService.approveSponsorship(userId, id);
  }

  @Post('hosts/me/sponsorship-requests/:id/decline')
  @UseGuards(JwtAuthGuard)
  async declineSponsorship(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: HostDeclineDto,
  ) {
    return this.sponsorshipsService.declineSponsorship(userId, id, dto);
  }

  @Post('hosts/me/sponsorship-requests/:id/counter')
  @UseGuards(JwtAuthGuard)
  async counterPropose(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: HostCounterProposalDto,
  ) {
    return this.sponsorshipsService.counterPropose(userId, id, dto);
  }

  @Post('hosts/me/sponsorship-requests/:id/confirm-receipt')
  @UseGuards(JwtAuthGuard)
  async confirmReceipt(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.sponsorshipsService.confirmReceipt(userId, id);
  }

  // Admin endpoints
  @Get('admin/sponsorships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminListSponsorships(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('partner_id') partnerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sponsorshipsService.adminListSponsorships({
      status,
      type,
      partnerId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('admin/sponsorships/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminUpdateSponsorship(
    @CurrentUser('id') adminUserId: string,
    @Param('id') id: string,
    @Body('status') status?: string,
    @Body('editorialNotes') editorialNotes?: string,
    @Body('editorialApproved') editorialApproved?: boolean,
  ) {
    return this.sponsorshipsService.adminUpdateSponsorship(id, {
      status,
      editorialNotes,
      editorialApproved,
      adminUserId,
    });
  }
}
