import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnerLeadsService } from './partner-leads.service';

@Controller('partners/leads')
@UseGuards(JwtAuthGuard)
export class PartnerLeadsController {
  constructor(private readonly leadsService: PartnerLeadsService) {}

  @Get()
  async getLeads(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('session_id') sessionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadsService.getLeads(userId, {
      status,
      sessionId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post(':id/acknowledge')
  async acknowledgeLead(
    @CurrentUser('id') userId: string,
    @Param('id') leadId: string,
  ) {
    return this.leadsService.acknowledgeLead(userId, leadId);
  }

  @Post(':id/convert')
  async convertLead(
    @CurrentUser('id') userId: string,
    @Param('id') leadId: string,
    @Body('conversionValueCents') conversionValueCents?: number,
  ) {
    return this.leadsService.convertLead(userId, leadId, conversionValueCents);
  }
}
