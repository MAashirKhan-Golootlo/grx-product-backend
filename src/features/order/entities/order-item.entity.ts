import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../product/entities/product.entity';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @ManyToOne(() => ProductEntity, { eager: true })
  product!: ProductEntity;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  order!: OrderEntity;

  @Column({ type: 'int' })
  quantity!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice!: number;
}
