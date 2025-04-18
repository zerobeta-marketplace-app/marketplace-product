import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('products')
  export class Product {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'seller_id' })
    sellerId: number;
  
    @Column({ name: 'product_code', unique: true })
    productCode: string;
  
    @Column({ name: 'product_name' })
    productName: string;
  
    @Column({ name: 'short_description', length: 100, nullable: true })
    shortDescription: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
  
    @Column({ name: 'available_stock', default: 0 })
    availableStock: number;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  