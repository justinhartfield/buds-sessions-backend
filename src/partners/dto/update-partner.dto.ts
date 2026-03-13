import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  primaryContactName?: string;

  @IsOptional()
  @IsEmail()
  primaryContactEmail?: string;

  @IsOptional()
  @IsPhoneNumber()
  primaryContactPhone?: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}

export class InviteTeamMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  role: 'PARTNER_ADMIN' | 'PARTNER_MARKETER' | 'PARTNER_VIEWER';
}

export class UpdateTeamMemberDto {
  @IsString()
  role: 'PARTNER_ADMIN' | 'PARTNER_MARKETER' | 'PARTNER_VIEWER';
}
