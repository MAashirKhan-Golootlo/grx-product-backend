import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';
import { TenantService } from './tenant.service';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  public constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiCreatedResponse({ type: TenantEntity })
  public create(@Body() dto: CreateTenantDto): Promise<TenantEntity> {
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

  @Patch(':id')
  @ApiOkResponse({ type: TenantEntity })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantEntity> {
    return this.tenantService.update(id, dto);
  }
}
