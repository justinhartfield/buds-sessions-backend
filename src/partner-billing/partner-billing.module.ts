import { Module } from '@nestjs/common';
import { PartnerBillingController } from './partner-billing.controller';
import { PartnerBillingService } from './partner-billing.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [PartnerBillingController],
  providers: [PartnerBillingService],
  exports: [PartnerBillingService],
})
export class PartnerBillingModule {}
