import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../../shared/enums';
import { PartnerEntity } from '../../partner/entities/partner.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ unique: true })
  orderNo!: string;

  @Column()
  tenantId!: number;

  @Column()
  partnerId!: string;

  @ApiProperty({ enum: OrderStatus })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status!: OrderStatus;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  customerId?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  customerName?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  customerPhone?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  customerEmail?: string | null;

  @ManyToOne(() => TenantEntity, { eager: true })
  @JoinColumn({ name: 'tenantId' })
  tenant!: TenantEntity;

  @ManyToOne(() => PartnerEntity, { eager: true })
  @JoinColumn({ name: 'partnerId' })
  partner!: PartnerEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
