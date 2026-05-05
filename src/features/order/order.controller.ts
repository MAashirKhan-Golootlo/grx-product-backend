import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
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

  @Get()
  @ApiOkResponse({ type: [OrderEntity] })
  public findAll(): Promise<OrderEntity[]> {
    return this.orderService.findAll();
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
