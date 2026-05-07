import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePartnerProductDto {
  @ApiProperty()
  @IsString()
  partnerId!: string;

  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tenantId?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  allocatedStock!: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  partnerPrice!: number;

  @ApiProperty({ example: 'PKR' })
  @IsString()
  currency!: string;
}
