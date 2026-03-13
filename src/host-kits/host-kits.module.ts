import { Module } from '@nestjs/common';
import { HostKitsController } from './host-kits.controller';
import { HostKitsService } from './host-kits.service';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [PartnersModule],
  controllers: [HostKitsController],
  providers: [HostKitsService],
  exports: [HostKitsService],
})
export class HostKitsModule {}
