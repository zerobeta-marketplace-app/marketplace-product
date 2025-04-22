import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':sellerId')
  @ApiOperation({ summary: 'Add new product for seller' })
  @ApiParam({ name: 'sellerId', type: Number, example: 3 })
  @ApiBody({ type: CreateProductDto })
  create(
    @Param('sellerId', ParseIntPipe) sellerId: number,
    @Body() dto: CreateProductDto
  ) {
    return this.productService.createProduct(sellerId, dto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'Get all products by seller ID' })
  @ApiParam({ name: 'sellerId', type: Number, example: 3 })
  getProductsBySeller(@Param('sellerId') sellerId: string) {
    return this.productService.getProductsBySeller(+sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all products (with caching)' })
  findAll() {
    return this.productService.getAllProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/inventory')
  @ApiOperation({ summary: 'Update product inventory' })
  @ApiParam({ name: 'id', type: Number, example: 5 })
  @ApiBody({ schema: { example: { quantity: 50 } } })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number
  ) {
    return this.productService.updateInventory(id, quantity);
  }
}
