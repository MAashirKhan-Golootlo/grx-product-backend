import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  public constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiCreatedResponse({ type: CategoryEntity })
  public create(@Body() dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [CategoryEntity] })
  public findAll(): Promise<CategoryEntity[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryEntity })
  public findOne(@Param('id') id: string): Promise<CategoryEntity> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoryEntity })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryService.update(id, dto);
  }
}
