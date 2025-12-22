import { Link } from "react-router";
import { ArrowRight, Clock, TrendingUp, DollarSign, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/cards/product-card";
import { CategoryCard } from "@/components/cards/category-card";
import { Countdown } from "@/components/shared/countdown";
import {
  mockCategories,
  getEndingSoonProducts,
  getMostBidProducts,
  getHighestPriceProducts,
  getFeaturedProducts,
} from "@/data/mock";

export function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const endingSoon = getEndingSoonProducts(5);
  const mostBid = getMostBidProducts(5);
  const highestPrice = getHighestPriceProducts(5);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-700 to-slate-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container-app relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div className="text-white">
              <h1 className="mb-6 text-4xl leading-tight font-bold lg:text-5xl">
                Find Your Perfect{" "}
                <span className="bg-linear-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent">
                  Reptile Companion
                </span>
              </h1>
              <p
                className="mb-8 text-lg text-white/80 lg:text-xl"
                style={{ maxWidth: "36rem" }}
              >
                The premier marketplace for reptile enthusiasts. Buy and sell
                quality reptiles from trusted breeders worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/search">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90"
                    style={{ color: "#047857" }}
                  >
                    Start Bidding
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Become a Seller
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 flex gap-8 border-t border-white/20 pt-8">
                <div>
                  <p className="text-3xl font-bold">4K+</p>
                  <p className="text-sm text-white/70">Reptiles Available</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">2K+</p>
                  <p className="text-sm text-white/70">Verified Breeders</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">50+</p>
                  <p className="text-sm text-white/70">Species</p>
                </div>
              </div>
            </div>

            {/* Featured Auction Card */}
            {featuredProducts[0] && (
              <div className="hidden lg:block">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
                  <p className="mb-3 flex items-center gap-2 text-sm text-white/70">
                    <Zap className="h-4 w-4 text-cta" />
                    Featured Auction
                  </p>
                  <Link
                    to={`/product/${featuredProducts[0].id}`}
                    className="group block"
                  >
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                      <img
                        src={featuredProducts[0].images[0]?.url}
                        alt={featuredProducts[0].name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3">
                        <Countdown
                          endTime={featuredProducts[0].endTime}
                          showIcon
                        />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-cta">
                      {featuredProducts[0].name}
                    </h3>
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-xs text-white/60">Current Bid</p>
                        <p className="text-2xl font-bold">
                          ${featuredProducts[0].currentPrice.toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm" className="bg-cta hover:bg-cta-hover">
                        Place Bid
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container-app py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text">Browse Categories</h2>
          <Link
            to="/search"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mockCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Ending Soon Section */}
      <section className="container-app py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-error-light p-2">
              <Clock className="h-5 w-5 text-error" />
            </div>
            <h2 className="text-2xl font-bold text-text">Ending Soon</h2>
          </div>
          <Link
            to="/search?sort=ending_asc"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={endingSoon} columns={4} />
      </section>

      {/* Most Bid Section */}
      <section className="bg-bg-secondary py-16">
        <div className="container-app">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-light p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text">
                Most Active Auctions
              </h2>
            </div>
            <Link
              to="/search?sort=most_bids"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={mostBid} columns={4} />
        </div>
      </section>

      {/* Highest Price Section */}
      <section className="container-app py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success-light p-2">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text">Premium Listings</h2>
          </div>
          <Link
            to="/search?sort=price_desc"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={highestPrice} columns={4} />
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-emerald-800 to-emerald-600 py-20">
        <div className="container-app text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Ready to Start Breeding?
          </h2>
          <p
            className="mx-auto mb-8 text-white/80"
            style={{ maxWidth: "42rem" }}
          >
            Join our community of reptile breeders and reach thousands of
            enthusiasts. Create your first listing today and share your passion.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90"
              style={{ color: "#047857" }}
            >
              Become a Breeder
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
