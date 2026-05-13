import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';
import {
  TenantCreateResult,
  TenantIntegrationCredentialsResult,
  TenantService,
} from './tenant.service';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  public constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiCreatedResponse({
    schema: {
      example: {
        tenant: {
          id: 101,
          code: 'wallet_a',
          name: 'Wallet A',
          integrationEnabled: true,
          status: 'active',
          createdAt: '2026-05-07T00:00:00.000Z',
          updatedAt: '2026-05-07T00:00:00.000Z',
        },
        integrationCredentials: {
          clientId: 101,
          clientSecret: 'one-time-secret',
        },
      },
    },
  })
  public create(@Body() dto: CreateTenantDto): Promise<TenantCreateResult> {
    return this.tenantService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [TenantEntity] })
  public findAll(): Promise<TenantEntity[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TenantEntity })
  public findOne(@Param('id') id: string): Promise<TenantEntity> {
    return this.tenantService.findOne(id);
  }

  @Get(':id/integration-credentials')
  @ApiOkResponse({
    schema: {
      example: {
        clientId: 101,
        clientSecret: 'one-time-secret',
      },
    },
  })
  public getIntegrationCredentials(
    @Param('id') id: string,
  ): Promise<TenantIntegrationCredentialsResult> {
    return this.tenantService.getIntegrationCredentials(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TenantEntity })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantEntity> {
    return this.tenantService.update(id, dto);
  }
}
