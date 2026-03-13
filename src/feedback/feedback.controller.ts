import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('feedback')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post('sessions/:sessionId/feedback')
  @ApiOperation({ summary: 'Submit feedback for a session' })
  async create(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.create(sessionId, user.id, dto);
  }

  @Get('sessions/:sessionId/feedback')
  @ApiOperation({ summary: 'Get all feedback for a session' })
  async getSessionFeedback(@Param('sessionId') sessionId: string) {
    return this.feedbackService.getSessionFeedback(sessionId);
  }

  @Get('hosts/me/feedback')
  @Roles('HOST')
  @ApiOperation({ summary: 'Get all feedback for current host' })
  async getMyFeedback(@CurrentUser() user: AuthenticatedUser) {
    return this.feedbackService.getHostFeedback(user.hostId!);
  }
}
