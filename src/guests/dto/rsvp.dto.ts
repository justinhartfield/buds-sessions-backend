import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RsvpDto {
  @ApiProperty({ enum: ['ACCEPTED', 'DECLINED', 'WAITLISTED'] })
  @IsEnum(['ACCEPTED', 'DECLINED', 'WAITLISTED'] as const)
  response: 'ACCEPTED' | 'DECLINED' | 'WAITLISTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  declineReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dietaryNotes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPlusOne?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plusOneName?: string;
}
