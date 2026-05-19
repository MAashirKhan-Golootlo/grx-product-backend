import type { SelectQueryBuilder } from 'typeorm';
import type { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import type { OrderEntity } from './entities/order.entity';

export function applyOrderListFilters(
  qb: SelectQueryBuilder<OrderEntity>,
  query: ListOrdersQueryDto,
): SelectQueryBuilder<OrderEntity> {
  if (query.tenantId != null) {
    qb.andWhere('order.tenantId = :tenantId', { tenantId: query.tenantId });
  }
  if (query.partnerId) {
    qb.andWhere('order.partnerId = :partnerId', { partnerId: query.partnerId });
  }
  if (query.orderNo) {
    qb.andWhere('order.orderNo ILIKE :orderNo', {
      orderNo: `%${query.orderNo}%`,
    });
  }
  return qb;
}

export function createOrderListQueryBuilder(repo: {
  createQueryBuilder: (alias: string) => SelectQueryBuilder<OrderEntity>;
}): SelectQueryBuilder<OrderEntity> {
  return repo
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.tenant', 'tenant')
    .leftJoinAndSelect('order.partner', 'partner')
    .leftJoinAndSelect('order.items', 'items')
    .leftJoinAndSelect('items.product', 'product')
    .orderBy('order.createdAt', 'DESC');
}
