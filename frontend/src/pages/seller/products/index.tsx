import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Edit,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeRequestModal } from "@/components/shared/upgrade-request-modal";
import { productsApi, usersApi } from "@/lib";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { ProductListResponse } from "@/lib/products-api";

export function SellerProductsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Check if user can create products (active seller, not expired)
  const canCreateProducts =
    user?.role === "SELLER" &&
    (!user.sellerExpiresAt || new Date(user.sellerExpiresAt) > new Date());

  const handleUpgradeRequest = async (reason: string) => {
    try {
      await usersApi.createUpgradeRequest(reason);
      toast.success("Upgrade request submitted successfully!");
      setTimeout(() => {
        setIsUpgradeModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit upgrade request:", error);
      throw error;
    }
  };

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["my-products", { page, limit, filter }],
    queryFn: async () => {
      const statusParam = filter === "all" ? undefined : filter;
      const result = await productsApi.getMyProducts(statusParam, page, limit);
      return result as ProductListResponse;
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.products || [];
  const totalProducts = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // Filter products by search query (client-side for now)
  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-success/10 text-success hover:bg-success/20";
      case "ended":
        return "bg-text-muted/10 text-text-muted hover:bg-text-muted/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="container-app py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">My Products</h1>
          <p className="mt-1 text-text-muted">
            {canCreateProducts
              ? "Manage your auction products"
              : "View your auction history"}
          </p>
        </div>
        {canCreateProducts && (
          <Link to="/seller/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Product
            </Button>
          </Link>
        )}
      </div>

      {/* Info Banner for Ex-Sellers */}
      {!canCreateProducts && products.length > 0 && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-text">
            <strong>Note:</strong> Your seller privileges have expired, but you
            can still view and manage your existing products.
            {user?.role === "BIDDER" &&
              " Request an upgrade to create new products."}
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-border bg-bg-card py-2.5 pr-4 pl-10 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-card p-1">
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter("active");
              setPage(1);
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === "active"
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setFilter("ended");
              setPage(1);
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === "ended"
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            Ended
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg-card">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-card/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-bg-secondary p-4">
              <FileText className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text">
              No products found
            </h3>
            <p className="mb-4 text-text-muted">
              {searchQuery
                ? "Try adjusting your search query"
                : canCreateProducts
                  ? "You haven't listed any products yet."
                  : "You don't have any products. Become a seller to start creating auctions!"}
            </p>
            {canCreateProducts && !searchQuery ? (
              <Link to="/seller/products/new">
                <Button>Create your first product</Button>
              </Link>
            ) : (
              !canCreateProducts &&
              !searchQuery &&
              user?.role === "BIDDER" && (
                <Button onClick={() => setIsUpgradeModalOpen(true)}>
                  Become a seller
                </Button>
              )
            )}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="border-b border-border bg-bg-tertiary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                    Current Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                    Bids
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                    Ending
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-bg-secondary"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg-secondary">
                          {product.images?.[0] && (
                            <img
                              src={
                                typeof product.images[0] === "string"
                                  ? product.images[0]
                                  : product.images[0]?.url
                              }
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/products/${product.slug}`}
                            className="font-medium text-text hover:text-primary hover:underline"
                          >
                            {product.title}
                          </Link>
                          <div className="text-xs text-text-muted">
                            Added{" "}
                            {new Date(product.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text">
                        {formatCurrency(product.currentPrice)}
                      </div>
                      {product.buyNowPrice && (
                        <div className="text-xs text-text-muted">
                          Buy Now: {formatCurrency(product.buyNowPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text">{product.bidCount}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(product.status)}
                      >
                        {product.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-muted">
                        {new Date(product.endTime) < new Date()
                          ? "Ended"
                          : formatDistanceToNow(new Date(product.endTime), {
                              addSuffix: true,
                            })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-primary"
                          title="View product"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {product.status === "ACTIVE" && (
                          <Link
                            to={`/seller/products/${product.id}/append`}
                            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-primary"
                            title="Append description"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {(product.status as any) === "SOLD" && (
                          <Link
                            to={`/orders/${product.id}`}
                            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-primary"
                            title="View order"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Pagination */}
            {products.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-text-muted">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, totalProducts)}
                  </span>{" "}
                  of <span className="font-medium">{totalProducts}</span>{" "}
                  products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-sm text-text-muted">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upgrade Request Modal */}
      <UpgradeRequestModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSubmit={handleUpgradeRequest}
      />
    </div>
  );
}
