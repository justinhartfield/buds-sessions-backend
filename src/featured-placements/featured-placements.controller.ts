import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FeaturedPlacementsService } from './featured-placements.service';
import { FeaturedPlacementLocation } from '@prisma/client';

@Controller()
export class FeaturedPlacementsController {
  constructor(private readonly placementsService: FeaturedPlacementsService) {}

  @Get('partners/placements/available')
  @UseGuards(JwtAuthGuard)
  async getAvailableSlots() {
    return this.placementsService.getAvailableSlots();
  }

  @Post('partners/placements')
  @UseGuards(JwtAuthGuard)
  async purchasePlacement(
    @CurrentUser('id') userId: string,
    @Body() body: {
      location: FeaturedPlacementLocation;
      startDate: string;
      endDate: string;
      assetUrl: string;
      destinationUrl: string;
    },
  ) {
    return this.placementsService.purchasePlacement(userId, body);
  }

  @Get('partners/placements')
  @UseGuards(JwtAuthGuard)
  async getMyPlacements(@CurrentUser('id') userId: string) {
    return this.placementsService.getMyPlacements(userId);
  }

  // Public endpoints for frontend rendering
  @Get('placements/active')
  async getActivePlacements(@Query('location') location: FeaturedPlacementLocation) {
    return this.placementsService.getActivePlacements(location);
  }

  @Post('placements/:id/impression')
  async recordImpression(@Param('id') id: string) {
    await this.placementsService.recordImpression(id);
    return { recorded: true };
  }

  @Post('placements/:id/click')
  async recordClick(@Param('id') id: string) {
    await this.placementsService.recordClick(id);
    return { recorded: true };
  }
}
