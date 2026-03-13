import { Module } from '@nestjs/common';
import { PartnerAnalyticsController } from './partner-analytics.controller';
import { PartnerAnalyticsService } from './partner-analytics.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [PartnerAnalyticsController],
  providers: [PartnerAnalyticsService],
  exports: [PartnerAnalyticsService],
})
export class PartnerAnalyticsModule {}
