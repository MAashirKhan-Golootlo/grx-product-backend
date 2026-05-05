import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class CreatePartnerApiKeyDto {
  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Optional expiry for the key',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
