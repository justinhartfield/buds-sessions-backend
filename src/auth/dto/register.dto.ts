import { IsEmail, IsString, MinLength, IsDateString, IsOptional, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Max' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ example: '1990-01-15', description: 'Must be 18+ years old' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Berlin' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'DE', default: 'DE' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;

  @ApiPropertyOptional({ example: 'cannabis_max' })
  @IsOptional()
  @IsString()
  weedDeUsername?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;
}
