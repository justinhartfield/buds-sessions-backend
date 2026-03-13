import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GatheringFormat } from '@prisma/client';

export class CreateSessionDto {
  @ApiProperty({ example: 'Vinyl Night in Kreuzberg' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: GatheringFormat })
  @IsEnum(GatheringFormat)
  format: GatheringFormat;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customFormatName?: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ example: '19:00' })
  @IsString()
  scheduledStartTime: string;

  @ApiProperty({ example: '22:30' })
  @IsString()
  scheduledEndTime: string;

  @ApiPropertyOptional({ default: 'Europe/Berlin' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'home', enum: ['home', 'outdoor', 'rented_space', 'other'] })
  @IsString()
  venueType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueAddress?: string;

  @ApiProperty({ example: 'Berlin' })
  @IsString()
  venueCity: string;

  @ApiPropertyOptional({ default: 'DE' })
  @IsOptional()
  @IsString()
  venueCountryCode?: string;

  @ApiPropertyOptional({ default: 4, minimum: 2 })
  @IsOptional()
  @IsInt()
  @Min(2)
  minGuests?: number;

  @ApiPropertyOptional({ default: 12, maximum: 20 })
  @IsOptional()
  @IsInt()
  @Max(20)
  maxGuests?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  idealGuests?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  atmosphereChecklist?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  supplyChecklist?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conversationCardDeckId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  playlistUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureElement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hostPrivateNotes?: string;
}
