import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecordStatus } from '../../../shared/enums';

@Entity('users')
export class UserEntity {
  @ApiProperty({ example: '9e9b9be0-6c20-4ac4-8b28-98bddf56856a' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  fullName!: string;

  @ApiHideProperty()
  @Column()
  passwordHash!: string;

  @ApiProperty({ example: 'active' })
  @Column({
    type: 'enum',
    enum: RecordStatus,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
