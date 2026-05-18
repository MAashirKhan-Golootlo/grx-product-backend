import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecordStatus } from '../../../shared/enums';

@Entity('categories')
export class CategoryEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ unique: true })
  slug!: string;

  @ApiProperty()
  @Column()
  name!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true, default: null })
  imageUrl?: string;

  @ApiProperty({ enum: RecordStatus })
  @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.ACTIVE })
  status!: RecordStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
