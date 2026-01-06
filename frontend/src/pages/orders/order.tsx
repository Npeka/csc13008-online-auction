import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Check,
  Truck,
  CreditCard,
  Package,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ordersApi } from "@/lib";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { Order } from "@/types/order";

const STEPS = [
  { status: "PENDING_PAYMENT", label: "Payment", icon: CreditCard },
  { status: "PAYMENT_CONFIRMED", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipping", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Check },
];

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [paymentData, setPaymentData] = useState({
    paymentProof: "",
    shippingAddress: "",
  });
  const [shippingData, setShippingData] = useState({ trackingNumber: "" });
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [order?.messages]);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (error) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isBuyer = user?.id === order?.buyerId;
  const isSeller = user?.id === order?.sellerId;

  const currentStepIndex =
    STEPS.findIndex((s) => s.status === order?.status) === -1
      ? order?.status === "COMPLETED"
        ? 4
        : 0
      : STEPS.findIndex((s) => s.status === order?.status);

  // Actions
  const onSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await ordersApi.submitPayment(id, {
        paymentProof: paymentData.paymentProof,
        shippingAddress: paymentData.shippingAddress,
      });
      toast.success("Payment submitted!");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to submit payment");
    }
  };

  const onSubmitShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await ordersApi.confirmShipping(id, {
        shippingReceipt: shippingData.trackingNumber,
      });
      toast.success("Shipping confirmed!");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to confirm shipping");
    }
  };

  const onConfirmDelivery = async () => {
    if (!id) return;
    try {
      await ordersApi.confirmDelivery(id);
      toast.success("Delivery confirmed!");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to confirm delivery");
    } finally {
      setShowDeliveryConfirm(false);
    }
  };

  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim()) return;
    try {
      await ordersApi.sendMessage(id, message);
      setMessage("");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading order...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">
          Order #{order.id.slice(-6).toUpperCase()}
        </h1>
        <p className="text-text-muted">
          Product:{" "}
          <Link
            to={`/products/${order.product.slug}`}
            className="text-primary hover:underline"
          >
            {order.product.title}
          </Link>
        </p>
      </div>

      {/* Stepper */}
      <div className="relative mb-12 flex justify-between">
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 bg-border" />
        {STEPS.map((step, index) => {
          const isCompleted =
            index < currentStepIndex || order.status === "COMPLETED";
          const isCurrent =
            index === currentStepIndex ||
            (order.status === "COMPLETED" && index === 3);
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center bg-bg p-2"
            >
              <div
                className={cn(
                  "mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-secondary text-text-muted",
                )}
              >
                <Icon size={20} />
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-primary" : "text-text-muted",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action Card */}
          <div className="rounded-xl border border-border bg-bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <AlertCircle size={20} className="text-primary" />
              Action Required
            </h2>

            {order.status === "PENDING_PAYMENT" && isBuyer && (
              <form onSubmit={onSubmitPayment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Shipping Address
                  </label>
                  <Textarea
                    value={paymentData.shippingAddress}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        shippingAddress: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter your full address..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Payment Note / Proof
                  </label>
                  <Input
                    value={paymentData.paymentProof}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentProof: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g. Bank Transfer Ref #123456"
                  />
                </div>
                <Button type="submit">Submit Payment</Button>
              </form>
            )}

            {order.status === "PENDING_PAYMENT" && isSeller && (
              <div className="text-text-muted">
                Waiting for buyer to submit payment info.
              </div>
            )}

            {order.status === "PAYMENT_CONFIRMED" && isSeller && (
              <form onSubmit={onSubmitShipping} className="space-y-4">
                <div className="mb-4 rounded-lg bg-secondary/50 p-4">
                  <p className="mb-1 text-sm font-medium">
                    Buyer's Shipping Info:
                  </p>
                  <p className="text-sm">{order.shippingAddress}</p>
                  <p className="mt-2 text-sm font-medium">Payment Note:</p>
                  <p className="text-sm">{order.paymentProof}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tracking Number / Receipt
                  </label>
                  <Input
                    value={shippingData.trackingNumber}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        trackingNumber: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter tracking number"
                  />
                </div>
                <Button type="submit">Confirm Shipping</Button>
              </form>
            )}

            {order.status === "PAYMENT_CONFIRMED" && isBuyer && (
              <div className="text-text-muted">
                Payment submitted. Waiting for seller to ship.
              </div>
            )}

            {order.status === "SHIPPED" && isBuyer && (
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="mb-1 text-sm font-medium">Tracking Number:</p>
                  <p className="font-mono text-lg">{order.trackingNumber}</p>
                </div>
                <Button
                  onClick={() => setShowDeliveryConfirm(true)}
                  className="w-full"
                >
                  Confirm Delivery
                </Button>
              </div>
            )}

            {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
              <div className="flex items-center gap-2 font-medium text-success">
                <Check size={20} />
                Order Completed successfully!
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="rounded-xl border border-border bg-bg-card p-6">
            <h3 className="mb-4 font-bold">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-text-muted">Final Price</span>
                <span className="font-bold">
                  {formatCurrency(order.finalPrice)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-text-muted">Order Date</span>
                <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
              </div>
              {order.shippingAddress && (
                <div className="border-b border-border py-2">
                  <span className="mb-1 block text-text-muted">
                    Shipping Address
                  </span>
                  <span>{order.shippingAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:col-span-1">
          <div className="flex h-[600px] flex-col rounded-xl border border-border bg-bg-card p-4">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <MessageSquare size={18} />
              Messages
            </h3>

            <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2">
              {order.messages?.length === 0 && (
                <div className="py-10 text-center text-sm text-text-muted">
                  No messages yet
                </div>
              )}
              {order.messages?.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex max-w-[90%] gap-2",
                      isMe ? "ml-auto flex-row-reverse" : "",
                    )}
                  >
                    <Avatar
                      src={msg.sender.avatar || undefined}
                      fallback={msg.sender.name}
                      size="xs"
                      className="mt-1"
                    />

                    <div
                      className={cn(
                        "rounded-lg p-3 text-sm",
                        isMe
                          ? "rounded-tr-none bg-primary text-white"
                          : "rounded-tl-none bg-secondary",
                      )}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={cn(
                          "mt-1 block text-[10px] opacity-70",
                          isMe ? "text-primary-foreground" : "text-text-muted",
                        )}
                      >
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={onSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!message.trim()}>
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Delivery Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeliveryConfirm}
        onClose={() => setShowDeliveryConfirm(false)}
        onConfirm={onConfirmDelivery}
        title="Confirm Delivery"
        message="Confirm that you have received the item? This action cannot be undone."
        confirmText="Yes, I Received It"
        variant="info"
      />
    </div>
  );
}
