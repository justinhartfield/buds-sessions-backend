import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersAdminController } from './partners-admin.controller';
import { PartnersService } from './partners.service';

@Module({
  controllers: [PartnersController, PartnersAdminController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
