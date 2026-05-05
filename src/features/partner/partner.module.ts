import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerController } from './partner.controller';
import { PartnerApiKeyEntity } from './entities/partner-api-key.entity';
import { PartnerEntity } from './entities/partner.entity';
import { PartnerService } from './partner.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerEntity, PartnerApiKeyEntity])],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService, TypeOrmModule],
})
export class PartnerModule {}
