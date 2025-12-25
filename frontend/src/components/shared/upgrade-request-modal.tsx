import { useState } from "react";
import {
  TrendingUp,
  Check,
  Clock,
  ShieldCheck,
  DollarSign,
  Users,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export interface UpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => Promise<void>;
}

export function UpgradeRequestModal({
  isOpen,
  onClose,
  onSubmit,
}: UpgradeRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit();
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setIsSubmitted(true);
      toast.success("Upgrade request submitted successfully!");
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset state after a delay to avoid flickering
      setTimeout(() => setIsSubmitted(false), 300);
      onClose();
    }
  };

  const benefits = [
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Start Selling",
      description: "List your items and reach thousands of potential buyers",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Grow Your Audience",
      description: "Build a reputation and attract repeat customers",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Seller Protection",
      description: "Benefit from our seller protection policies",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSubmitted ? "Request Submitted!" : "Become a Seller"}
      size="md"
    >
      {isSubmitted ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-text">
            Your request has been submitted
          </h3>
          <p className="mb-6 text-text-muted">
            Our team will review your request within 7 days. You'll receive an
            email notification once your account is upgraded.
          </p>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-bg-secondary p-3">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-sm text-text-muted">
              Estimated review time:{" "}
              <strong className="text-text">5-7 business days</strong>
            </span>
          </div>
          <Button onClick={handleClose} className="mt-6">
            Got it
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              Upgrade your account to start selling on our platform. Here's what
              you'll get:
            </p>
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-3 rounded-lg bg-bg-secondary p-3"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {benefit.icon}
                </div>
                <div>
                  <p className="font-medium text-text">{benefit.title}</p>
                  <p className="text-sm text-text-muted">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Requirements Notice */}
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="text-sm text-text">
              <strong>Note:</strong> Your request will be reviewed by our admin
              team. Make sure your profile is complete and you have a good buyer
              rating to increase approval chances.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
