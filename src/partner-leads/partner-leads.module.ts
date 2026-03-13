import { Module } from '@nestjs/common';
import { PartnerLeadsController } from './partner-leads.controller';
import { PartnerLeadsService } from './partner-leads.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [PartnerLeadsController],
  providers: [PartnerLeadsService],
  exports: [PartnerLeadsService],
})
export class PartnerLeadsModule {}
