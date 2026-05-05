import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  public constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiCreatedResponse({ type: ProductEntity })
  public create(@Body() dto: CreateProductDto): Promise<ProductEntity> {
    return this.productService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [ProductEntity] })
  public findAll(): Promise<ProductEntity[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductEntity })
  public findOne(@Param('id') id: string): Promise<ProductEntity> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProductEntity })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.update(id, dto);
  }
}
