import { IsString, IsOptional, IsArray, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GatheringFormat } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Why do you want to host?', minLength: 50 })
  @IsString()
  @MinLength(50)
  motivation: string;

  @ApiProperty({ description: 'What kind of gatherings do you envision?', minLength: 50 })
  @IsString()
  @MinLength(50)
  gatheringVision: string;

  @ApiProperty({ example: 'Berlin' })
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weedDeUsername?: string;

  @ApiPropertyOptional({ enum: GatheringFormat, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(GatheringFormat, { each: true })
  preferredFormats?: GatheringFormat[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hostingExperience?: string;

  @ApiPropertyOptional({ description: 'Referral code from existing host' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
