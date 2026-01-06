import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface UpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (reason: string) => Promise<void>;
  onSuccess?: () => void; // Callback after successful submission
}

export function UpgradeRequestModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
}: UpgradeRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(reason);
      }
      setIsSubmitted(true);
      toast.success("Upgrade request submitted successfully!");
      // Call onSuccess callback to trigger parent refetch
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onSuccess, reason]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      // Reset state after a delay to avoid flickering
      setTimeout(() => {
        setIsSubmitted(false);
        setReason("");
      }, 300);
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSubmitted ? "Request Submitted!" : "Become a Seller"}
      size="md"
    >
      {isSubmitted ? (
        <SuccessView onClose={handleClose} />
      ) : (
        <RequestForm
          reason={reason}
          onReasonChange={setReason}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
        <Check className="h-7 w-7 text-success" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">
        Request Submitted
      </h3>
      <p className="mb-4 text-text-muted">
        We'll review your request and notify you by email within 5-7 business
        days.
      </p>
      <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-warning/5 p-2.5">
        <Clock className="h-4 w-4 text-warning" />
        <span className="text-sm text-text-muted">
          Review time: <strong className="text-text">5-7 days</strong>
        </span>
      </div>
      <Button onClick={onClose} size="sm" className="mt-2">
        Got it
      </Button>
    </div>
  );
}

function RequestForm({
  reason,
  onReasonChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  reason: string;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const benefits = useMemo(
    () => [
      {
        icon: DollarSign,
        title: "Start Selling",
        desc: "List items & reach buyers",
      },
      {
        icon: Users,
        title: "Build Reputation",
        desc: "Grow your seller profile",
      },
      {
        icon: ShieldCheck,
        title: "Seller Protection",
        desc: "Protected transactions",
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      {/* Benefits - More compact grid layout */}
      <div>
        <p className="mb-2 text-text-muted">Benefits you'll get:</p>
        <div className="grid grid-cols-3 gap-2">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-bg-secondary p-2.5 text-center"
            >
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <benefit.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-text">{benefit.title}</p>
              <p className="mt-1 text-xs leading-tight text-text-muted">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reason textarea - reduced rows */}
      <div>
        <label
          htmlFor="upgrade-reason"
          className="mb-2 block font-medium text-text"
        >
          Why do you want to sell? (Optional)
        </label>
        <textarea
          id="upgrade-reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Share your reason..."
          className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          rows={2}
        />
      </div>

      {/* Note - more compact */}
      <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2">
        <p className="text-sm text-text">
          <strong>Tip:</strong> Complete profile & good ratings improve approval
          chances.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          size="sm"
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} isLoading={isSubmitting} size="sm">
          <TrendingUp className="mr-2 h-4 w-4" />
          Submit Request
        </Button>
      </div>
    </div>
  );
}
