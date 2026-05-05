import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreatePartnerProductDto } from './dto/create-partner-product.dto';
import { UpdatePartnerProductDto } from './dto/update-partner-product.dto';
import { PartnerProductEntity } from './entities/partner-product.entity';
import { PartnerProductService } from './partner-product.service';

@ApiTags('Partner Products')
@Controller('partner-products')
export class PartnerProductController {
  public constructor(
    private readonly partnerProductService: PartnerProductService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: PartnerProductEntity })
  public create(
    @Body() dto: CreatePartnerProductDto,
  ): Promise<PartnerProductEntity> {
    return this.partnerProductService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [PartnerProductEntity] })
  public findAll(): Promise<PartnerProductEntity[]> {
    return this.partnerProductService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PartnerProductEntity })
  public findOne(@Param('id') id: string): Promise<PartnerProductEntity> {
    return this.partnerProductService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PartnerProductEntity })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerProductDto,
  ): Promise<PartnerProductEntity> {
    return this.partnerProductService.update(id, dto);
  }

  @Post(':id/adjust-stock')
  @ApiOkResponse({ type: PartnerProductEntity })
  public adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
  ): Promise<PartnerProductEntity> {
    return this.partnerProductService.adjustStock(id, dto);
  }
}
