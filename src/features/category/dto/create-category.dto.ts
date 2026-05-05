import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'electronics' })
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @MinLength(2)
  name!: string;
}
