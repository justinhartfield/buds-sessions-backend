import { Module } from '@nestjs/common';
import { WelcomePacksController } from './welcome-packs.controller';
import { WelcomePacksService } from './welcome-packs.service';

@Module({
  controllers: [WelcomePacksController],
  providers: [WelcomePacksService],
  exports: [WelcomePacksService],
})
export class WelcomePacksModule {}
