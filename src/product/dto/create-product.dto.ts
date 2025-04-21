import { IsNotEmpty, IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateProductDto {

  @IsString()
  @IsNotEmpty()
  productCode: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  availableStock: number;
}
