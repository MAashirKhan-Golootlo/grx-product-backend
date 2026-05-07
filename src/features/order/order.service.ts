import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderStatus, StockMovementType } from '../../shared/enums';
import { PartnerProductEntity } from '../partner-product/entities/partner-product.entity';
import { StockMovementEntity } from '../partner-product/entities/stock-movement.entity';

@Injectable()
export class OrderService {
  public constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
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

  public findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  public async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderEntity> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id },
        relations: { items: true },
      });
      if (!order) throw new NotFoundException(`Order ${id} not found`);

      const previousStatus = order.status;
      order.status = status;

      if (
        status === OrderStatus.CANCELLED &&
        previousStatus !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          const partnerProduct = await manager
            .createQueryBuilder(PartnerProductEntity, 'partnerProduct')
            .setLock('pessimistic_write')
            .where('partnerProduct.partnerId = :partnerId', {
              partnerId: order.partnerId,
            })
            .andWhere('partnerProduct.productId = :productId', {
              productId: item.productId,
            })
            .andWhere(
              '(partnerProduct.tenantId = :tenantId OR partnerProduct.tenantId IS NULL)',
              {
                tenantId: order.tenantId,
              },
            )
            .orderBy(
              'CASE WHEN partnerProduct.tenantId = :tenantId THEN 0 ELSE 1 END',
              'ASC',
            )
            .setParameter('tenantId', order.tenantId)
            .getOne();

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

      return manager.save(order);
    });
  }
}
