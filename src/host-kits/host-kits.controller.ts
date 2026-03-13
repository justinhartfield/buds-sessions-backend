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
import { HostKitsService } from './host-kits.service';
import { CreateKitDto } from './dto/create-kit.dto';
import { RequestKitDto } from './dto/request-kit.dto';

@Controller()
export class HostKitsController {
  constructor(private readonly kitsService: HostKitsService) {}

  // Partner endpoints
  @Post('partners/host-kits')
  @UseGuards(JwtAuthGuard)
  async createKit(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKitDto,
  ) {
    return this.kitsService.createKit(userId, dto);
  }

  @Get('partners/host-kits')
  @UseGuards(JwtAuthGuard)
  async getMyKits(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.kitsService.getMyKits(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('partners/host-kits/:id')
  @UseGuards(JwtAuthGuard)
  async updateKit(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateKitDto>,
  ) {
    return this.kitsService.updateKit(userId, id, dto);
  }

  @Get('partners/host-kits/:id/requests')
  @UseGuards(JwtAuthGuard)
  async getKitRequests(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return this.kitsService.getKitRequests(userId, id, { status });
  }

  @Post('partners/host-kits/:id/requests/:requestId/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmAvailability(
    @CurrentUser('id') userId: string,
    @Param('id') kitId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.kitsService.confirmKitAvailability(userId, kitId, requestId);
  }

  @Post('partners/host-kits/:id/requests/:requestId/ship')
  @UseGuards(JwtAuthGuard)
  async confirmShipped(
    @CurrentUser('id') userId: string,
    @Param('id') kitId: string,
    @Param('requestId') requestId: string,
    @Body('trackingNumber') trackingNumber?: string,
  ) {
    return this.kitsService.confirmKitShipped(userId, kitId, requestId, trackingNumber);
  }

  // Host endpoints
  @Get('hosts/me/available-kits')
  @UseGuards(JwtAuthGuard)
  async getAvailableKits(
    @CurrentUser('id') userId: string,
    @Query('format') format?: string,
  ) {
    return this.kitsService.getAvailableKits(userId, { format });
  }

  @Post('hosts/me/kit-requests')
  @UseGuards(JwtAuthGuard)
  async requestKit(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestKitDto,
  ) {
    return this.kitsService.requestKit(userId, dto);
  }

  // Admin endpoints
  @Get('admin/host-kits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminListKits(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.kitsService.adminListKits({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('admin/host-kits/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminReviewKit(
    @CurrentUser('id') adminUserId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reviewNotes') reviewNotes?: string,
  ) {
    return this.kitsService.adminReviewKit(id, { status, reviewNotes, adminUserId });
  }
}
