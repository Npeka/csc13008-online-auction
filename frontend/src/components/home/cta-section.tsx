import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { UpgradeRequestModal } from "@/components/shared/upgrade-request-modal";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/users-api";
import { useAuthStore } from "@/stores/auth-store";

export function CTASection() {
  const { user, isAuthenticated } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const renderContent = () => {
    // Seller View
    if (isAuthenticated && user?.role === "SELLER") {
      return (
        <div className="container-app text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Grow Your Business
          </h2>
          <p
            className="mx-auto mb-8 text-white/80"
            style={{ maxWidth: "42rem" }}
          >
            Access your seller dashboard to manage listings, track performance,
            and reach more customers.
          </p>
          <Link to="/seller/products">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90"
              style={{ color: "#047857" }}
            >
              Seller Dashboard
              <LayoutDashboard className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      );
    }

    // Bidder View
    if (isAuthenticated && user?.role === "BIDDER") {
      return (
        <div className="container-app text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Ready to Start Selling?
          </h2>
          <p
            className="mx-auto mb-8 text-white/80"
            style={{ maxWidth: "42rem" }}
          >
            Join our community of sellers and reach thousands of bidders. Create
            your first listing today and share your products with the world.
          </p>
          <Button
            size="lg"
            className="bg-white hover:bg-white/90"
            style={{ color: "#047857" }}
            onClick={() => setShowUpgradeModal(true)}
          >
            Become a Seller
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <UpgradeRequestModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            onSubmit={async (reason) => {
              await usersApi.createUpgradeRequest(reason);
            }}
          />
        </div>
      );
    }

    // Guest View
    return (
      <div className="container-app text-center">
        <h2 className="mb-6 text-3xl font-bold text-white">
          Ready to Start Selling?
        </h2>
        <p className="mx-auto mb-8 text-white/80" style={{ maxWidth: "42rem" }}>
          Join our community of sellers and reach thousands of bidders. Create
          your first listing today and share your products with the world.
        </p>
        <Link to="/register">
          <Button
            size="lg"
            className="bg-white hover:bg-white/90"
            style={{ color: "#047857" }}
          >
            Become a Seller
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <section className="bg-linear-to-r from-teal-500 to-emerald-400 py-20 dark:from-emerald-800 dark:to-emerald-600">
      {renderContent()}
    </section>
  );
}
