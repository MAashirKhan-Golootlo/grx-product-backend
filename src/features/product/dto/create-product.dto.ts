import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-1001' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'AirPods Pro' })
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiProperty({ example: 'PKR' })
  @IsString()
  currency!: string;

  @ApiProperty()
  @IsString()
  categoryId!: string;
}
