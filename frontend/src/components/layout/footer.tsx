import { Link } from "react-router";
import { Facebook, Instagram, Mail, Twitter, Youtube } from "lucide-react";
import logoImage from "@/assets/logo.avif";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    marketplace: [
      { label: "Browse All", href: "/search" },
      { label: "Categories", href: "/category/electronics" },
      { label: "Ending Soon", href: "/search?sort=ending_asc" },
      { label: "New Listings", href: "/search?sort=newest" },
    ],
    account: [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "My Profile", href: "/profile" },
      { label: "My Bids", href: "/profile/bids" },
      { label: "Watchlist", href: "/profile/watchlist" },
    ],
    seller: [
      { label: "Start Selling", href: "/seller/create" },
      { label: "Seller Dashboard", href: "/seller/dashboard" },
      { label: "My Listings", href: "/seller/listings" },
      { label: "Sold Items", href: "/seller/sold" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border bg-bg-card">
      <div className="container-app pt-16 pb-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center">
              <div className="size-10">
                <img src={logoImage} alt="logo" />
              </div>
              <span className="text-xl font-bold text-text">Morphee</span>
            </Link>
            <p className="mb-6 text-sm text-text-muted">
              The premier marketplace for reptile enthusiasts. Buy and sell
              quality reptiles with confidence.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text">
                Subscribe to our newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm",
                    "border border-border bg-bg-secondary",
                    "text-text placeholder:text-text-muted",
                    "focus:border-primary focus:outline-none",
                  )}
                />
                <button className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="mb-4 font-semibold text-text">Marketplace</h4>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="mb-4 font-semibold text-text">Account</h4>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div>
            <h4 className="mb-4 font-semibold text-text">Sellers</h4>
            <ul className="space-y-2">
              {footerLinks.seller.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-4 font-semibold text-text">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-text-muted">
            © {currentYear} Morphee. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-primary"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-primary"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-primary"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
