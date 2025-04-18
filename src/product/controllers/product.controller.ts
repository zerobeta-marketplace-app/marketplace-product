import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Add new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with caching)' })
  findAll() {
    return this.productService.getAllProducts();
  }

  @Patch(':id/inventory')
  @ApiOperation({ summary: 'Update product inventory' })
  updateStock(@Param('id', ParseIntPipe) id: number, @Body('quantity') quantity: number) {
    return this.productService.updateInventory(id, quantity);
  }
}
