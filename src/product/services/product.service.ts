import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @Inject('PRODUCT_KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    const saved = await this.productRepo.save(product);
    await this.cacheManager.del('products'); // invalidate cache

     // Kafka emit
     this.kafkaClient.emit('product.created', {
        id: saved.id,
        productCode: saved.productCode,
        productName: saved.productName,
        price: saved.price,
        stock: saved.availableStock,
        sellerId: saved.sellerId,
      });
    return saved;
  }

  async getAllProducts(): Promise<Product[]> {
    const cached = await this.cacheManager.get<Product[]>('products');
    if (cached) return cached;

    const products = await this.productRepo.find();
    await this.cacheManager.set('products', products, 1800); // 30 min cache
    return products;
  }

  async updateInventory(productId: number, quantity: number) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    product.availableStock = quantity;
    const updated = await this.productRepo.save(product);
    await this.cacheManager.del('products');

     // Kafka emit
     this.kafkaClient.emit('inventory.updated', {
        productId,
        availableStock: quantity,
      });
    return updated;
  }
  
  async getProductsCached() {
    const cacheKey = 'product:list';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const products = await this.productRepo.find();
    await this.cacheManager.set(cacheKey, products, 30 * 60 * 1000); // TTL 30 mins
    return products;
  }

  async invalidateProductCache() {
    await this.cacheManager.del('product:list');
  }
}
