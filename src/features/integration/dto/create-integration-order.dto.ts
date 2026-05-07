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
import { Type } from 'class-transformer';

export class CreateIntegrationOrderItemDto {
  @ApiProperty({ example: '64616cb5-aa2d-44ee-b0e9-31f9672f2e30' })
  @IsString()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 1800,
    required: false,
    description: 'Optional; defaults to partner price for this product/tenant',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}

export class CreateIntegrationOrderDto {
  @ApiProperty({
    example: '7f5b5f2a-12c3-44b9-bec0-0e85f9df2cce',
    description: 'Partner UUID',
  })
  @IsString()
  partnerId!: string;

  @ApiProperty({
    example: 'wallet-user-5501',
    description: 'External / tenant customer identifier',
  })
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 'Ali Khan' })
  @IsString()
  customerName!: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  customerPhone!: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({
    type: CreateIntegrationOrderItemDto,
    isArray: true,
    description: 'At least one line item',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateIntegrationOrderItemDto)
  items!: CreateIntegrationOrderItemDto[];
}
