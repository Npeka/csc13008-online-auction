import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";
import { format } from "date-fns";
import { ProductGrid } from "@/components/cards/product-card";
import { SellerInfoCard } from "@/components/cards/user-card";
import {
  ProductBiddingPanel,
  ProductImageGallery,
  ProductInfoSection,
  ProductStats,
} from "@/components/products/detail";
import { BidInput } from "@/components/shared/bid-input";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { bidsApi, productsApi, questionsApi } from "@/lib";
import { formatUSD } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { Product, Question } from "@/types";

// Helper to convert user rating to BidInput expected format
function getUserRatingForBid(
  user: any,
): { positive: number; total: number } | undefined {
  if (!user?.rating) return undefined;

  if (typeof user.rating === "number") {
    // New structure: rating is a number (0-5), use ratingCount
    const ratingCount = user.ratingCount || 0;
    const positive =
      ratingCount > 0 ? Math.round((user.rating / 5) * ratingCount) : 0;
    return { positive, total: ratingCount };
  }

  // Old structure: rating is already an object
  return { positive: user.rating.positive, total: user.rating.total };
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [bidderToReject, setBidderToReject] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { user, isAuthenticated } = useAuthStore();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } =
    useWatchlistStore();

  const isSeller = isAuthenticated && user?.id === product?.seller?.id;

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);

        // Fetch product details by slug (public)
        const productData = await productsApi.getProductBySlug(slug);
        setProduct(productData);
        setRelatedProducts(productData.relatedProducts || []);

        // Fetch questions (public)
        const productQuestions = await questionsApi
          .getQuestions(productData.id)
          .catch(() => []);
        setQuestions(productQuestions);

        // Only fetch bid history if authenticated
        if (isAuthenticated) {
          const bidHistory = await bidsApi
            .getBidHistory(productData.id)
            .catch(() => []);
          setBids(bidHistory);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Product not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [slug, isAuthenticated]);

  const handlePlaceBid = useCallback(
    async (amount: number) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        setIsBidding(true);
        setIsBlocked(false); // Reset blocked state
        await bidsApi.placeBid(product.id, amount);

        toast.success(`Bid of ${formatUSD(amount)} placed successfully!`);

        // Refresh product and bids
        const [updatedProduct, updatedBids] = await Promise.all([
          productsApi.getProductBySlug(slug!),
          bidsApi.getBidHistory(product.id),
        ]);

        setProduct(updatedProduct);
        setBids(updatedBids);
        setShowBidModal(false);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to place bid";

        // Check if user is blocked
        if (errorMessage.includes("blocked from bidding")) {
          setIsBlocked(true);
          toast.error("You have been blocked from bidding on this product");
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setIsBidding(false);
      }
    },
    [isAuthenticated, navigate, product?.id, slug],
  );

  const handleRejectBidder = useCallback(
    (bidderId: string) => {
      if (!isSeller) return;
      setBidderToReject(bidderId);
      setShowRejectConfirm(true);
    },
    [isSeller],
  );

  const confirmRejectBidder = useCallback(async () => {
    if (!bidderToReject) return;

    try {
      setIsRejecting(true);
      await bidsApi.rejectBidder(product.id, bidderToReject);
      toast.success("Bidder rejected successfully");

      // Refresh bids
      const updatedBids = await bidsApi.getBidHistory(product.id);
      setBids(updatedBids);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject bidder");
    } finally {
      setIsRejecting(false);
      setShowRejectConfirm(false);
      setBidderToReject(null);
    }
  }, [bidderToReject, product?.id]);

  const handleWatchlistToggle = useCallback(async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const inWatchlist = isInWatchlist(product.id);
      if (inWatchlist) {
        await removeFromWatchlist(product.id);
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(product);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  }, [
    isAuthenticated,
    navigate,
    product,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toast.success("Buy Now successful! Redirecting to checkout...");
  }, [isAuthenticated, navigate]);

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  }, [product?.images.length]);

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  }, [product?.images.length]);

  if (isLoading) {
    return (
      <div className="container-app flex min-h-screen items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

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

  return (
    <div className="container-app">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: product.category?.name || "Products",
            href: `/products?category=${product.category?.slug}`,
          },
          { label: product.title },
        ]}
        className="my-4"
      />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image Gallery */}
        <ProductImageGallery
          images={product.images}
          title={product.title}
          status={product.status}
          selectedIndex={selectedImageIndex}
          onSelectIndex={setSelectedImageIndex}
          onNext={nextImage}
          onPrev={prevImage}
        />

        {/* Product Info */}
        <div>
          {/* Category & Title */}
          <Link
            to={`/products?category=${product.category?.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {product.category?.name}
          </Link>
          <h1 className="mt-2 mb-4 text-2xl font-bold text-text lg:text-3xl">
            {product.title}
          </h1>

          {/* Stats */}
          <ProductStats
            bidCount={product.bidCount}
            viewCount={product.viewCount}
          />

          {/* Bidding Panel */}
          <ProductBiddingPanel
            currentPrice={product.currentPrice}
            endTime={product.endTime}
            highestBidder={product.highestBidder}
            minimumBid={minimumBid}
            bidStep={product.bidStep}
            buyNowPrice={product.buyNowPrice}
            status={product.status}
            inWatchlist={inWatchlist}
            isSeller={isSeller}
            bids={bids}
            onPlaceBid={() => {
              if (!isAuthenticated) {
                navigate("/login");
                return;
              }
              setShowBidModal(true);
            }}
            onBuyNow={handleBuyNow}
            onWatchlistToggle={handleWatchlistToggle}
            onRejectBidder={handleRejectBidder}
          />

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

      {/* Info Section */}
      <ProductInfoSection
        productId={product.id}
        description={product.description}
        bids={bids}
        questions={questions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuestionAsked={async () => {
          const updated = await questionsApi.getQuestions(product.id);
          setQuestions(updated);
        }}
        isAuthenticated={isAuthenticated}
        isSeller={isSeller}
        onRejectBidder={handleRejectBidder}
      />

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
        onClose={() => {
          setShowBidModal(false);
          setIsBlocked(false); // Reset on close
        }}
        title="Place Your Bid"
        size="md"
      >
        {/* Blocked Warning */}
        {isBlocked && (
          <div className="border-destructive/20 bg-destructive/10 mb-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <svg
                className="text-destructive h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-destructive font-semibold">
                  Blocked from Bidding
                </h4>
                <p className="text-destructive/90 mt-1 text-sm">
                  You have been blocked from bidding on this product by the
                  seller. You will not be able to place any bids on this
                  auction.
                </p>
              </div>
            </div>
          </div>
        )}

        <BidInput
          currentPrice={product.currentPrice}
          bidStep={product.bidStep}
          minimumBid={minimumBid}
          onPlaceBid={handlePlaceBid}
          isLoading={isBidding}
          userRating={getUserRatingForBid(user)}
          allowNewBidders={product.allowNewBidders ?? true}
          disabled={isBlocked}
        />
      </Modal>

      {/* Reject Bidder Confirmation */}
      <ConfirmModal
        isOpen={showRejectConfirm}
        onClose={() => {
          setShowRejectConfirm(false);
          setBidderToReject(null);
        }}
        onConfirm={confirmRejectBidder}
        title="Reject Bidder"
        message="Are you sure you want to reject this bidder? They will be unable to bid on this product again."
        confirmText="Reject Bidder"
        variant="danger"
        isLoading={isRejecting}
      />
    </div>
  );
}
