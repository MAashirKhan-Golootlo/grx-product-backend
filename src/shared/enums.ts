export enum RecordStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum StockMovementType {
  CONSUME = 'consume',
  RELEASE = 'release',
  ADJUST = 'adjust',
}
