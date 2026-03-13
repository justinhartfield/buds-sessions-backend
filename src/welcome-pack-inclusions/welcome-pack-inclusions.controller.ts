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
import { WelcomePackInclusionsService } from './welcome-pack-inclusions.service';
import { CreateInclusionDto } from './dto/create-inclusion.dto';

@Controller()
export class WelcomePackInclusionsController {
  constructor(private readonly inclusionsService: WelcomePackInclusionsService) {}

  @Post('partners/welcome-pack-inclusions')
  @UseGuards(JwtAuthGuard)
  async createInclusion(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInclusionDto,
  ) {
    return this.inclusionsService.createInclusion(userId, dto);
  }

  @Get('partners/welcome-pack-inclusions')
  @UseGuards(JwtAuthGuard)
  async getMyInclusions(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inclusionsService.getMyInclusions(userId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('partners/welcome-pack-inclusions/:id')
  @UseGuards(JwtAuthGuard)
  async getInclusionDetail(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.inclusionsService.getInclusionDetail(userId, id);
  }

  // Admin endpoints
  @Get('admin/welcome-pack-inclusions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminListInclusions(
    @Query('status') status?: string,
    @Query('quarter') quarter?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inclusionsService.adminListInclusions({
      status,
      quarter,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('admin/welcome-pack-inclusions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminReviewInclusion(
    @CurrentUser('id') adminUserId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reviewNotes') reviewNotes?: string,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.inclusionsService.adminReviewInclusion(id, {
      status,
      reviewNotes,
      rejectionReason,
      adminUserId,
    });
  }
}
