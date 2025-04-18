import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { Product } from './entities/product.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Register Product entity with TypeORM
    ClientsModule.register([
        {
          name: 'PRODUCT_KAFKA_SERVICE',
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'product-service',
              brokers: ['kafka:29092'],
            },
            consumer: {
              groupId: 'product-consumer',
            },
          },
        },
      ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // if other modules/services (like order) need access to product logic
})
export class ProductModule {}
