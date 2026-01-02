import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-linear-to-r from-teal-500 to-emerald-400 py-20 dark:from-emerald-800 dark:to-emerald-600">
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
    </section>
  );
}
