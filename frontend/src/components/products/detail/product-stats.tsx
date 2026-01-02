import { memo } from "react";
import { Eye, Users } from "lucide-react";

interface ProductStatsProps {
  bidCount: number;
  viewCount: number;
}

export const ProductStats = memo(function ProductStats({
  bidCount,
  viewCount,
}: ProductStatsProps) {
  return (
    <div className="mb-6 flex items-center gap-4 text-sm text-text-muted">
      <span className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        {bidCount || 0} bids
      </span>
      <span className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        {viewCount || 0} views
      </span>
    </div>
  );
});
