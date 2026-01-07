import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { RatingsRepository } from '../ratings/ratings.repository';
import {
  SubmitPaymentDto,
  ConfirmShippingDto,
  CancelOrderDto,
  SendMessageDto,
} from './dto/order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private ratingsRepository: RatingsRepository,
  ) {}

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

  async getOrderByProductId(productId: string, userId: string) {
    const order = await this.ordersRepository.findByProductId(productId);

    if (!order) {
      throw new NotFoundException('Order not found for this product');
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
      status: OrderStatus.PAYMENT_SUBMITTED,
      paidAt: new Date(),
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

    if (order.status !== OrderStatus.PAYMENT_SUBMITTED) {
      throw new ForbiddenException('Payment must be submitted first');
    }

    return this.ordersRepository.update(orderId, {
      shippingProof: dto.shippingProof,
      trackingNumber: dto.trackingNumber,
      status: OrderStatus.SHIPPED,
      shippedAt: new Date(),
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

    // Cannot cancel if already delivered or completed
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        'Cannot cancel order in current status',
      );
    }

    // Auto-create -1 rating for buyer
    await this.ratingsRepository.create({
      rating: -1,
      comment: dto.reason || 'Buyer did not complete payment',
      giverId: sellerId,
      receiverId: order.buyerId,
      orderId: orderId,
    });

    // Update buyer's aggregated rating
    await this.ratingsRepository.updateUserRating(order.buyerId);

    return this.ordersRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: dto.reason || 'Buyer did not complete payment',
    });
  }

  async sendMessage(orderId: string, userId: string, dto: SendMessageDto) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.ordersRepository.addMessage(orderId, userId, dto.content);
  }
}
