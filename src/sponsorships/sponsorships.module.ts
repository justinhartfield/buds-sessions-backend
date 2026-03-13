import { Module } from '@nestjs/common';
import { SponsorshipsController } from './sponsorships.controller';
import { SponsorshipsService } from './sponsorships.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [SponsorshipsController],
  providers: [SponsorshipsService],
  exports: [SponsorshipsService],
})
export class SponsorshipsModule {}
