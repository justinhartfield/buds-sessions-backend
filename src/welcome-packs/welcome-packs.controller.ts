import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WelcomePacksService } from './welcome-packs.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('welcome-packs')
@Controller('welcome-packs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WelcomePacksController {
  constructor(private welcomePacksService: WelcomePacksService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all welcome packs (admin)' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.welcomePacksService.findAll(pagination, { status });
  }

  @Get('status-counts')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get welcome pack counts by status' })
  async getStatusCounts() {
    return this.welcomePacksService.getStatusCounts();
  }

  @Get('me')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get my welcome pack status' })
  async getMyPack(@CurrentUser() user: AuthenticatedUser) {
    return this.welcomePacksService.findByHostId(user.hostId!);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get welcome pack detail (admin)' })
  async findById(@Param('id') id: string) {
    return this.welcomePacksService.findById(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update welcome pack status (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() data: {
      status: string;
      trackingNumber?: string;
      trackingUrl?: string;
      carrier?: string;
      fulfillmentOrderId?: string;
      estimatedDeliveryDate?: string;
      notes?: string;
    },
  ) {
    return this.welcomePacksService.updateStatus(id, data);
  }

  @Post(':id/items')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Add an item to a welcome pack' })
  async addItem(
    @Param('id') id: string,
    @Body() data: { itemName: string; itemSku?: string; quantity?: number },
  ) {
    return this.welcomePacksService.addItem(id, data);
  }
}
