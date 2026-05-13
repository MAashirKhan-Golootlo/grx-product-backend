import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PartnerEntity } from '../../partner/entities/partner.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('partner_products')
@Unique(['partnerId', 'productId', 'tenantId'])
export class PartnerProductEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  partnerId!: string;

  @Column()
  productId!: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  allocatedStock!: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  availableStock!: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  partnerPrice!: number;

  @Column({ length: 3, default: 'PKR' })
  currency!: string;

  @ManyToOne(() => PartnerEntity, { eager: true })
  @JoinColumn({ name: 'partnerId' })
  partner!: PartnerEntity;

  @ManyToOne(() => ProductEntity, { eager: true })
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;

  @ManyToOne(() => TenantEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant?: TenantEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
