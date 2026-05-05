import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'wallet_a' })
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiProperty({ example: 'Wallet A' })
  @IsString()
  @MinLength(2)
  name!: string;
}
