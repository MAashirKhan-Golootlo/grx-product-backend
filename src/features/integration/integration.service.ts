import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import { PartnerProductEntity } from '../partner-product/entities/partner-product.entity';
import { TenantEntity } from '../tenant/entities/tenant.entity';
import { CreateIntegrationOrderDto } from './dto/create-integration-order.dto';

export interface IntegrationCategoryResponse {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
}

export interface IntegrationProductResponse {
  id: string;
  partnerId: string;
  productId: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category: {
      id: string;
      slug: string;
      name: string;
      imageUrl: string | null;
    };
  };
  tenantId: number | null;
  allocatedStock: number;
  availableStock: number;
  partnerPrice: number;
  currency: string;
  partner: {
    id: string;
    code: string;
    name: string;
    contactEmail: string;
    status: string;
  };
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
      id: row.id,
      partnerId: row.partnerId,
      productId: {
        id: row.productId,
        sku: row.product.sku,
        name: row.product.name,
        description: row.product.description ?? null,
        imageUrl: row.product.imageUrl ?? null,
        category: {
          id: row.product.category.id,
          slug: row.product.category.slug,
          name: row.product.category.name,
          imageUrl: row.product.category.imageUrl ?? null,
        },
      },
      tenantId: row.tenantId ?? null,
      allocatedStock: row.allocatedStock,
      availableStock: row.availableStock,
      partnerPrice: Number(row.partnerPrice),
      currency: row.currency,
      partner: {
        id: row.partner.id,
        code: row.partner.code,
        name: row.partner.name,
        contactEmail: row.partner.contactEmail,
        status: row.partner.status,
      },
    }));
  }

  public async listCategories(
    tenant: TenantEntity,
  ): Promise<IntegrationCategoryResponse[]> {
    const rows = await this.partnerProductRepository.find({
      where: [{ tenantId: tenant.id }, { tenantId: IsNull() }],
      order: { createdAt: 'DESC' },
    });

    const seen = new Set<string>();
    const categories: IntegrationCategoryResponse[] = [];
    for (const row of rows) {
      const catId = row.product.category.id;
      if (!seen.has(catId)) {
        seen.add(catId);
        categories.push({
          id: catId,
          slug: row.product.category.slug,
          name: row.product.category.name,
          imageUrl: row.product.category.imageUrl ?? null,
        });
      }
    }
    return categories.sort((a, b) => a.name.localeCompare(b.name));
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
      customerId: dto.customerId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      items: normalizedItems,
    };
    return this.orderService.create(createOrderDto);
  }

  public async getOrderForTenant(
    tenant: TenantEntity,
    orderId: string,
  ): Promise<OrderEntity> {
    const order = await this.orderService.findOne(orderId);
    if (order.tenantId !== tenant.id) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  public async getOrderByOrderNoForTenant(
    tenant: TenantEntity,
    orderNo: string,
  ): Promise<OrderEntity> {
    const order = await this.orderService.findByOrderNo(orderNo);
    if (!order || order.tenantId !== tenant.id) {
      throw new NotFoundException(`Order ${orderNo} not found`);
    }
    return order;
  }
}
