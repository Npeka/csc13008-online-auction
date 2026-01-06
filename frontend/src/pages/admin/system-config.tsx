import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Settings, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { systemApi, type AuctionConfig } from "@/lib";

export function AdminSystemConfigPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AuctionConfig>({
    extensionTriggerTime: 5,
    extensionDuration: 10,
    newProductThreshold: 1440, // 24 hours default
  });

  // Fetch config with React Query
  const { data, isLoading } = useQuery({
    queryKey: ["system", "config", "auction"],
    queryFn: systemApi.getAuctionConfig,
  });

  // Sync fetched data to form state
  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: systemApi.updateAuctionConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system", "config"] });
      toast.success("Configuration updated successfully");
    },
    onError: () => {
      toast.error("Failed to update configuration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      extensionTriggerTime: Number(formData.extensionTriggerTime),
      extensionDuration: Number(formData.extensionDuration),
      newProductThreshold: Number(formData.newProductThreshold),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text">System Configuration</h1>
        <p className="mt-2 text-text-muted">
          Manage global settings for the auction platform
        </p>
      </div>

      {/* Auction Auto-Extension Settings */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
        <div className="border-b border-border bg-bg-tertiary px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-text">
              Auction Auto-Extension
            </h2>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Configure how auctions are extended when bids are placed near the
            end time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="triggerTime">Trigger Time (Minutes)</Label>
              <p className="text-xs text-text-muted">
                Extend auction if a bid is placed within this many minutes of
                the end.
              </p>
              <Input
                id="triggerTime"
                type="number"
                min="1"
                value={formData.extensionTriggerTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    extensionTriggerTime: Number(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Extension Duration (Minutes)</Label>
              <p className="text-xs text-text-muted">
                How many minutes to add to the end time when triggered.
              </p>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.extensionDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    extensionDuration: Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          {/* New Product Threshold */}
          <div className="border-t border-border pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-text">New Product Badge</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newProductThreshold">
                New Product Threshold (Minutes)
              </Label>
              <p className="text-xs text-text-muted">
                Products created within this time will show the "New" badge.
                Default: 1440 minutes (24 hours).
              </p>
              <Input
                id="newProductThreshold"
                type="number"
                min="1"
                value={formData.newProductThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newProductThreshold: Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-6">
            <Button type="submit" isLoading={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
