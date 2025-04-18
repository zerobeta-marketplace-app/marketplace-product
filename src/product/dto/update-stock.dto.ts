import { IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(0)
  newStock: number;
}
