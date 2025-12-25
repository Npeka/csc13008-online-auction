import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { User, Product } from "@/types";
import toast from "react-hot-toast";

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: User;
  product: Product;
  onSubmit?: (rating: { score: 1 | -1; comment: string }) => Promise<void>;
}

export function RatingModal({
  isOpen,
  onClose,
  seller,
  product,
  onSubmit,
}: RatingModalProps) {
  const [score, setScore] = useState<1 | -1 | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === null) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ score, comment });
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      toast.success("Rating submitted successfully!");
      onClose();
      // Reset form
      setScore(null);
      setComment("");
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setScore(null);
      setComment("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rate Seller"
      description={`How was your experience with ${seller.fullName}?`}
      size="md"
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="flex items-center gap-3 rounded-lg bg-bg-secondary p-3">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text">{product.name}</p>
            <p className="text-sm text-text-muted">
              Purchased from {seller.fullName}
            </p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-3">
          <Avatar src={seller.avatar} fallback={seller.fullName} size="md" />
          <div>
            <p className="font-medium text-text">{seller.fullName}</p>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span>
                {seller.rating.total > 0
                  ? `${Math.round((seller.rating.positive / seller.rating.total) * 100)}% positive`
                  : "No ratings yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Buttons */}
        <div>
          <p className="mb-3 text-sm font-medium text-text">
            Would you recommend this seller?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setScore(1)}
              disabled={isSubmitting}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                score === 1
                  ? "border-success bg-success/10 text-success"
                  : "border-border text-text-muted hover:border-success/50 hover:text-success",
              )}
            >
              <ThumbsUp
                className={cn("h-8 w-8", score === 1 && "fill-current")}
              />
              <span className="text-sm font-medium">Positive (+1)</span>
            </button>
            <button
              type="button"
              onClick={() => setScore(-1)}
              disabled={isSubmitting}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                score === -1
                  ? "border-error bg-error/10 text-error"
                  : "border-border text-text-muted hover:border-error/50 hover:text-error",
              )}
            >
              <ThumbsDown
                className={cn("h-8 w-8", score === -1 && "fill-current")}
              />
              <span className="text-sm font-medium">Negative (-1)</span>
            </button>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this seller..."
            className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={score === null}
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </Modal>
  );
}
