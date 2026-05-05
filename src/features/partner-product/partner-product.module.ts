import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerProductController } from './partner-product.controller';
import { PartnerProductEntity } from './entities/partner-product.entity';
import { StockMovementEntity } from './entities/stock-movement.entity';
import { PartnerProductService } from './partner-product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnerProductEntity, StockMovementEntity]),
  ],
  controllers: [PartnerProductController],
  providers: [PartnerProductService],
  exports: [PartnerProductService, TypeOrmModule],
})
export class PartnerProductModule {}
