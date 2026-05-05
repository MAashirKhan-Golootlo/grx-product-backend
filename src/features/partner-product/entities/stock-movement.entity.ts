import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockMovementType } from '../../../shared/enums';
import { OrderItemEntity } from '../../order/entities/order-item.entity';
import { PartnerProductEntity } from './partner-product.entity';

@Entity('stock_movements')
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  partnerProductId!: string;

  @Column({ nullable: true })
  orderItemId?: string;

  @Column({ type: 'enum', enum: StockMovementType })
  type!: StockMovementType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'int' })
  beforeQty!: number;

  @Column({ type: 'int' })
  afterQty!: number;

  @ManyToOne(() => PartnerProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerProductId' })
  partnerProduct!: PartnerProductEntity;

  @ManyToOne(() => OrderItemEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'orderItemId' })
  orderItem?: OrderItemEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
