import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { SkipResponseTransform } from '../../common/decorators/skip-response-transform.decorator';
import { PaginatedResult } from '../../common/pagination/pagination.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  public constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiCreatedResponse({ type: OrderEntity })
  public create(@Body() dto: CreateOrderDto): Promise<OrderEntity> {
    return this.orderService.create(dto);
  }

  @Get('export')
  @SkipResponseTransform()
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="orders-export.csv"')
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'CSV file of orders matching filters' })
  public exportCsv(@Query() query: ListOrdersQueryDto): Promise<string> {
    return this.orderService.exportToCsv(query);
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated list of orders' })
  public findAll(
    @Query() query: ListOrdersQueryDto,
  ): Promise<PaginatedResult<OrderEntity>> {
    return this.orderService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderEntity })
  public findOne(@Param('id') id: string): Promise<OrderEntity> {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOkResponse({ type: OrderEntity })
  public updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    return this.orderService.updateStatus(id, dto.status);
  }
}
