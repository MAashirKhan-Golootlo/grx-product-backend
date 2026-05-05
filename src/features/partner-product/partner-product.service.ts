import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { StockMovementType } from '../../shared/enums';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreatePartnerProductDto } from './dto/create-partner-product.dto';
import { UpdatePartnerProductDto } from './dto/update-partner-product.dto';
import { PartnerProductEntity } from './entities/partner-product.entity';
import { StockMovementEntity } from './entities/stock-movement.entity';

@Injectable()
export class PartnerProductService {
  public constructor(
    @InjectRepository(PartnerProductEntity)
    private readonly partnerProductRepository: Repository<PartnerProductEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepository: Repository<StockMovementEntity>,
  ) {}

  public async create(
    dto: CreatePartnerProductDto,
  ): Promise<PartnerProductEntity> {
    const partnerProduct = this.partnerProductRepository.create({
      ...dto,
      availableStock: dto.allocatedStock,
    });

    try {
      return await this.partnerProductRepository.save(partnerProduct);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Partner product mapping already exists');
      }
      throw error;
    }
  }

  public findAll(): Promise<PartnerProductEntity[]> {
    return this.partnerProductRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<PartnerProductEntity> {
    const partnerProduct = await this.partnerProductRepository.findOneBy({
      id,
    });
    if (!partnerProduct) {
      throw new NotFoundException(`Partner product ${id} not found`);
    }
    return partnerProduct;
  }

  public async update(
    id: string,
    dto: UpdatePartnerProductDto,
  ): Promise<PartnerProductEntity> {
    const partnerProduct = await this.findOne(id);
    return this.partnerProductRepository.save(
      this.partnerProductRepository.merge(partnerProduct, dto),
    );
  }

  public async adjustStock(
    id: string,
    dto: AdjustStockDto,
  ): Promise<PartnerProductEntity> {
    const partnerProduct = await this.findOne(id);
    const beforeQty = partnerProduct.availableStock;
    const afterQty = beforeQty + dto.delta;

    if (afterQty < 0) {
      throw new ConflictException('Stock cannot go below zero');
    }

    partnerProduct.availableStock = afterQty;
    partnerProduct.allocatedStock += dto.delta;
    const saved = await this.partnerProductRepository.save(partnerProduct);

    await this.stockMovementRepository.save(
      this.stockMovementRepository.create({
        partnerProductId: partnerProduct.id,
        type: StockMovementType.ADJUST,
        quantity: dto.delta,
        beforeQty,
        afterQty,
      }),
    );

    return saved;
  }
}
