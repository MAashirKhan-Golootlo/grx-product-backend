import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CreatePartnerApiKeyDto } from './dto/create-partner-api-key.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerApiKeyEntity } from './entities/partner-api-key.entity';
import { PartnerEntity } from './entities/partner.entity';

@Injectable()
export class PartnerService {
  public constructor(
    @InjectRepository(PartnerEntity)
    private readonly partnerRepository: Repository<PartnerEntity>,
    @InjectRepository(PartnerApiKeyEntity)
    private readonly partnerApiKeyRepository: Repository<PartnerApiKeyEntity>,
  ) {}

  public async create(dto: CreatePartnerDto): Promise<PartnerEntity> {
    const exists = await this.partnerRepository.findOneBy({ code: dto.code });
    if (exists) throw new ConflictException('Partner code already exists');
    return this.partnerRepository.save(this.partnerRepository.create(dto));
  }

  public findAll(): Promise<PartnerEntity[]> {
    return this.partnerRepository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<PartnerEntity> {
    const partner = await this.partnerRepository.findOneBy({ id });
    if (!partner) throw new NotFoundException(`Partner ${id} not found`);
    return partner;
  }

  public async update(
    id: string,
    dto: UpdatePartnerDto,
  ): Promise<PartnerEntity> {
    const partner = await this.findOne(id);
    return this.partnerRepository.save(
      this.partnerRepository.merge(partner, dto),
    );
  }

  public async createApiKey(
    partnerId: string,
    dto: CreatePartnerApiKeyDto,
  ): Promise<{ apiKey: string; keyId: string; keyPrefix: string }> {
    await this.findOne(partnerId);
    const rawToken = randomBytes(32).toString('hex');
    const keyPrefix = rawToken.slice(0, 8);
    const keyHash = createHash('sha256').update(rawToken).digest('hex');

    const key = await this.partnerApiKeyRepository.save(
      this.partnerApiKeyRepository.create({
        partnerId,
        keyPrefix,
        keyHash,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      }),
    );

    return { apiKey: rawToken, keyId: key.id, keyPrefix };
  }

  public listApiKeys(partnerId: string): Promise<PartnerApiKeyEntity[]> {
    return this.partnerApiKeyRepository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' },
    });
  }

  public async revokeApiKey(
    partnerId: string,
    keyId: string,
  ): Promise<PartnerApiKeyEntity> {
    const key = await this.partnerApiKeyRepository.findOneBy({
      id: keyId,
      partnerId,
    });
    if (!key) throw new NotFoundException(`Partner key ${keyId} not found`);
    key.isActive = false;
    return this.partnerApiKeyRepository.save(key);
  }
}
