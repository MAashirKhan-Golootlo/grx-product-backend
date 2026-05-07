import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import { PartnerProductEntity } from '../partner-product/entities/partner-product.entity';
import { TenantEntity } from '../tenant/entities/tenant.entity';
import { CreateIntegrationOrderDto } from './dto/create-integration-order.dto';

export interface IntegrationProductResponse {
  partnerProductId: string;
  partnerId: string;
  productId: string;
  tenantId: number | null;
  sku: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  currency: string;
  availableStock: number;
}

@Injectable()
export class IntegrationService {
  public constructor(
    @InjectRepository(PartnerProductEntity)
    private readonly partnerProductRepository: Repository<PartnerProductEntity>,
    private readonly orderService: OrderService,
  ) {}

  public async listProducts(
    tenant: TenantEntity,
  ): Promise<IntegrationProductResponse[]> {
    const rows = await this.partnerProductRepository.find({
      where: [{ tenantId: tenant.id }, { tenantId: IsNull() }],
      order: { createdAt: 'DESC' },
    });

    const deduped = new Map<string, PartnerProductEntity>();
    for (const row of rows) {
      const key = `${row.partnerId}:${row.productId}`;
      const current = deduped.get(key);
      if (!current) {
        deduped.set(key, row);
        continue;
      }
      if (current.tenantId !== tenant.id && row.tenantId === tenant.id) {
        deduped.set(key, row);
      }
    }

    return [...deduped.values()].map((row) => ({
      partnerProductId: row.id,
      partnerId: row.partnerId,
      productId: row.productId,
      tenantId: row.tenantId ?? null,
      sku: row.product.sku,
      name: row.product.name,
      description: row.product.description ?? null,
      imageUrl: row.product.imageUrl ?? null,
      price: Number(row.partnerPrice),
      currency: row.currency,
      availableStock: row.availableStock,
    }));
  }

  public async placeOrder(
    tenant: TenantEntity,
    dto: CreateIntegrationOrderDto,
  ): Promise<OrderEntity> {
    const normalizedItems = await Promise.all(
      dto.items.map(async (item) => {
        const partnerProduct = await this.partnerProductRepository
          .createQueryBuilder('partnerProduct')
          .where('partnerProduct.partnerId = :partnerId', {
            partnerId: dto.partnerId,
          })
          .andWhere('partnerProduct.productId = :productId', {
            productId: item.productId,
          })
          .andWhere(
            '(partnerProduct.tenantId = :tenantId OR partnerProduct.tenantId IS NULL)',
            {
              tenantId: tenant.id,
            },
          )
          .orderBy(
            'CASE WHEN partnerProduct.tenantId = :tenantId THEN 0 ELSE 1 END',
            'ASC',
          )
          .setParameter('tenantId', tenant.id)
          .getOne();

        if (!partnerProduct) {
          throw new NotFoundException(
            `No partner stock mapping found for product ${item.productId}`,
          );
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? Number(partnerProduct.partnerPrice),
        };
      }),
    );

    const createOrderDto: CreateOrderDto = {
      tenantId: tenant.id,
      partnerId: dto.partnerId,
      items: normalizedItems,
    };
    return this.orderService.create(createOrderDto);
  }
}
