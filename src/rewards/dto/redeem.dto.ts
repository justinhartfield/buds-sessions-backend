import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemDto {
  @ApiProperty({ description: 'ID of the reward catalog item to redeem' })
  @IsString()
  rewardCatalogItemId: string;
}
