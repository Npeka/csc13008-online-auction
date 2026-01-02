import React, { type FormEvent,useState } from "react";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/users-api";
import { useAuthStore } from "@/stores/auth-store";
import { FormMessage } from "./FormMessage";

/**
 * ProfileInfoForm
 * Form for editing user profile information (name, address).
 */
export const ProfileInfoForm: React.FC<{ user: any }> = ({ user }) => {
  const { updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    address: user?.address || "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedUser = await usersApi.updateProfile({
        name: formData.name,
        address: formData.address,
      });

      updateProfile({
        fullName: updatedUser.fullName,
        address: updatedUser.address,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          Full Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
          required
          minLength={2}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text opacity-50"
          disabled
          title="Email cannot be changed"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
          rows={3}
        />
      </div>
      {message && <FormMessage type={message.type} text={message.text} />}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
