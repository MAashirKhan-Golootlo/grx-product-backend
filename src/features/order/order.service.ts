import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../common/pagination/pagination.util';
import { PaginatedResult } from '../../common/pagination/pagination.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import {
  OrderStatus,
  ReturnDisposition,
  StockMovementType,
} from '../../shared/enums';
import { PartnerProductEntity } from '../partner-product/entities/partner-product.entity';
import { StockMovementEntity } from '../partner-product/entities/stock-movement.entity';
import { LoyaltyWebhookService } from '../loyalty-webhook/loyalty-webhook.service';
import {
  applyOrderListFilters,
  createOrderListQueryBuilder,
} from './order-query.util';

const CSV_EXPORT_MAX_ROWS = 10_000;

/** Cancel restores sellable stock only before the order was delivered. */
const PRE_DELIVERY_STATUSES = new Set<OrderStatus>([
  OrderStatus.CREATED,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
]);

@Injectable()
export class OrderService {
  public constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
    private readonly loyaltyWebhook: LoyaltyWebhookService,
  ) {}

  public async create(dto: CreateOrderDto): Promise<OrderEntity> {
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(OrderEntity, {
        orderNo: `ORD-${randomUUID().split('-')[0].toUpperCase()}`,
        tenantId: dto.tenantId,
        partnerId: dto.partnerId,
        customerId: dto.customerId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        items: dto.items,
      });
      const savedOrder = await manager.save(order);

      for (const item of savedOrder.items) {
        const partnerProduct = await manager
          .createQueryBuilder(PartnerProductEntity, 'partnerProduct')
          .setLock('pessimistic_write')
          .where('partnerProduct.partnerId = :partnerId', {
            partnerId: dto.partnerId,
          })
          .andWhere('partnerProduct.productId = :productId', {
            productId: item.productId,
          })
          .andWhere(
            '(partnerProduct.tenantId = :tenantId OR partnerProduct.tenantId IS NULL)',
            {
              tenantId: dto.tenantId,
            },
          )
          .orderBy(
            'CASE WHEN partnerProduct.tenantId = :tenantId THEN 0 ELSE 1 END',
            'ASC',
          )
          .setParameter('tenantId', dto.tenantId)
          .getOne();

        if (!partnerProduct) {
          throw new NotFoundException(
            `No partner stock mapping found for product ${item.productId}`,
          );
        }

        if (partnerProduct.availableStock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
        }

        const beforeQty = partnerProduct.availableStock;
        partnerProduct.availableStock -= item.quantity;
        await manager.save(partnerProduct);

        await manager.save(
          manager.create(StockMovementEntity, {
            partnerProductId: partnerProduct.id,
            orderItemId: item.id,
            type: StockMovementType.CONSUME,
            quantity: item.quantity,
            beforeQty,
            afterQty: partnerProduct.availableStock,
          }),
        );
      }

      return savedOrder;
    });
  }

  public async findAllPaginated(
    query: ListOrdersQueryDto,
  ): Promise<PaginatedResult<OrderEntity>> {
    const { page, limit, skip, take } = normalizePagination(query);
    const qb = applyOrderListFilters(
      createOrderListQueryBuilder(this.orderRepository),
      query,
    );
    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
    return buildPaginatedResult(data, page, limit, total);
  }

  public async exportToCsv(query: ListOrdersQueryDto): Promise<string> {
    const qb = applyOrderListFilters(
      createOrderListQueryBuilder(this.orderRepository),
      query,
    );
    const orders = await qb.take(CSV_EXPORT_MAX_ROWS).getMany();
    return this.buildOrdersCsv(orders);
  }

  private buildOrdersCsv(orders: OrderEntity[]): string {
    const headers = [
      'Order #',
      'Tenant',
      'Partner',
      'Status',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Products',
      'Total (PKR)',
      'Created Date (PKT)',
      'Created Time (PKT)',
    ];
    const rows = orders.map((order) => {
      const total = order.items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );
      const { date, time } = this.formatCreatedAtPkt(order.createdAt);
      return [
        order.orderNo,
        order.tenant?.name ?? String(order.tenantId),
        order.partner?.name ?? order.partnerId,
        order.status,
        order.customerName ?? '',
        order.customerPhone ?? '',
        order.customerEmail ?? '',
        this.formatOrderProducts(order.items),
        total.toFixed(2),
        date,
        time,
      ];
    });
    return [headers, ...rows]
      .map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(','))
      .join('\n');
  }

  private formatOrderProducts(items: OrderItemEntity[]): string {
    if (!items.length) return '';
    return items
      .map((item) => {
        const name = item.product?.name ?? item.productId;
        const sku = item.product?.sku ? ` [${item.product.sku}]` : '';
        return `${name}${sku} x${item.quantity}`;
      })
      .join('; ');
  }

  private formatCreatedAtPkt(createdAt: Date): { date: string; time: string } {
    const date = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(createdAt);

    const time = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(createdAt);

    return { date, time };
  }

  private escapeCsvCell(value: string): string {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  public async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        tenant: true,
        partner: true,
        items: { product: true },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  public async findByOrderNo(orderNo: string): Promise<OrderEntity | null> {
    return this.orderRepository.findOneBy({ orderNo });
  }

  public async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    const status = dto.status;

    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id },
        relations: { items: true },
      });
      if (!order) throw new NotFoundException(`Order ${id} not found`);

      const previousStatus = order.status;
      if (previousStatus === status) {
        return order;
      }

      if (status === OrderStatus.CANCELLED) {
        this.assertCancelAllowed(previousStatus);
      }

      if (status === OrderStatus.RETURNED) {
        this.assertReturnAllowed(previousStatus, dto);
      }

      order.status = status;

      if (
        status === OrderStatus.CANCELLED &&
        previousStatus !== OrderStatus.CANCELLED
      ) {
        if (PRE_DELIVERY_STATUSES.has(previousStatus)) {
          await this.releaseOrderItemsToSellableStock(manager, order);
        }
      }

      if (status === OrderStatus.RETURNED) {
        order.returnDisposition = dto.returnDisposition!;
        order.returnReasonCode = dto.returnReasonCode!.trim();
        order.returnReasonText = dto.returnReasonText?.trim() || null;

        if (dto.returnDisposition === ReturnDisposition.SELLABLE) {
          await this.releaseOrderItemsToSellableStock(manager, order);
        } else {
          await this.moveOrderItemsToQuarantine(manager, order);
        }
      }

      const saved = await manager.save(order);
      void this.loyaltyWebhook.notifyOrderStatusChanged(saved, previousStatus);
      return saved;
    });
  }

  private assertCancelAllowed(previousStatus: OrderStatus): void {
    if (previousStatus === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Delivered orders cannot be cancelled. Use status returned with returnDisposition and returnReasonCode for post-delivery returns.',
      );
    }
    if (previousStatus === OrderStatus.RETURNED) {
      throw new BadRequestException('Returned orders cannot be cancelled');
    }
    if (previousStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }
  }

  private assertReturnAllowed(
    previousStatus: OrderStatus,
    dto: UpdateOrderStatusDto,
  ): void {
    if (previousStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Only delivered orders can be marked as returned',
      );
    }
    if (!dto.returnDisposition) {
      throw new BadRequestException(
        'returnDisposition is required when status is returned (SELLABLE, DAMAGED, or QUARANTINE)',
      );
    }
    if (!dto.returnReasonCode?.trim()) {
      throw new BadRequestException(
        'returnReasonCode is required when status is returned (e.g. QUALITY_ISSUE)',
      );
    }
  }

  private async resolvePartnerProduct(
    manager: EntityManager,
    order: OrderEntity,
    productId: string,
  ): Promise<PartnerProductEntity | null> {
    return manager
      .createQueryBuilder(PartnerProductEntity, 'partnerProduct')
      .setLock('pessimistic_write')
      .where('partnerProduct.partnerId = :partnerId', {
        partnerId: order.partnerId,
      })
      .andWhere('partnerProduct.productId = :productId', { productId })
      .andWhere(
        '(partnerProduct.tenantId = :tenantId OR partnerProduct.tenantId IS NULL)',
        { tenantId: order.tenantId },
      )
      .orderBy(
        'CASE WHEN partnerProduct.tenantId = :tenantId THEN 0 ELSE 1 END',
        'ASC',
      )
      .setParameter('tenantId', order.tenantId)
      .getOne();
  }

  private async releaseOrderItemsToSellableStock(
    manager: EntityManager,
    order: OrderEntity,
  ): Promise<void> {
    for (const item of order.items) {
      const partnerProduct = await this.resolvePartnerProduct(
        manager,
        order,
        item.productId,
      );
      if (!partnerProduct) continue;

      const beforeQty = partnerProduct.availableStock;
      partnerProduct.availableStock += item.quantity;
      await manager.save(partnerProduct);

      await manager.save(
        manager.create(StockMovementEntity, {
          partnerProductId: partnerProduct.id,
          orderItemId: item.id,
          type: StockMovementType.RELEASE,
          quantity: item.quantity,
          beforeQty,
          afterQty: partnerProduct.availableStock,
        }),
      );
    }
  }

  private async moveOrderItemsToQuarantine(
    manager: EntityManager,
    order: OrderEntity,
  ): Promise<void> {
    for (const item of order.items) {
      const partnerProduct = await this.resolvePartnerProduct(
        manager,
        order,
        item.productId,
      );
      if (!partnerProduct) continue;

      const beforeQty = partnerProduct.quarantineStock ?? 0;
      partnerProduct.quarantineStock = beforeQty + item.quantity;
      await manager.save(partnerProduct);

      await manager.save(
        manager.create(StockMovementEntity, {
          partnerProductId: partnerProduct.id,
          orderItemId: item.id,
          type: StockMovementType.QUARANTINE,
          quantity: item.quantity,
          beforeQty,
          afterQty: partnerProduct.quarantineStock,
        }),
      );
    }
  }
}
