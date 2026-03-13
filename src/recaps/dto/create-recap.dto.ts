import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecapDto {
  @ApiProperty({ minLength: 100 })
  @IsString()
  @MinLength(100)
  summary: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatWorked?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatToImprove?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  guestCountActual: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  energyLevel?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  conversationDepth?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  overallSatisfaction?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bestConversationTopic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureMoment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  wouldRepeatFormat?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strainsFeatured?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  foodServed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  musicPlaylistUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  postcardFilled?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  // Sponsor fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sponsorMentioned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sponsorProductUsed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sponsorProductReception?: string;
}
