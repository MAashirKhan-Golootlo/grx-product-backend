import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecordStatus } from '../../../shared/enums';

@Entity('tenants')
export class TenantEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ApiProperty()
  @Column({ unique: true })
  code!: string;

  @ApiProperty()
  @Column()
  name!: string;

  @ApiProperty({ enum: RecordStatus })
  @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.ACTIVE })
  status!: RecordStatus;

  @ApiProperty({ default: true })
  @Column({ default: true })
  integrationEnabled!: boolean;

  @ApiHideProperty()
  @Column({ type: 'varchar', nullable: true, select: false })
  clientSecretHash?: string | null;

  @ApiHideProperty()
  @Column({ type: 'text', nullable: true, select: false })
  clientSecretEncrypted?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
