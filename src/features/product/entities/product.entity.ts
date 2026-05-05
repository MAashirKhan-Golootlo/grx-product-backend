import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecordStatus } from '../../../shared/enums';
import { CategoryEntity } from '../../category/entities/category.entity';

@Entity('products')
export class ProductEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ unique: true })
  sku!: string;

  @ApiProperty()
  @Column()
  name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  basePrice!: number;

  @ApiProperty()
  @Column({ length: 3, default: 'PKR' })
  currency!: string;

  @ApiProperty({ enum: RecordStatus })
  @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.ACTIVE })
  status!: RecordStatus;

  @Column()
  categoryId!: string;

  @ManyToOne(() => CategoryEntity, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
