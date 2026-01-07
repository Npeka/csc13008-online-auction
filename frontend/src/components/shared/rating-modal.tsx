import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { Product, User } from "@/types";

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User;
  product: Product;
  type?: "seller" | "buyer";
  existingRating?: {
    id: string;
    score: 1 | -1;
    comment?: string;
  };
  onSubmit?: (rating: { score: 1 | -1; comment: string }) => Promise<void>;
}

export function RatingModal({
  isOpen,
  onClose,
  targetUser,
  product,
  type = "seller",
  existingRating,
  onSubmit,
}: RatingModalProps) {
  const [score, setScore] = useState<1 | -1 | null>(existingRating?.score || null);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when existingRating changes
  useEffect(() => {
    if (existingRating) {
      setScore(existingRating.score);
      setComment(existingRating.comment || "");
    }
  }, [existingRating]);

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
      title={`${existingRating ? "Update" : "Rate"} ${type === "seller" ? "Seller" : "Buyer"}`}
      description={`How was your experience with ${targetUser.fullName}?`}
      size="md"
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="flex items-center gap-3 rounded-lg bg-bg-secondary p-3">
          <img
            src={
              typeof product.images[0] === "string"
                ? product.images[0]
                : product.images[0]?.url
            }
            alt={product.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text">{product.name}</p>
            <p className="text-sm text-text-muted">
              {type === "seller" ? "Purchased from" : "Sold to"}{" "}
              {targetUser.fullName}
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar
            src={targetUser.avatar}
            fallback={targetUser.fullName}
            size="md"
          />
          <div>
            <p className="font-medium text-text">{targetUser.fullName}</p>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span>
                {typeof targetUser.rating === "object" &&
                targetUser.rating.total > 0
                  ? `${Math.round((targetUser.rating.positive / targetUser.rating.total) * 100)}% positive`
                  : "No ratings yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Buttons */}
        <div>
          <p className="mb-3 text-sm font-medium text-text">
            Would you recommend this {type === "seller" ? "seller" : "buyer"}?
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
            placeholder={`Share your experience with this ${type === "seller" ? "seller" : "buyer"}...`}
            className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-text-muted">
            {comment.length}/500 characters
          </p>
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
            {existingRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
