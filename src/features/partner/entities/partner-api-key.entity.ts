import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PartnerEntity } from './partner.entity';

@Entity('partner_api_keys')
export class PartnerApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  partnerId!: string;

  @Column()
  keyPrefix!: string;

  @Column()
  keyHash!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => PartnerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner!: PartnerEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
