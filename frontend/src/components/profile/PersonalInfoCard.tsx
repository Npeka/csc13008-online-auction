import React, { type FormEvent,useState } from "react";
import { Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/users-api";
import { useAuthStore } from "@/stores/auth-store";
import { FormMessage } from "./FormMessage";

/**
 * PersonalInfoCard
 * Displays personal information with inline edit capability
 */
export const PersonalInfoCard: React.FC<{ user: any }> = ({ user }) => {
  const { updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    address: user?.address || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
  });

  const handleCancel = () => {
    setFormData({
      name: user?.fullName || "",
      address: user?.address || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Filter out empty strings to avoid validation errors
      const updateData: any = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.address) updateData.address = formData.address;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;

      const updatedUser = await usersApi.updateProfile(updateData);

      updateProfile({
        fullName: updatedUser.fullName,
        address: updatedUser.address,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
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
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-text">Personal Information</h2>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              required
              minLength={2}
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
              placeholder="+84 xxx xxx xxx"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text"
            />
          </div>
          {message && <FormMessage type={message.type} text={message.text} />}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-text-muted">Full Name</p>
            <p className="text-text">{user.fullName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Email</p>
            <p className="text-text">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Address</p>
            <p className="text-text">{user.address || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Phone</p>
            <p className="text-text">{user.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Date of Birth</p>
            <p className="text-text">
              {user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : "Not provided"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
