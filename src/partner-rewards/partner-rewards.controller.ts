import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnerRewardsService } from './partner-rewards.service';

@Controller('partners/rewards-catalog')
@UseGuards(JwtAuthGuard)
export class PartnerRewardsController {
  constructor(private readonly rewardsService: PartnerRewardsService) {}

  @Post()
  async submitCatalogItem(
    @CurrentUser('id') userId: string,
    @Body() body: {
      name: string;
      description: string;
      pointsCost: number;
      retailValueCents: number;
      imageUrl?: string;
      stockQuantity: number;
      fulfillmentInstructions?: string;
    },
  ) {
    return this.rewardsService.submitCatalogItem(userId, body);
  }

  @Get()
  async getMyCatalogItems(@CurrentUser('id') userId: string) {
    return this.rewardsService.getMyCatalogItems(userId);
  }

  @Patch(':id')
  async updateCatalogItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      pointsCost?: number;
      imageUrl?: string;
      stockQuantity?: number;
      fulfillmentInstructions?: string;
    },
  ) {
    return this.rewardsService.updateCatalogItem(userId, id, body);
  }

  @Get(':id/redemptions')
  async getRedemptions(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.rewardsService.getRedemptions(userId, id);
  }

  @Post(':id/redemptions/:redemptionId/fulfill')
  async fulfillRedemption(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('redemptionId') redemptionId: string,
    @Body('trackingNumber') trackingNumber?: string,
  ) {
    return this.rewardsService.fulfillRedemption(userId, id, redemptionId, trackingNumber);
  }
}
