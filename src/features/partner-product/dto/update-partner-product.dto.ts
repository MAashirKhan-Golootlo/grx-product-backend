import { PartialType } from '@nestjs/swagger';
import { CreatePartnerProductDto } from './create-partner-product.dto';

export class UpdatePartnerProductDto extends PartialType(
  CreatePartnerProductDto,
) {}
