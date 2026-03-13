import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a host application' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(user.id, dto);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all applications (admin)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'city', required: false })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.applicationsService.findAll(pagination, { status, city });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get application detail (admin)' })
  async findById(@Param('id') id: string) {
    return this.applicationsService.findById(id);
  }

  @Patch(':id/review')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Review an application (approve/reject/waitlist)' })
  async review(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.review(id, admin.id, dto);
  }
}
