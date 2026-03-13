import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { UpdateHostDto } from './dto/update-host.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('hosts')
@Controller('hosts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HostsController {
  constructor(private hostsService: HostsService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all hosts (admin)' })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'city', required: false })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('tier') tier?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.hostsService.findAll(pagination, { tier, status, city });
  }

  @Get('me')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get current host profile' })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.hostsService.findByUserId(user.id);
  }

  @Patch('me')
  @Roles('HOST')
  @ApiOperation({ summary: 'Update host profile' })
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateHostDto,
  ) {
    return this.hostsService.update(user.hostId!, user.id, dto);
  }

  @Get('me/points')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get host points history' })
  async getMyPoints(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ) {
    return this.hostsService.getPointsHistory(user.hostId!, pagination);
  }

  @Get('me/tier-progress')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get host tier progression status' })
  async getTierProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.hostsService.getTierProgress(user.hostId!);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get host by ID (admin)' })
  async findById(@Param('id') id: string) {
    return this.hostsService.findById(id);
  }
}
