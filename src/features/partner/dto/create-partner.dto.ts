import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: 'partner_a' })
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiProperty({ example: 'Partner A' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'partner@example.com' })
  @IsEmail()
  contactEmail!: string;
}
