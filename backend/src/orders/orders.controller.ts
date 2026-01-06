import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  SubmitPaymentDto,
  ConfirmShippingDto,
  CancelOrderDto,
  SendMessageDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('my-orders')
  getMyOrders(@GetUser('id') userId: string) {
    return this.ordersService.getMyOrders(userId);
  }

  @Get(':id')
  getOrderById(@Param('id') orderId: string, @GetUser('id') userId: string) {
    return this.ordersService.getOrderById(orderId, userId);
  }

  @Patch(':id/payment')
  submitPayment(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
    @Body() dto: SubmitPaymentDto,
  ) {
    return this.ordersService.submitPayment(orderId, userId, dto);
  }

  @Patch(':id/shipping')
  confirmShipping(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
    @Body() dto: ConfirmShippingDto,
  ) {
    return this.ordersService.confirmShipping(orderId, userId, dto);
  }

  @Patch(':id/delivery')
  confirmDelivery(@Param('id') orderId: string, @GetUser('id') userId: string) {
    return this.ordersService.confirmDelivery(orderId, userId);
  }

  @Post(':id/cancel')
  cancelOrder(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(orderId, userId, dto);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.ordersService.sendMessage(orderId, userId, dto);
  }
}
