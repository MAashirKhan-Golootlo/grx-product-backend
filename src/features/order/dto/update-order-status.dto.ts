import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { OrderStatus, ReturnDisposition } from '../../../shared/enums';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  /**
   * Required when status is `returned`.
   * DAMAGED / QUARANTINE do not restore sellable stock (STORE-001).
   */
  @ApiPropertyOptional({
    enum: ReturnDisposition,
    example: ReturnDisposition.DAMAGED,
  })
  @ValidateIf((o: UpdateOrderStatusDto) => o.status === OrderStatus.RETURNED)
  @IsEnum(ReturnDisposition)
  returnDisposition?: ReturnDisposition;

  /** Business reason for the return (forwarded to loyalty for audit). */
  @ApiPropertyOptional({
    example: 'QUALITY_ISSUE',
    description: 'e.g. QUALITY_ISSUE | WRONG_ITEM_DELIVERED | OTHER',
  })
  @ValidateIf((o: UpdateOrderStatusDto) => o.status === OrderStatus.RETURNED)
  @IsString()
  @MinLength(1)
  returnReasonCode?: string;

  @ApiPropertyOptional({ example: 'Unit arrived cracked' })
  @IsOptional()
  @IsString()
  returnReasonText?: string;
}
