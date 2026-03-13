import { Module } from '@nestjs/common';
import { FeaturedPlacementsController } from './featured-placements.controller';
import { FeaturedPlacementsService } from './featured-placements.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [FeaturedPlacementsController],
  providers: [FeaturedPlacementsService],
  exports: [FeaturedPlacementsService],
})
export class FeaturedPlacementsModule {}
