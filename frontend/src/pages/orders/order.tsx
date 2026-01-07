import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router";
import toast from "react-hot-toast";
import {
  Check,
  Truck,
  CreditCard,
  Package,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingModal } from "@/components/shared/rating-modal";
import { ordersApi, ratingsApi } from "@/lib";
import { uploadOrderImage } from "@/lib/upload";
import { useAuthStore } from "@/stores/auth-store";
import { formatUSD, cn } from "@/lib/utils";
import type { Order } from "@/types/order";

const STEPS = [
  {
    status: "PENDING_PAYMENT",
    label: "Payment Proof",
    icon: CreditCard,
    buyerAction: "Upload payment proof + address",
    sellerAction: "Waiting for buyer",
  },
  {
    status: "PAYMENT_SUBMITTED",
    label: "Shipping",
    icon: Package,
    buyerAction: "Waiting for seller",
    sellerAction: "Upload shipping receipt",
  },
  {
    status: "SHIPPED",
    label: "Delivery",
    icon: Truck,
    buyerAction: "Confirm delivery received",
    sellerAction: "Waiting for buyer confirmation",
  },
  {
    status: "DELIVERED",
    label: "Rating",
    icon: Check,
    buyerAction: "Rate the seller",
    sellerAction: "Rate the buyer",
  },
];

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Step 1: Payment form
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");

  // Step 2: Shipping form
  const [shippingFile, setShippingFile] = useState<File | null>(null);
  const [shippingUploading, setShippingUploading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  // Step 3: Delivery confirmation
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);

  // Step 4: Rating
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

  // Cancel order
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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

      // Check if user has already rated
      if (data.status === "DELIVERED" || data.status === "COMPLETED") {
        const targetUserId = isBuyer ? data.sellerId : data.buyerId;
        const myRating = data.ratings?.find(
          (r: any) => r.giverId === user?.id && r.receiverId === targetUserId,
        );
        if (myRating) {
          setExistingRating(myRating);
        }
      }
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

  const currentStepIndex = STEPS.findIndex((s) => s.status === order?.status);
  const isOrderActive =
    order?.status !== "COMPLETED" &&
    order?.status !== "CANCELLED";

  // Step 1: Submit Payment
  const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !paymentFile || !shippingAddress.trim()) {
      toast.error("Please upload payment proof and enter shipping address");
      return;
    }

    try {
      setPaymentUploading(true);
      const paymentProofUrl = await uploadOrderImage(paymentFile, "payment");

      await ordersApi.submitPayment(id, {
        paymentProof: paymentProofUrl,
        shippingAddress: shippingAddress.trim(),
      });

      toast.success("Payment proof submitted!");
      setPaymentFile(null);
      setShippingAddress("");
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment");
    } finally {
      setPaymentUploading(false);
    }
  };

  // Step 2: Confirm Shipping
  const handleShippingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setShippingFile(e.target.files[0]);
    }
  };

  const handleConfirmShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !shippingFile) {
      toast.error("Please upload shipping receipt");
      return;
    }

    try {
      setShippingUploading(true);
      const shippingProofUrl = await uploadOrderImage(shippingFile, "shipping");

      await ordersApi.confirmShipping(id, {
        shippingProof: shippingProofUrl,
        trackingNumber: trackingNumber.trim() || undefined,
      });

      toast.success("Shipping confirmed!");
      setShippingFile(null);
      setTrackingNumber("");
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm shipping");
    } finally {
      setShippingUploading(false);
    }
  };

  // Step 3: Confirm Delivery
  const handleConfirmDelivery = async () => {
    if (!id) return;
    try {
      await ordersApi.confirmDelivery(id);
      toast.success("Delivery confirmed!");
      setShowDeliveryConfirm(false);
      fetchOrder();
    } catch (error) {
      toast.error("Failed to confirm delivery");
    }
  };

  // Step 4: Submit/Update Rating
  const handleRatingSubmit = async (ratingData: {
    score: 1 | -1;
    comment: string;
  }) => {
    if (!order) return;

    const targetUserId = isBuyer ? order.sellerId : order.buyerId;

    try {
      if (existingRating) {
        // Update existing rating
        await ratingsApi.updateRating(existingRating.id, {
          rating: ratingData.score,
          comment: ratingData.comment,
        });
        toast.success("Rating updated successfully!");
      } else {
        // Create new rating
        await ratingsApi.createRating({
          rating: ratingData.score,
          comment: ratingData.comment,
          receiverId: targetUserId,
          orderId: order.id,
        });
        toast.success("Rating submitted successfully!");
      }

      setShowRatingModal(false);
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit rating");
      throw error;
    }
  };

  // Cancel Order
  const handleCancelOrder = async () => {
    if (!id) return;
    try {
      setCancelling(true);
      await ordersApi.cancelOrder(id, cancelReason.trim() || undefined);
      toast.success("Order cancelled");
      setShowCancelConfirm(false);
      setCancelReason("");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim()) return;

    try {
      await ordersApi.sendMessage(id, message.trim());
      setMessage("");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="container-app flex min-h-screen items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text">Order Not Found</h1>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const targetUser = isBuyer ? order.seller : order.buyer;

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/profile">
            <Button variant="ghost" className="mb-4">
              ← Back
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-text">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-text-muted">{order.product.title}</p>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatUSD(order.finalPrice)}
              </p>
            </div>
            <Badge
              variant={
                order.status === "COMPLETED"
                  ? "success"
                  : order.status === "CANCELLED"
                    ? "error"
                    : "warning"
              }
            >
              {order.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        {order.status !== "CANCELLED" && (
          <div className="mb-8 rounded-xl border border-border bg-bg-card p-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          isActive && "bg-primary text-white",
                          isCompleted && "bg-success text-white",
                          !isActive && !isCompleted && "bg-bg-tertiary text-text-muted",
                        )}
                      >
                        {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                      </div>
                      <p className="mt-2 text-center text-sm font-medium text-text">
                        {step.label}
                      </p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "mx-2 h-0.5 flex-1",
                          index < currentStepIndex ? "bg-success" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Content - Show only current step */}
        <div className="space-y-6">
          {/* Cancelled Status */}
          {order.status === "CANCELLED" && (
            <div className="rounded-xl border border-error bg-error/10 p-8 text-center">
              <h2 className="mb-2 text-xl font-semibold text-error">Order Cancelled</h2>
              <p className="text-text-muted">
                {order.cancellationReason || "This order has been cancelled by the seller"}
              </p>
            </div>
          )}

          {/* Step 1: Payment Proof */}
          {order.status === "PENDING_PAYMENT" && (
            <div className="rounded-xl border border-border bg-bg-card p-8">
              <div className="mb-6 text-center">
                <CreditCard className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h2 className="mb-2 text-xl font-semibold text-text">
                  {isBuyer ? "Submit Payment Proof" : "Waiting for Buyer"}
                </h2>
                <p className="text-text-muted">
                  {isBuyer
                    ? "Upload your payment proof and provide shipping address"
                    : "The buyer needs to submit payment proof"}
                </p>
              </div>

              {isBuyer ? (
                <form onSubmit={handleSubmitPayment} className="mx-auto max-w-md space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Payment Proof *
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-bg-secondary p-4 transition-colors hover:border-primary hover:bg-bg-tertiary">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          {paymentFile ? paymentFile.name : "Choose image file"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePaymentFileChange}
                          className="hidden"
                        />
                      </label>
                      {paymentFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPaymentFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Shipping Address *
                    </label>
                    <Textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your full shipping address..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!paymentFile || !shippingAddress.trim()}
                    isLoading={paymentUploading}
                    className="w-full"
                    size="lg"
                  >
                    Submit Payment Proof
                  </Button>
                </form>
              ) : (
                <div className="mx-auto max-w-md text-center">
                  <div className="rounded-lg bg-bg-secondary p-6">
                    <p className="text-text-muted">
                      Waiting for {order.buyer.name} to submit payment proof...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Shipping Confirmation */}
          {order.status === "PAYMENT_SUBMITTED" && (
            <div className="rounded-xl border border-border bg-bg-card p-8">
              <div className="mb-6 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h2 className="mb-2 text-xl font-semibold text-text">
                  {isSeller ? "Confirm Shipping" : "Payment Submitted"}
                </h2>
                <p className="text-text-muted">
                  {isSeller
                    ? "Upload shipping receipt to confirm you've shipped the item"
                    : "Your payment proof has been submitted. Waiting for seller to ship."}
                </p>
              </div>

              {isSeller ? (
                <form onSubmit={handleConfirmShipping} className="mx-auto max-w-md space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Shipping Receipt *
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-bg-secondary p-4 transition-colors hover:border-primary hover:bg-bg-tertiary">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          {shippingFile ? shippingFile.name : "Choose image file"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleShippingFileChange}
                          className="hidden"
                        />
                      </label>
                      {shippingFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShippingFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Tracking Number (Optional)
                    </label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!shippingFile}
                    isLoading={shippingUploading}
                    className="w-full"
                    size="lg"
                  >
                    Confirm Shipping
                  </Button>
                </form>
              ) : (
                <div className="mx-auto max-w-md space-y-4">
                  {order.paymentProof && (
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-2 text-sm font-medium text-text">
                        Your Payment Proof:
                      </p>
                      <img
                        src={order.paymentProof}
                        alt="Payment Proof"
                        className="rounded-lg"
                      />
                    </div>
                  )}
                  <div className="rounded-lg bg-bg-secondary p-6 text-center">
                    <p className="text-text-muted">
                      Waiting for {order.seller.name} to ship the item...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Delivery Confirmation */}
          {order.status === "SHIPPED" && (
            <div className="rounded-xl border border-border bg-bg-card p-8">
              <div className="mb-6 text-center">
                <Truck className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h2 className="mb-2 text-xl font-semibold text-text">
                  {isBuyer ? "Confirm Delivery" : "Item Shipped"}
                </h2>
                <p className="text-text-muted">
                  {isBuyer
                    ? "Have you received the item in good condition?"
                    : "Waiting for buyer to confirm delivery"}
                </p>
              </div>

              <div className="mx-auto max-w-md space-y-4">
                {order.shippingProof && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="mb-2 text-sm font-medium text-text">
                      Shipping Receipt:
                    </p>
                    <img
                      src={order.shippingProof}
                      alt="Shipping Receipt"
                      className="rounded-lg"
                    />
                    {order.trackingNumber && (
                      <p className="mt-3 text-sm">
                        <span className="font-medium">Tracking:</span> {order.trackingNumber}
                      </p>
                    )}
                  </div>
                )}

                {isBuyer ? (
                  <Button
                    onClick={() => setShowDeliveryConfirm(true)}
                    className="w-full"
                    size="lg"
                  >
                    Confirm Delivery
                  </Button>
                ) : (
                  <div className="rounded-lg bg-bg-secondary p-6 text-center">
                    <p className="text-text-muted">
                      Waiting for {order.buyer.name} to confirm delivery...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Rating */}
          {order.status === "DELIVERED" && (
            <div className="rounded-xl border border-border bg-bg-card p-8">
              <div className="mb-6 text-center">
                <Check className="mx-auto mb-4 h-16 w-16 text-success" />
                <h2 className="mb-2 text-xl font-semibold text-text">Order Complete!</h2>
                <p className="text-text-muted">
                  Please rate your experience with {isBuyer ? "the seller" : "the buyer"}
                </p>
              </div>

              <div className="mx-auto max-w-md space-y-4">
                {existingRating ? (
                  <div className="rounded-lg border border-success bg-success/5 p-6">
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <Check className="h-5 w-5 text-success" />
                      <p className="font-medium text-text">You've rated this order</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant={existingRating.rating === 1 ? "success" : "error"}
                      >
                        {existingRating.rating === 1 ? "+1 Positive" : "-1 Negative"}
                      </Badge>
                    </div>
                    {existingRating.comment && (
                      <p className="mt-3 text-center text-sm text-text-muted">
                        "{existingRating.comment}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-bg-secondary p-6 text-center">
                    <p className="mb-4 text-text-muted">
                      Your feedback helps the community!
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full"
                  size="lg"
                  variant={existingRating ? "outline" : "default"}
                >
                  {existingRating
                    ? "Edit Your Rating"
                    : `Rate ${isBuyer ? "Seller" : "Buyer"}`}
                </Button>
              </div>
            </div>
          )}

          {/* Chat Section - Always visible */}
          {isOrderActive && (
            <div className="rounded-xl border border-border bg-bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
                <MessageSquare className="h-5 w-5" />
                Message {isBuyer ? "Seller" : "Buyer"}
              </h3>

              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto rounded-lg bg-bg-secondary p-4">
                {order.messages && order.messages.length > 0 ? (
                  order.messages.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          isMe ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        <Avatar
                          src={isMe ? user?.avatar : targetUser.avatar}
                          fallback={isMe ? user?.fullName : targetUser.name}
                          size="sm"
                        />
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            isMe ? "bg-primary text-white" : "bg-bg-card text-text",
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="mt-1 text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-sm text-text-muted">
                    No messages yet
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim()}>
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* Cancel Button (Seller Only) - Show at bottom */}
          {isSeller && isOrderActive && order.status !== "DELIVERED" && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                className="border-error text-error hover:bg-error hover:text-white"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same */}
      <ConfirmModal
        isOpen={showDeliveryConfirm}
        onClose={() => setShowDeliveryConfirm(false)}
        onConfirm={handleConfirmDelivery}
        title="Confirm Delivery"
        message="Have you received the item in good condition?"
        confirmText="Yes, Confirm Delivery"
      />

      {/* Cancel Order Modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message={
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Are you sure you want to cancel this order? The buyer will receive a -1
              rating automatically.
            </p>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Reason (Optional)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
              />
            </div>
          </div>
        }
        confirmText="Cancel Order"
        confirmButtonVariant="destructive"
        isLoading={cancelling}
      />

      {/* Rating Modal */}
      {targetUser && order.product && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          targetUser={
            {
              ...targetUser,
              fullName: targetUser.name,
              role: isBuyer ? "SELLER" : "BIDDER",
              createdAt: "",
            } as any
          }
          product={{ ...order.product, name: order.product.title } as any}
          type={isBuyer ? "seller" : "buyer"}
          existingRating={
            existingRating
              ? {
                  id: existingRating.id,
                  score: existingRating.rating,
                  comment: existingRating.comment,
                }
              : undefined
          }
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}
