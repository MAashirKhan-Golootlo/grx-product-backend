import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductService {
  public constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  public async create(dto: CreateProductDto): Promise<ProductEntity> {
    const exists = await this.productRepository.findOneBy({ sku: dto.sku });
    if (exists) throw new ConflictException('Product SKU already exists');
    return this.productRepository.save(this.productRepository.create(dto));
  }

  public findAll(): Promise<ProductEntity[]> {
    return this.productRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  public async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);
    return this.productRepository.save(
      this.productRepository.merge(product, dto),
    );
  }
}
