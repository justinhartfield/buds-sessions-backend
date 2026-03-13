import { IsString, IsOptional, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GuestInviteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inviteMessage?: string;
}

export class AddGuestsDto {
  @ApiProperty({ type: [GuestInviteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestInviteDto)
  guests: GuestInviteDto[];

  @ApiPropertyOptional({ default: 'host_direct' })
  @IsOptional()
  @IsString()
  invitedBy?: string;
}
