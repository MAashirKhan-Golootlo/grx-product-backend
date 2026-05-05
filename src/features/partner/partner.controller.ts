import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreatePartnerApiKeyDto } from './dto/create-partner-api-key.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerApiKeyEntity } from './entities/partner-api-key.entity';
import { PartnerEntity } from './entities/partner.entity';
import { PartnerService } from './partner.service';

@ApiTags('Partners')
@Controller('partners')
export class PartnerController {
  public constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @ApiCreatedResponse({ type: PartnerEntity })
  public create(@Body() dto: CreatePartnerDto): Promise<PartnerEntity> {
    return this.partnerService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [PartnerEntity] })
  public findAll(): Promise<PartnerEntity[]> {
    return this.partnerService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PartnerEntity })
  public findOne(@Param('id') id: string): Promise<PartnerEntity> {
    return this.partnerService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PartnerEntity })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerDto,
  ): Promise<PartnerEntity> {
    return this.partnerService.update(id, dto);
  }

  @Post(':id/api-keys')
  @ApiOkResponse({
    schema: {
      example: {
        apiKey: 'generated-token',
        keyId: 'uuid',
        keyPrefix: '1234abcd',
      },
    },
  })
  public createApiKey(
    @Param('id') partnerId: string,
    @Body() dto: CreatePartnerApiKeyDto,
  ): Promise<{ apiKey: string; keyId: string; keyPrefix: string }> {
    return this.partnerService.createApiKey(partnerId, dto);
  }

  @Get(':id/api-keys')
  @ApiOkResponse({ type: [PartnerApiKeyEntity] })
  public listApiKeys(
    @Param('id') partnerId: string,
  ): Promise<PartnerApiKeyEntity[]> {
    return this.partnerService.listApiKeys(partnerId);
  }

  @Patch(':id/api-keys/:keyId/revoke')
  @ApiOkResponse({ type: PartnerApiKeyEntity })
  public revokeApiKey(
    @Param('id') partnerId: string,
    @Param('keyId') keyId: string,
  ): Promise<PartnerApiKeyEntity> {
    return this.partnerService.revokeApiKey(partnerId, keyId);
  }
}
