import { useEffect, useState } from "react";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import {
  CategoriesSection,
  CTASection,
  HeroSection,
  ProductSection,
} from "@/components/home";
import { categoriesApi, productsApi } from "@/lib";
import type { Category, Product } from "@/types";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [endingSoon, setEndingSoon] = useState<Product[]>([]);
  const [mostBid, setMostBid] = useState<Product[]>([]);
  const [highestPrice, setHighestPrice] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [endingSoonData, mostBidData, highestPriceData, categoriesData] =
          await Promise.all([
            productsApi.getEndingSoon(5),
            productsApi.getMostBids(5),
            productsApi.getHighestPrice(5),
            categoriesApi.getCategories(),
          ]);

        setEndingSoon(endingSoonData);
        setMostBid(mostBidData);
        setHighestPrice(highestPriceData);
        setCategories(categoriesData.filter((c) => !c.parentId)); // Only top-level categories

        // Use highest price products as featured
        setFeaturedProducts(highestPriceData.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection
        featuredProduct={featuredProducts[0]}
        activeAuctionsCount={endingSoon.length}
        categoriesCount={categories.length}
      />

      <CategoriesSection categories={categories} />

      <ProductSection
        title="Ending Soon"
        Icon={Clock}
        iconColor="text-error"
        iconBgColor="bg-error-light"
        products={endingSoon}
        viewAllLink="/products?sort=ending_asc"
      />

      <ProductSection
        title="Most Active Auctions"
        Icon={TrendingUp}
        iconColor="text-primary"
        iconBgColor="bg-primary-light"
        products={mostBid}
        viewAllLink="/products?sort=most_bids"
        backgroundColor="bg-bg-secondary"
      />

      <ProductSection
        title="Premium Listings"
        Icon={DollarSign}
        iconColor="text-success"
        iconBgColor="bg-success-light"
        products={highestPrice}
        viewAllLink="/products?sort=price_desc"
      />

      <CTASection />
    </div>
  );
}
