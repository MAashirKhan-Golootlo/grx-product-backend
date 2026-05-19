import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

function transformOptionalTenantId(params: {
  value: unknown;
}): number | undefined {
  const { value } = params;
  if (value === undefined || value === '' || value === 'all') {
    return undefined;
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function transformOptionalPartnerId(params: {
  value: unknown;
}): string | undefined {
  const { value } = params;
  if (value === undefined || value === '' || value === 'all') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

function transformOptionalOrderNo(params: {
  value: unknown;
}): string | undefined {
  const { value } = params;
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export class ListOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tenant id' })
  @IsOptional()
  @Transform(transformOptionalTenantId)
  @IsInt()
  tenantId?: number;

  @ApiPropertyOptional({ description: 'Filter by partner id (UUID)' })
  @IsOptional()
  @Transform(transformOptionalPartnerId)
  @IsUUID()
  partnerId?: string;

  @ApiPropertyOptional({
    description: 'Search by order number (partial match)',
  })
  @IsOptional()
  @Transform(transformOptionalOrderNo)
  @IsString()
  @MaxLength(100)
  orderNo?: string;
}
