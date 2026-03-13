import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  IsPhoneNumber,
  Matches,
} from 'class-validator';

export enum BusinessCategory {
  PHARMACY = 'PHARMACY',
  MANUFACTURER = 'MANUFACTURER',
  DOCTOR = 'DOCTOR',
  CBD_STORE = 'CBD_STORE',
  RESTAURANT_CAFE = 'RESTAURANT_CAFE',
  SMOKE_SHOP = 'SMOKE_SHOP',
  CANNABIS_SOCIAL_CLUB = 'CANNABIS_SOCIAL_CLUB',
  WELLNESS_SPA = 'WELLNESS_SPA',
  MUSIC_VENUE = 'MUSIC_VENUE',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  LIFESTYLE_ACCESSORIES = 'LIFESTYLE_ACCESSORIES',
  OTHER = 'OTHER',
}

export class RegisterPartnerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  legalName: string;

  @IsEnum(BusinessCategory)
  category: BusinessCategory;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @MaxLength(200)
  primaryContactName: string;

  @IsEmail()
  primaryContactEmail: string;

  @IsOptional()
  @IsPhoneNumber()
  primaryContactPhone?: string;

  @IsEmail()
  billingEmail: string;

  @IsString()
  streetAddress: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsString()
  @MaxLength(2)
  countryCode: string = 'DE';

  @IsString()
  @Matches(/^[A-Z]{2}\d{9,11}$|^\d{10,13}$/, {
    message: 'Tax ID must be a valid German USt-IdNr. or Steuernummer',
  })
  taxId: string;

  @IsOptional()
  @IsString()
  handelsregisterNumber?: string;
}
