import React, { type FormEvent,useState } from "react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth-api";
import { FormMessage } from "./FormMessage";

/**
 * ChangePasswordForm
 * Form for changing user password with API integration.
 */
export const ChangePasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.changePassword(
        formData.currentPassword,
        formData.newPassword,
      );

      setMessage({ type: "success", text: "Password updated successfully!" });
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          Current Password
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) =>
            setFormData({ ...formData, currentPassword: e.target.value })
          }
          placeholder="••••••••"
          className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          New Password
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          placeholder="••••••••"
          className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
          required
          minLength={6}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          Confirm New Password
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          placeholder="••••••••"
          className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
          required
          minLength={6}
        />
      </div>
      {message && <FormMessage type={message.type} text={message.text} />}
      <Button type="submit" variant="outline" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
};
