import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GuestsService } from './guests.service';
import { AddGuestsDto } from './dto/add-guests.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('guests')
@Controller('sessions/:sessionId/guests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Post()
  @Roles('HOST')
  @ApiOperation({ summary: 'Add guests to a session' })
  async addGuests(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddGuestsDto,
  ) {
    return this.guestsService.addGuests(sessionId, user.hostId!, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get guest list for a session' })
  async getGuests(@Param('sessionId') sessionId: string) {
    return this.guestsService.getSessionGuests(sessionId);
  }

  @Post('rsvp')
  @ApiOperation({ summary: 'RSVP to a session invitation' })
  async rsvp(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RsvpDto,
  ) {
    return this.guestsService.rsvp(sessionId, user.id, dto);
  }

  @Post('check-in/code')
  @ApiOperation({ summary: 'Check in to a session using code' })
  async checkInByCode(
    @Body('code') code: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.guestsService.checkInByCode(code, user.id);
  }

  @Post(':guestUserId/manual-check-in')
  @Roles('HOST')
  @ApiOperation({ summary: 'Host manually checks in a guest' })
  async manualCheckIn(
    @Param('sessionId') sessionId: string,
    @Param('guestUserId') guestUserId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.guestsService.hostManualCheckIn(sessionId, user.hostId!, guestUserId);
  }
}
