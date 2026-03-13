import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecapsService } from './recaps.service';
import { CreateRecapDto } from './dto/create-recap.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';

@ApiTags('recaps')
@Controller('sessions/:sessionId/recap')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RecapsController {
  constructor(private recapsService: RecapsService) {}

  @Post()
  @Roles('HOST')
  @ApiOperation({ summary: 'Submit a session recap' })
  async create(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRecapDto,
  ) {
    return this.recapsService.create(sessionId, user.hostId!, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get recap for a session' })
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.recapsService.findBySessionId(sessionId);
  }

  @Post('photos')
  @Roles('HOST')
  @ApiOperation({ summary: 'Add a photo to a recap' })
  async addPhoto(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: { photoUrl: string; caption?: string; isCover?: boolean },
  ) {
    const recap = await this.recapsService.findBySessionId(sessionId);
    return this.recapsService.addPhoto(recap.id, user.hostId!, data);
  }
}
