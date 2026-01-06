import apiClient from "./api-client";
import type { Order } from "@/types/order";

export const ordersApi = {
  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    return await apiClient.get(`/orders/${orderId}`);
  },

  // Get my orders
  getMyOrders: async (): Promise<Order[]> => {
    return await apiClient.get("/orders/my-orders");
  },

  // Submit payment (Buyer)
  submitPayment: async (
    orderId: string,
    data: { paymentProof?: string; shippingAddress: string },
  ): Promise<Order> => {
    return await apiClient.patch(`/orders/${orderId}/payment`, data);
  },

  // Confirm shipping (Seller)
  confirmShipping: async (
    orderId: string,
    data: { shippingReceipt: string },
  ): Promise<Order> => {
    return await apiClient.patch(`/orders/${orderId}/shipping`, data);
  },

  // Confirm delivery (Buyer)
  confirmDelivery: async (orderId: string): Promise<Order> => {
    return await apiClient.patch(`/orders/${orderId}/delivery`);
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    return await apiClient.post(`/orders/${orderId}/cancel`, { reason });
  },

  // Send message
  sendMessage: async (orderId: string, content: string): Promise<any> => {
    return await apiClient.post(`/orders/${orderId}/messages`, { content });
  },
};
