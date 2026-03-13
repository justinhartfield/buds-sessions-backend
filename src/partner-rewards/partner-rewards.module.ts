import { Module } from '@nestjs/common';
import { PartnerRewardsController } from './partner-rewards.controller';
import { PartnerRewardsService } from './partner-rewards.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [PartnerRewardsController],
  providers: [PartnerRewardsService],
  exports: [PartnerRewardsService],
})
export class PartnerRewardsModule {}
