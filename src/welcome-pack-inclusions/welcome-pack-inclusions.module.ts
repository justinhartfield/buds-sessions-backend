import { Module } from '@nestjs/common';
import { WelcomePackInclusionsController } from './welcome-pack-inclusions.controller';
import { WelcomePackInclusionsService } from './welcome-pack-inclusions.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [WelcomePackInclusionsController],
  providers: [WelcomePackInclusionsService],
  exports: [WelcomePackInclusionsService],
})
export class WelcomePackInclusionsModule {}
