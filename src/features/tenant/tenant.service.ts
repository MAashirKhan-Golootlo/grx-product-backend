import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  public constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  public async create(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    const exists = await this.tenantRepository.findOneBy({
      code: createTenantDto.code,
    });
    if (exists) throw new ConflictException('Tenant code already exists');
    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  public findAll(): Promise<TenantEntity[]> {
    return this.tenantRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  public async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantEntity> {
    const tenant = await this.findOne(id);
    return this.tenantRepository.save(
      this.tenantRepository.merge(tenant, updateTenantDto),
    );
  }
}
