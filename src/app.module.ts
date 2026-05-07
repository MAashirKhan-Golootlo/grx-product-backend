import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CategoryModule } from './features/category/category.module';
import { LoggerModule } from './common/logger/logger.module';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { OrderModule } from './features/order/order.module';
import { PartnerModule } from './features/partner/partner.module';
import { PartnerProductModule } from './features/partner-product/partner-product.module';
import { ProductModule } from './features/product/product.module';
import { TenantModule } from './features/tenant/tenant.module';
import { UploadModule } from './features/upload/upload.module';
import { UserModule } from './features/user/user.module';
import { IntegrationModule } from './features/integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttle.ttlMs', 60_000),
            limit: configService.get<number>('throttle.limit', 150),
          },
        ],
      }),
    }),
    DatabaseModule,
    LoggerModule,
    UserModule,
    AuthModule,
    TenantModule,
    CategoryModule,
    ProductModule,
    PartnerModule,
    PartnerProductModule,
    OrderModule,
    UploadModule,
    IntegrationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
