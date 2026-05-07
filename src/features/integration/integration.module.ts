import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { PartnerProductEntity } from '../partner-product/entities/partner-product.entity';
import { TenantModule } from '../tenant/tenant.module';
import { IntegrationController } from './integration.controller';
import { TenantIntegrationAuthGuard } from './guards/tenant-integration-auth.guard';
import { IntegrationService } from './integration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnerProductEntity]),
    OrderModule,
    TenantModule,
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService, TenantIntegrationAuthGuard],
})
export class IntegrationModule {}
