import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  atmosphereRating?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  hostRating?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  conversationQuality?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  wouldAttendAgain?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  wouldRecommendHost?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  highlightMoment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  improvementSuggestion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  feltWelcome?: boolean;

  @ApiPropertyOptional({ enum: ['too_small', 'just_right', 'too_large'] })
  @IsOptional()
  @IsString()
  groupSizeFeeling?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  npsScore?: number;

  // Sponsor fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sponsorProductRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sponsorProductComment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  interestedInSponsorProduct?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentShareWithSponsor?: boolean;
}
