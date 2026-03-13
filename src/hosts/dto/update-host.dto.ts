import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GatheringFormat } from '@prisma/client';

export class UpdateHostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ enum: GatheringFormat, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(GatheringFormat, { each: true })
  specialties?: GatheringFormat[];
}
