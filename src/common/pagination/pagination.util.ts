import type {
  PaginatedResult,
  PaginationMeta,
  PaginationQueryDto,
} from './pagination.dto';

export function normalizePagination(q?: PaginationQueryDto): {
  page: number;
  limit: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, q?.page ?? 1);
  const limit = Math.min(100, Math.max(1, q?.limit ?? 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResult<T> {
  const meta = buildPaginationMeta(page, limit, total);
  return {
    data,
    ...meta,
  };
}
