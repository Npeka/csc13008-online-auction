import { memo, useMemo } from "react";
import { BidHistoryTable } from "@/components/shared/bid-history";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import type { Question } from "@/types";
import { AskSellerForm } from "./ask-seller-form";
import { SellerQAForm } from "./seller-qa-form";

interface ProductInfoSectionProps {
  productId: string;
  description: string;
  bids: any[];
  questions: Question[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuestionAsked: () => void;
  isAuthenticated?: boolean;
  isSeller?: boolean;
  onRejectBidder?: (bidderId: string) => void;
}

export const ProductInfoSection = memo(function ProductInfoSection({
  productId,
  description,
  bids,
  questions,
  activeTab,
  onTabChange,
  onQuestionAsked,
  isAuthenticated = false,
  isSeller = false,
  onRejectBidder,
}: ProductInfoSectionProps) {
  // Build tabs based on authentication status
  const tabs = useMemo(() => {
    const baseTabs = [{ id: "description", label: "Description" }];

    // Only show bid history tab for authenticated users
    if (isAuthenticated) {
      baseTabs.push({ id: "bids", label: `Bid History (${bids.length})` });
    }

    baseTabs.push({ id: "qa", label: `Q&A (${questions.length})` });

    return baseTabs;
  }, [isAuthenticated, bids.length, questions.length]);

  return (
    <div className="mt-16">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={onTabChange}
        variant="underline"
      />

      <div className="mt-6">
        <TabPanel value="description" activeTab={activeTab}>
          <div
            className="prose prose-slate dark:prose-invert max-w-none break-words overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </TabPanel>

        {isAuthenticated && (
          <TabPanel value="bids" activeTab={activeTab}>
            <BidHistoryTable
              bids={bids}
              isSeller={isSeller}
              onRejectBidder={onRejectBidder}
            />
          </TabPanel>
        )}

        <TabPanel value="qa" activeTab={activeTab}>
          {isSeller ? (
            <SellerQAForm
              productId={productId}
              questions={questions}
              onQuestionAnswered={onQuestionAsked}
            />
          ) : (
            <AskSellerForm
              productId={productId}
              questions={questions}
              onQuestionAsked={onQuestionAsked}
            />
          )}
        </TabPanel>
      </div>
    </div>
  );
});
