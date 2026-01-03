import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import {
  SubmitPaymentDto,
  ConfirmShippingDto,
  CancelOrderDto,
} from './dto/order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private ordersRepository: OrdersRepository) {}

  async getMyOrders(userId: string) {
    return this.ordersRepository.findUserOrders(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only buyer or seller can view
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async submitPayment(orderId: string, buyerId: string, dto: SubmitPaymentDto) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException('Only the buyer can submit payment');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Order is not pending payment');
    }

    return this.ordersRepository.update(orderId, {
      paymentProof: dto.paymentProof,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PAYMENT_CONFIRMED,
    });
  }

  async confirmShipping(
    orderId: string,
    sellerId: string,
    dto: ConfirmShippingDto,
  ) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can confirm shipping');
    }

    if (order.status !== OrderStatus.PAYMENT_CONFIRMED) {
      throw new ForbiddenException('Payment must be confirmed first');
    }

    return this.ordersRepository.update(orderId, {
      trackingNumber: dto.shippingReceipt, // Map DTO field to schema field
      status: OrderStatus.SHIPPED,
    });
  }

  async confirmDelivery(orderId: string, buyerId: string) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException('Only the buyer can confirm delivery');
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new ForbiddenException('Order must be shipped first');
    }

    return this.ordersRepository.update(orderId, {
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date(),
    });
  }

  async cancelOrder(orderId: string, sellerId: string, dto: CancelOrderDto) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can cancel the order');
    }

    // Cancel and auto -1 rating for buyer
    // TODO: Create -1 rating for buyer with reason: "Buyer did not complete payment"

    return this.ordersRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: dto.reason || 'Buyer did not complete payment',
    });
  }
}
