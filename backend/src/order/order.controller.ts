import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Get()
  getOrders(
    @Request() req: { user: { userId: string } },
    @Query('tableId') tableId?: string,
  ) {
    return this.orderService.getOrders(req.user.userId, tableId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.orderService.updateOrderStatus(id, body.status);
  }

  @Patch(':id/hall-receive')
  updateHallReceived(@Param('id') id: string, @Body() body: { hallReceived: boolean }) {
    return this.orderService.updateHallReceived(id, body.hallReceived);
  }
}
