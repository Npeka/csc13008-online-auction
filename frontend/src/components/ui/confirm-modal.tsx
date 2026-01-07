import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  confirmButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: XCircle,
    iconColor: "text-destructive",
    confirmButton: "bg-destructive hover:bg-destructive/90",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    confirmButton: "bg-orange-500 hover:bg-orange-600",
  },
  info: {
    icon: Info,
    iconColor: "text-primary",
    confirmButton: "bg-primary hover:bg-primary/90",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-success",
    confirmButton: "bg-success hover:bg-success/90",
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={`rounded-full bg-bg-secondary p-3 ${style.iconColor}`}
          >
            <Icon className="h-8 w-8" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center text-text-muted">{message}</div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 text-white ${style.confirmButton}`}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
