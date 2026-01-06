import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Users } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUpdateProfile } from "@/hooks/use-profile";
import type { User } from "@/types";

interface SellerSettingsCardProps {
  user: User;
}

export function SellerSettingsCard({ user }: SellerSettingsCardProps) {
  const [allowNewBidders, setAllowNewBidders] = useState(
    user.allowNewBidders ?? true,
  );
  const updateProfile = useUpdateProfile();

  // Sync local state with prop changes (e.g., when profile is refetched)
  useEffect(() => {
    setAllowNewBidders(user.allowNewBidders ?? true);
  }, [user.allowNewBidders]);

  const handleToggle = async (checked: boolean) => {
    setAllowNewBidders(checked);

    try {
      await updateProfile.mutateAsync({ allowNewBidders: checked });
      toast.success(
        checked
          ? "New bidders can now bid on your products"
          : "Only bidders with ratings can bid on your products",
      );
    } catch (error) {
      // Revert on error
      setAllowNewBidders(!checked);
      toast.error("Failed to update setting");
    }
  };

  return (
    <SectionCard title="Seller Settings">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-text-muted" />
            <div className="space-y-0.5">
              <Label className="text-base">Allow New Bidders</Label>
              <p className="text-sm text-text-muted">
                Allow bidders without any ratings to bid on your products by
                default. You can override this for each product.
              </p>
            </div>
          </div>
          <Switch
            checked={allowNewBidders}
            onCheckedChange={handleToggle}
            disabled={updateProfile.isPending}
          />
        </div>
      </div>
    </SectionCard>
  );
}
