import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateKitDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsString()
  @MaxLength(2000)
  contentsDescription: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetFormats?: string[];

  @IsOptional()
  @IsString()
  minHostTier?: string;

  @IsInt()
  @Min(1)
  quantityAvailable: number;

  @IsInt()
  @Min(1)
  shippingLeadDays: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
