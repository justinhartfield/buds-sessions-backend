import { IsEnum, IsString } from 'class-validator';

export enum PartnerTier {
  COMMUNITY = 'COMMUNITY',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  TITLE_SPONSOR = 'TITLE_SPONSOR',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export class SubscribeDto {
  @IsEnum(PartnerTier)
  tier: PartnerTier;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

export class CancelSubscriptionDto {
  @IsString()
  reason: string;
}
