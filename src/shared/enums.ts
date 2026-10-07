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
  /** Post-delivery return (quality / wrong item). Prefer over cancelling delivered orders. */
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum StockMovementType {
  CONSUME = 'consume',
  RELEASE = 'release',
  ADJUST = 'adjust',
  /** Damaged / inspect stock — not sellable (STORE-001). */
  QUARANTINE = 'quarantine',
}

/** How returned inventory should be disposed. */
export enum ReturnDisposition {
  SELLABLE = 'SELLABLE',
  DAMAGED = 'DAMAGED',
  QUARANTINE = 'QUARANTINE',
}
