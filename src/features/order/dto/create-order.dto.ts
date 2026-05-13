import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** Used by @Transform — explicit return type satisfies @typescript-eslint/no-unsafe-return */
function transformEmptyStringToUndefined(params: {
  value: unknown;
}): string | undefined {
  const { value } = params;
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  tenantId!: number;

  @ApiProperty()
  @IsString()
  partnerId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(transformEmptyStringToUndefined)
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(transformEmptyStringToUndefined)
  @IsString()
  customerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(transformEmptyStringToUndefined)
  @IsString()
  customerPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(transformEmptyStringToUndefined)
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
