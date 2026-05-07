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

class CreateIntegrationOrderItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}

export class CreateIntegrationOrderDto {
  @ApiProperty()
  @IsString()
  partnerId!: string;

  @ApiProperty({ example: 'ext-cust-5501' })
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

  @ApiProperty({ type: [CreateIntegrationOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateIntegrationOrderItemDto)
  items!: CreateIntegrationOrderItemDto[];
}
