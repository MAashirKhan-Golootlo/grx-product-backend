import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';

export interface TenantCreateResult {
  tenant: TenantEntity;
  integrationCredentials: {
    clientId: string;
    clientSecret: string;
  };
}

export interface TenantIntegrationCredentialsResult {
  clientId: string;
  clientSecret: string;
}

@Injectable()
export class TenantService {
  public constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    private readonly configService: ConfigService,
  ) {}

  public async create(
    createTenantDto: CreateTenantDto,
  ): Promise<TenantCreateResult> {
    const exists = await this.tenantRepository.findOneBy({
      code: createTenantDto.code,
    });
    if (exists) throw new ConflictException('Tenant code already exists');

    const tenant = await this.tenantRepository.save(
      this.tenantRepository.create(createTenantDto),
    );

    const clientSecret = this.generateClientSecret();
    tenant.clientSecretHash = this.hashClientSecret(clientSecret);
    tenant.clientSecretEncrypted = this.encryptClientSecret(clientSecret);
    const savedTenant = await this.tenantRepository.save(tenant);

    return {
      tenant: savedTenant,
      integrationCredentials: {
        clientId: savedTenant.id,
        clientSecret,
      },
    };
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

  public async findByIntegrationCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<TenantEntity | null> {
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .addSelect('tenant.clientSecretHash')
      .where('tenant.id = :clientId', { clientId })
      .getOne();

    if (!tenant || !tenant.integrationEnabled || !tenant.clientSecretHash) {
      return null;
    }

    const incomingHash = this.hashClientSecret(clientSecret);
    const isValid = this.safeHashCompare(tenant.clientSecretHash, incomingHash);
    if (!isValid) {
      return null;
    }

    tenant.clientSecretHash = undefined;
    tenant.clientSecretEncrypted = undefined;
    return tenant;
  }

  public async getIntegrationCredentials(
    id: string,
  ): Promise<TenantIntegrationCredentialsResult> {
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .addSelect('tenant.clientSecretEncrypted')
      .where('tenant.id = :id', { id })
      .getOne();

    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    if (!tenant.clientSecretEncrypted) {
      throw new NotFoundException('Integration credentials not found');
    }

    return {
      clientId: tenant.id,
      clientSecret: this.decryptClientSecret(tenant.clientSecretEncrypted),
    };
  }

  private generateClientSecret(): string {
    return randomBytes(48).toString('base64url');
  }

  private hashClientSecret(secret: string): string {
    return createHash('sha512').update(secret).digest('hex');
  }

  private encryptClientSecret(secret: string): string {
    const key = this.getEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(secret, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  private decryptClientSecret(encryptedValue: string): string {
    const payload = Buffer.from(encryptedValue, 'base64');
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      iv,
    );
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  private getEncryptionKey(): Buffer {
    return createHash('sha256')
      .update(
        this.configService.get<string>('auth.jwtSecret', 'change-this-secret'),
      )
      .digest();
  }

  private safeHashCompare(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a, 'hex');
    const bBuffer = Buffer.from(b, 'hex');
    if (aBuffer.length !== bBuffer.length) return false;
    return timingSafeEqual(aBuffer, bBuffer);
  }
}
