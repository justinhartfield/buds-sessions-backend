import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { RedeemDto } from './dto/redeem.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('rewards')
@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Browse reward catalog' })
  @ApiQuery({ name: 'category', required: false })
  async getCatalog(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
  ) {
    return this.rewardsService.getCatalog(pagination, { category });
  }

  @Post('redeem')
  @Roles('HOST')
  @ApiOperation({ summary: 'Redeem points for a reward' })
  async redeem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RedeemDto,
  ) {
    return this.rewardsService.redeem(user.hostId!, user.id, dto);
  }

  @Get('history')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get redemption history' })
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ) {
    return this.rewardsService.getRedemptionHistory(user.hostId!, pagination);
  }
}
