import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { OrderEntity } from '../order/entities/order.entity';
import { TenantEntity } from '../tenant/entities/tenant.entity';
import { CreateIntegrationOrderDto } from './dto/create-integration-order.dto';
import { TenantIntegrationAuthGuard } from './guards/tenant-integration-auth.guard';
import {
  IntegrationProductResponse,
  IntegrationService,
} from './integration.service';

type IntegrationRequest = Request & { tenant: TenantEntity };

@ApiTags('Tenant Integration')
@ApiBasicAuth('tenant-basic')
@Controller('integration')
export class IntegrationController {
  public constructor(private readonly integrationService: IntegrationService) {}

  @Get('products')
  @Public()
  @UseGuards(TenantIntegrationAuthGuard)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'List products for tenant integration' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          partnerProductId: '6a4b4664-cf4b-4caf-aa8f-0e4a3eb16b7e',
          partnerId: '7f5b5f2a-12c3-44b9-bec0-0e85f9df2cce',
          productId: '64616cb5-aa2d-44ee-b0e9-31f9672f2e30',
          tenantId: 101,
          sku: 'SKU-1001',
          name: 'Sample Product',
          description: 'Product description',
          imageUrl: '/uploads/image.png',
          price: 1100,
          currency: 'PKR',
          availableStock: 25,
        },
      ],
    },
  })
  public listProducts(
    @Req() req: IntegrationRequest,
  ): Promise<IntegrationProductResponse[]> {
    return this.integrationService.listProducts(req.tenant);
  }

  @Post('orders')
  @Public()
  @UseGuards(TenantIntegrationAuthGuard)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Place order for tenant integration',
    description:
      'Requires Basic auth: username = tenant numeric clientId, password = clientSecret. Body must include customer fields and line items.',
  })
  @ApiBody({
    type: CreateIntegrationOrderDto,
    examples: {
      full: {
        summary: 'Order with customer + items',
        value: {
          partnerId: '7f5b5f2a-12c3-44b9-bec0-0e85f9df2cce',
          customerId: 'wallet-user-5501',
          customerName: 'Ali Khan',
          customerPhone: '+923001234567',
          customerEmail: 'ali@example.com',
          items: [
            {
              productId: '64616cb5-aa2d-44ee-b0e9-31f9672f2e30',
              quantity: 1,
              unitPrice: 1800,
            },
            {
              productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              quantity: 2,
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({ type: OrderEntity })
  public placeOrder(
    @Req() req: IntegrationRequest,
    @Body() dto: CreateIntegrationOrderDto,
  ): Promise<OrderEntity> {
    return this.integrationService.placeOrder(req.tenant, dto);
  }
}
