import { memo } from "react";
import { BidHistoryTable } from "@/components/shared/bid-history";
import { TabPanel, Tabs } from "@/components/ui/tabs";

interface ProductInfoSectionProps {
  description: string;
  bids: any[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProductInfoSection = memo(function ProductInfoSection({
  description,
  bids,
  activeTab,
  onTabChange,
}: ProductInfoSectionProps) {
  return (
    <div className="mt-16">
      <Tabs
        tabs={[
          { id: "description", label: "Description" },
          { id: "bids", label: `Bid History (${bids.length})` },
        ]}
        activeTab={activeTab}
        onChange={onTabChange}
        variant="underline"
      />

      <div className="mt-6">
        <TabPanel value="description" activeTab={activeTab}>
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </TabPanel>

        <TabPanel value="bids" activeTab={activeTab}>
          <BidHistoryTable bids={bids} />
        </TabPanel>
      </div>
    </div>
  );
});
