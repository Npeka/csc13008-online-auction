import { Link } from "react-router";
import { ArrowRight, Zap } from "lucide-react";
import { Countdown } from "@/components/shared/countdown";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface HeroSectionProps {
  featuredProduct?: Product;
  activeAuctionsCount: number;
  categoriesCount: number;
}

export function HeroSection({
  featuredProduct,
  activeAuctionsCount,
  categoriesCount,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-teal-500 via-emerald-400 to-cyan-500 dark:from-emerald-800 dark:via-emerald-700 dark:to-slate-800">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="container-app relative py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div className="text-white">
            <h1 className="mb-6 text-4xl leading-tight font-bold lg:text-5xl">
              Discover Amazing{" "}
              <span className="bg-linear-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent">
                Auction Deals
              </span>
            </h1>
            <p
              className="mb-8 text-lg text-white/80 lg:text-xl"
              style={{ maxWidth: "36rem" }}
            >
              The premier marketplace for online auctions. Bid on quality
              products from trusted sellers worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
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
                <p className="text-3xl font-bold">{activeAuctionsCount}+</p>
                <p className="text-sm text-white/70">Active Auctions</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{categoriesCount}+</p>
                <p className="text-sm text-white/70">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm text-white/70">Verified</p>
              </div>
            </div>
          </div>

          {/* Featured Auction Card */}
          {featuredProduct && (
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
                <p className="mb-3 flex items-center gap-2 text-sm text-white/70">
                  <Zap className="h-4 w-4 text-cta" />
                  Featured Auction
                </p>
                <Link
                  to={`/products/${featuredProduct.slug}`}
                  className="group block"
                >
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                    <img
                      src={
                        typeof featuredProduct.images[0] === "string"
                          ? featuredProduct.images[0]
                          : featuredProduct.images[0]?.url
                      }
                      alt={featuredProduct.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3">
                      <Countdown endTime={featuredProduct.endTime} showIcon />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-cta">
                    {featuredProduct.title}
                  </h3>
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs text-white/60">Current Bid</p>
                      <p className="text-2xl font-bold">
                        ${featuredProduct.currentPrice.toLocaleString()}
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
  );
}
