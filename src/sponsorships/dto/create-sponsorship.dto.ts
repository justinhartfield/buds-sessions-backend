import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  MaxLength,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SponsorshipType {
  SESSION_BASIC = 'SESSION_BASIC',
  SESSION_ENHANCED = 'SESSION_ENHANCED',
  SESSION_PREMIUM = 'SESSION_PREMIUM',
  FORMAT_CITY = 'FORMAT_CITY',
  FORMAT_NATIONAL = 'FORMAT_NATIONAL',
  FORMAT_EXCLUSIVE_NATIONAL = 'FORMAT_EXCLUSIVE_NATIONAL',
}

export class BrandedCardDto {
  @IsString()
  @MaxLength(500)
  promptText: string;

  @IsString()
  @MaxLength(200)
  attributionText: string;

  @IsString()
  targetPhase: string;
}

export class CreateSponsorshipDto {
  @IsEnum(SponsorshipType)
  type: SponsorshipType;

  // For session sponsorships
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  // For format sponsorships
  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandedCardDto)
  brandedCards?: BrandedCardDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  productSamplesDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  leaveBehindDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;
}

export class UpdateSponsorshipDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandedCardDto)
  brandedCards?: BrandedCardDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  productSamplesDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  leaveBehindDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CancelSponsorshipDto {
  @IsString()
  @MaxLength(500)
  reason: string;
}

export class HostCounterProposalDto {
  @IsString()
  @MaxLength(1000)
  counterProposal: string;
}

export class HostDeclineDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
