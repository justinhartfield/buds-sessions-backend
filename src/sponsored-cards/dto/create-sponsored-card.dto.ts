import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateSponsoredCardDto {
  @IsString()
  @MaxLength(500)
  promptText: string;

  @IsString()
  @MaxLength(200)
  attributionText: string;

  @IsString()
  targetPhase: string; // SessionPhase enum value

  @IsOptional()
  @IsString()
  targetFormat?: string; // GatheringFormat enum value, null = all formats
}
