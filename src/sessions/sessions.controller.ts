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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @Roles('HOST')
  @ApiOperation({ summary: 'Create a new session' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(user.hostId!, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sessions' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'format', required: false })
  @ApiQuery({ name: 'city', required: false })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('format') format?: string,
    @Query('city') city?: string,
  ) {
    return this.sessionsService.findAll(pagination, { status, format, city });
  }

  @Get('me')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get my sessions as host' })
  async getMySessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ) {
    return this.sessionsService.getHostSessions(user.hostId!, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session detail' })
  async findById(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  @Patch(':id')
  @Roles('HOST')
  @ApiOperation({ summary: 'Update session (draft/scheduled only)' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, user.hostId!, dto);
  }

  @Post(':id/publish')
  @Roles('HOST')
  @ApiOperation({ summary: 'Publish a draft session' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionsService.publish(id, user.hostId!);
  }

  @Post(':id/start')
  @Roles('HOST')
  @ApiOperation({ summary: 'Start a session (go live)' })
  async start(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionsService.startSession(id, user.hostId!);
  }

  @Post(':id/advance-phase')
  @Roles('HOST')
  @ApiOperation({ summary: 'Advance to next session phase' })
  async advancePhase(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionsService.advancePhase(id, user.hostId!);
  }

  @Post(':id/end')
  @Roles('HOST')
  @ApiOperation({ summary: 'End a live session immediately' })
  async end(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionsService.endSession(id, user.hostId!);
  }

  @Post(':id/cancel')
  @Roles('HOST')
  @ApiOperation({ summary: 'Cancel a session' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason: string,
  ) {
    return this.sessionsService.cancelSession(id, user.hostId!, reason);
  }

  @Post(':id/verify')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Manually verify a completed session (admin)' })
  async verify(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.sessionsService.verifySession(id, admin.id);
  }
}
