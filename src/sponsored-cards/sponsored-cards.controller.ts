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
import { SponsoredCardsService } from './sponsored-cards.service';
import { CreateSponsoredCardDto } from './dto/create-sponsored-card.dto';

@Controller()
export class SponsoredCardsController {
  constructor(private readonly cardsService: SponsoredCardsService) {}

  @Post('partners/conversation-cards')
  @UseGuards(JwtAuthGuard)
  async submitCard(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSponsoredCardDto,
  ) {
    return this.cardsService.submitCard(userId, dto);
  }

  @Get('partners/conversation-cards')
  @UseGuards(JwtAuthGuard)
  async getMyCards(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cardsService.getMyCards(userId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('partners/conversation-cards/:id')
  @UseGuards(JwtAuthGuard)
  async getCardDetail(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.cardsService.getCardDetail(userId, id);
  }

  // Admin endpoints
  @Get('admin/conversation-cards/sponsored')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminListSponsoredCards(
    @Query('status') status?: string,
    @Query('partner_id') partnerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cardsService.adminListSponsoredCards({
      status,
      partnerId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('admin/conversation-cards/sponsored/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adminReviewCard(
    @CurrentUser('id') adminUserId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('editorialNotes') editorialNotes?: string,
  ) {
    return this.cardsService.adminReviewCard(id, {
      status,
      editorialNotes,
      adminUserId,
    });
  }
}
