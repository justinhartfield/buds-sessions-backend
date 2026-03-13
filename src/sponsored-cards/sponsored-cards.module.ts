import { Module } from '@nestjs/common';
import { SponsoredCardsController } from './sponsored-cards.controller';
import { SponsoredCardsService } from './sponsored-cards.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [SponsoredCardsController],
  providers: [SponsoredCardsService],
  exports: [SponsoredCardsService],
})
export class SponsoredCardsModule {}
