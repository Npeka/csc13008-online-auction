import React from "react";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * UpgradeBanner
 * Shown to bidders to encourage them to become sellers.
 */
export const UpgradeBanner: React.FC<{ onUpgrade: () => void }> = ({
  onUpgrade,
}) => (
  <div className="mt-8 rounded-xl bg-linear-to-r from-primary to-cta p-6 text-white">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="mb-2 text-xl font-bold">Become a Seller</h3>
        <p className="text-white/80">
          Start selling your items and reach thousands of buyers.
        </p>
      </div>
      <Button
        className="bg-white text-primary! hover:bg-white/90"
        onClick={onUpgrade}
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Request Upgrade
      </Button>
    </div>
  </div>
);
