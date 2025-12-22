import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Heart,
  Share2,
  Shield,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn, formatUSD, maskName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Countdown } from "@/components/shared/countdown";
import { BidInput } from "@/components/shared/bid-input";
import { BidHistoryTable } from "@/components/shared/bid-history";
import { RatingBadge } from "@/components/shared/rating";
import { ProductGrid } from "@/components/cards/product-card";
import { SellerInfoCard } from "@/components/cards/user-card";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  getProductById,
  getBidsForProduct,
  getQuestionsForProduct,
  getProductsByCategory,
} from "@/data/mock";
import toast from "react-hot-toast";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [isBidding, setIsBidding] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();

  const product = getProductById(id || "");
  const bids = getBidsForProduct(id || "");
  const questions = getQuestionsForProduct(id || "");
  const relatedProducts = product
    ? getProductsByCategory(product.categoryId)
        .filter((p) => p.id !== product.id)
        .slice(0, 5)
    : [];

  if (!product) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text">Product Not Found</h1>
        <p className="mb-8 text-text-muted">
          The product you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(product.id);
  const minimumBid = product.currentPrice + product.bidStep;

  const handlePlaceBid = async (amount: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to place a bid");
      return;
    }

    setIsBidding(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsBidding(false);
    setShowBidModal(false);
    toast.success(`Bid of ${formatUSD(amount)} placed successfully!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to buy now");
      return;
    }
    toast.success("Buy Now successful! Redirecting to checkout...");
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  return (
    <div className="container-app py-10">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: product.category.name,
            href: `/category/${product.categoryId}`,
          },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-bg-secondary">
            <img
              src={product.images[selectedImageIndex]?.url}
              alt={product.images[selectedImageIndex]?.alt}
              className="h-full w-full object-cover"
            />

            {/* Navigation arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {product.isFeatured && <Badge variant="warning">Featured</Badge>}
              {product.status === "active" && (
                <Badge variant="success">Active</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                  index === selectedImageIndex
                    ? "border-primary"
                    : "border-transparent hover:border-border",
                )}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          {/* Category & Title */}
          <Link
            to={`/category/${product.categoryId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {product.category.name}
          </Link>
          <h1 className="mt-2 mb-4 text-2xl font-bold text-text lg:text-3xl">
            {product.name}
          </h1>

          {/* Stats */}
          <div className="mb-6 flex items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {product.bidCount} bids
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {product.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {product.watchCount} watching
            </span>
          </div>

          {/* Price & Countdown */}
          <div className="mb-6 rounded-xl border border-border bg-bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-text-muted">Current Bid</p>
                <p className="text-3xl font-bold text-text">
                  {formatUSD(product.currentPrice)}
                </p>
              </div>
              <Countdown endTime={product.endTime} size="lg" />
            </div>

            {/* Highest Bidder */}
            {product.highestBidder && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-bg-secondary p-3">
                <Avatar
                  src={product.highestBidder.avatar}
                  fallback={product.highestBidder.fullName}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-sm text-text-muted">Highest Bidder</p>
                  <p className="font-medium text-text">
                    {maskName(product.highestBidder.fullName)}
                  </p>
                </div>
                <RatingBadge
                  positive={product.highestBidder.rating.positive}
                  total={product.highestBidder.rating.total}
                  size="sm"
                />
              </div>
            )}

            {/* Bid Info */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Minimum Bid</p>
                <p className="font-semibold text-text">
                  {formatUSD(minimumBid)}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Bid Increment</p>
                <p className="font-semibold text-text">
                  +{formatUSD(product.bidStep)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowBidModal(true)}
                className="w-full"
                size="lg"
              >
                Place Bid
              </Button>

              {product.buyNowPrice && (
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="w-full border-cta text-cta hover:bg-cta hover:text-white"
                  size="lg"
                >
                  Buy Now - {formatUSD(product.buyNowPrice)}
                </Button>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => toggleWatchlist(product.id)}
                  variant={inWatchlist ? "secondary" : "ghost"}
                  className="flex-1"
                >
                  <Heart
                    className={cn(
                      "mr-2 h-4 w-4",
                      inWatchlist && "fill-current",
                    )}
                  />
                  {inWatchlist ? "Watching" : "Add to Watchlist"}
                </Button>
                <Button variant="ghost" className="px-4">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
              <Shield className="h-4 w-4 text-success" />
              Buyer Protection Guarantee
            </div>
          </div>

          {/* Seller Info */}
          <SellerInfoCard seller={product.seller} />

          {/* Dates */}
          <div className="mt-4 text-sm text-text-muted">
            <p>
              Posted:{" "}
              {format(new Date(product.createdAt), "MMM d, yyyy h:mm a")}
            </p>
            <p>
              Ends: {format(new Date(product.endTime), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <Tabs
          tabs={[
            { id: "description", label: "Description" },
            { id: "bids", label: `Bid History (${bids.length})` },
            { id: "questions", label: `Q&A (${questions.length})` },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />

        <div className="mt-6">
          <TabPanel value="description" activeTab={activeTab}>
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </TabPanel>

          <TabPanel value="bids" activeTab={activeTab}>
            <BidHistoryTable bids={bids} />
          </TabPanel>

          <TabPanel value="questions" activeTab={activeTab}>
            {questions.length === 0 ? (
              <p className="py-8 text-center text-text-muted">
                No questions yet. Be the first to ask!
              </p>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-border bg-bg-card p-4"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <Avatar
                        src={q.asker.avatar}
                        fallback={q.asker.fullName}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-text">
                          {q.asker.fullName}
                        </p>
                        <p className="text-xs text-text-muted">
                          {format(new Date(q.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <p className="mb-3 text-text">{q.content}</p>

                    {q.answer ? (
                      <div className="ml-4 border-l-2 border-primary pl-4">
                        <p className="mb-1 text-sm font-medium text-primary">
                          Seller Response
                        </p>
                        <p className="text-text">{q.answer.content}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {format(new Date(q.answer.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted italic">
                        Awaiting seller response...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ask Question Form */}
            {isAuthenticated && (
              <div className="mt-6 rounded-xl bg-bg-secondary p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-text">
                  <MessageCircle className="h-4 w-4" />
                  Ask a Question
                </h4>
                <textarea
                  placeholder="Type your question here..."
                  className="w-full resize-none rounded-lg border border-border bg-bg-card p-3 text-text placeholder:text-text-muted"
                  rows={3}
                />
                <div className="mt-3 flex justify-end">
                  <Button size="sm">Submit Question</Button>
                </div>
              </div>
            )}
          </TabPanel>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-xl font-bold text-text">Related Products</h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </section>
      )}

      {/* Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Place Your Bid"
        size="md"
      >
        <BidInput
          currentPrice={product.currentPrice}
          bidStep={product.bidStep}
          minimumBid={minimumBid}
          onPlaceBid={handlePlaceBid}
          isLoading={isBidding}
          userRating={user?.rating}
        />
      </Modal>
    </div>
  );
}
