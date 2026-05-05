import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
  public constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  public async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const exists = await this.categoryRepository.findOneBy({ slug: dto.slug });
    if (exists) throw new ConflictException('Category slug already exists');
    return this.categoryRepository.save(this.categoryRepository.create(dto));
  }

  public findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  public async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    return this.categoryRepository.save(
      this.categoryRepository.merge(category, dto),
    );
  }
}
