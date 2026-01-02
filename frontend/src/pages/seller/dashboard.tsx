import { Link } from "react-router";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Plus,
} from "lucide-react";

export function SellerDashboard() {
  const { user } = useAuthStore();

  if (user?.role !== "SELLER") {
    return (
      <div className="container-app py-12 text-center">
        <h1 className="text-2xl font-bold">Seller Access Required</h1>
        <p className="mt-2 text-text-secondary">
          You need to be a registered seller to view this dashboard.
        </p>
        <div className="mt-6">
          <Link to="/register">
            <Button>Register as Seller</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Seller Dashboard</h1>
          <p className="mt-1 text-text-secondary">
            Welcome back, {user?.name || "Seller"}! Here's your overview.
          </p>
        </div>
        <Link to="/seller/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Listing
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-text-muted">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Listings
            </CardTitle>
            <Package className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-text-muted">+2 new since yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
            <ShoppingBag className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-text-muted">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-text-muted">Based on 92 ratings</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Recent Activity/Listings */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Your Active Listings</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-text-muted">
            List of products will appear here...
          </p>
        </div>
      </div>
    </div>
  );
}
