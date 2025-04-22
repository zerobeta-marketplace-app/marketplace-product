import { IsNotEmpty, IsString, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'P1001' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'A reliable mouse for daily use', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  availableStock: number;
}
