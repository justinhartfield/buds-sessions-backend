import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnersService } from './partners.service';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { UpdatePartnerDto, InviteTeamMemberDto, UpdateTeamMemberDto } from './dto/update-partner.dto';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Body() dto: RegisterPartnerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.partnersService.register(dto, userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: string) {
    return this.partnersService.getMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.updateMe(userId, dto);
  }

  @Post('me/logo')
  @UseGuards(JwtAuthGuard)
  async uploadLogo(
    @CurrentUser('id') userId: string,
    @Body('logoUrl') logoUrl: string,
  ) {
    // In production, this would use a file upload interceptor
    // and generate a presigned S3 URL. For now, accept a URL.
    return this.partnersService.uploadLogo(userId, logoUrl);
  }

  @Post('me/verification-docs')
  @UseGuards(JwtAuthGuard)
  async uploadVerificationDocs(
    @CurrentUser('id') userId: string,
    @Body('documentUrls') documentUrls: string[],
  ) {
    return this.partnersService.uploadVerificationDocs(userId, documentUrls);
  }

  @Get('me/team')
  @UseGuards(JwtAuthGuard)
  async getTeamMembers(@CurrentUser('id') userId: string) {
    return this.partnersService.getTeamMembers(userId);
  }

  @Post('me/team')
  @UseGuards(JwtAuthGuard)
  async inviteTeamMember(
    @CurrentUser('id') userId: string,
    @Body() dto: InviteTeamMemberDto,
  ) {
    return this.partnersService.inviteTeamMember(userId, dto);
  }

  @Patch('me/team/:memberId')
  @UseGuards(JwtAuthGuard)
  async updateTeamMember(
    @CurrentUser('id') userId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.partnersService.updateTeamMember(userId, memberId, dto);
  }

  @Delete('me/team/:memberId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTeamMember(
    @CurrentUser('id') userId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.partnersService.removeTeamMember(userId, memberId);
  }

  @Get('directory')
  async getDirectory(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('tier') tier?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.partnersService.getDirectory({
      city,
      category,
      tier,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
