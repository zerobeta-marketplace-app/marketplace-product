import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { ClientKafka } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @Inject('PRODUCT_KAFKA_SERVICE')
    @Inject(HttpService)
    private readonly httpService: HttpService,

    @Inject('PRODUCT_KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async createProduct(sellerId: number, dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...dto,
      sellerId,
    });
    console.log('Product to be saved:', product);
    const saved = await this.productRepo.save(product);

    // Invalidate Redis cache
    await this.cacheManager.del('products');

    // Emit Kafka event
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

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return await this.productRepo.find({
      where: { sellerId },
    });
  }

  async getAllProducts(): Promise<Product[]> {
    const cached = await this.cacheManager.get<Product[]>('products');
    if (cached) return cached;

    const products = await this.productRepo.find();
    // Make REST calls to get seller info
  const enrichedProducts = await Promise.all(
    products.map(async (product) => {
      try {
        
        const { data: seller } = await axios.get(
          `http://user-service:3004/users/${product.sellerId}`
        );

        console.log('Seller data:', seller.firstName, seller.lastName);
        return {
          ...product,
          sellerName: `${seller.firstName} ${seller.lastName}`,
          sellerCountry: seller.country,
        };
      } catch (error) {
        console.error(`Failed to fetch seller info for ID ${product.sellerId}`);
        return {
          ...product,
          sellerName: 'Unknown',
          sellerCountry: 'Unknown',
        };
      }
    })
  );

  await this.cacheManager.set('products', enrichedProducts, 1800);
  return enrichedProducts;
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
