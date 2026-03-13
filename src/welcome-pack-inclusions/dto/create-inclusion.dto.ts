import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateInclusionDto {
  @IsString()
  @MaxLength(200)
  productName: string;

  @IsString()
  @MaxLength(2000)
  productDescription: string;

  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productDimensions?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  productWeightGrams?: number;

  @IsInt()
  @Min(1)
  quantityAvailable: number;

  @IsString()
  @Matches(/^\d{4}-Q[1-4]$/, { message: 'targetQuarter must be in format YYYY-Q1/Q2/Q3/Q4' })
  targetQuarter: string;
}
