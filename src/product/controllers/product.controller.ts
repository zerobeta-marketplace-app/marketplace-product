import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post(':sellerId')
  @ApiOperation({ summary: 'Add new product for seller' })
  create(
    @Param('sellerId', ParseIntPipe) sellerId: number,
    @Body() dto: CreateProductDto) {
      console.log('✅ Received sellerId from param:', sellerId);
      console.log('📥 DTO body:', dto);
    return this.productService.createProduct(+sellerId, dto);
  }

  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'Get all products by seller ID' })
  getProductsBySeller(@Param('sellerId') sellerId: string) {
    return this.productService.getProductsBySeller(+sellerId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with caching)' })
  findAll() {
    console.log(`📦fetching all products  ${this.productService.getAllProducts()}`)
    return this.productService.getAllProducts();
  }

  @Patch(':id/inventory')
  @ApiOperation({ summary: 'Update product inventory' })
  updateStock(@Param('id', ParseIntPipe) id: number, @Body('quantity') quantity: number) {
    return this.productService.updateInventory(id, quantity);
  }
}
