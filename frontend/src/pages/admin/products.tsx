import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { productsApi } from "@/lib";
import { formatUSD } from "@/lib/utils";

export function ProductsManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal State
  const [deleteProduct, setDeleteProduct] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", { page, limit, search: searchQuery }],
    queryFn: () =>
      productsApi.getProducts({
        search: searchQuery || undefined,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const products = data?.products || [];
  const totalProducts = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1; // Fixed: accessing totalPages instead of pages

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Product removed successfully");
      setDeleteProduct(null);
    },
    onError: () => {
      toast.error("Failed to remove product");
    },
  });

  const handleDelete = () => {
    if (deleteProduct) {
      deleteMutation.mutate(deleteProduct.id);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Products Management</h1>
        <p className="mt-2 text-text-muted">
          View and manage all auction products
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="w-full rounded-xl border border-border bg-bg-card py-2.5 pr-4 pl-10 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg-card">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-card/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <table className="w-full">
          <thead className="border-b border-border bg-bg-tertiary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                Product
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                Seller
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-text">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-text">
                Current Price
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-text">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-bg-secondary"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg-secondary">
                      {product.images?.[0] ? (
                        <img
                          src={
                            typeof product.images[0] === "string"
                              ? product.images[0]
                              : product.images[0]?.url
                          }
                          alt={product.title || product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-muted">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="max-w-[150px] min-w-0 sm:max-w-[250px]">
                      <p
                        className="truncate font-medium text-text"
                        title={product.title || product.name}
                      >
                        {product.title || product.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        ID: {product.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text-muted">
                    {product.category?.name || "-"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text">
                    {product.seller?.name || "-"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      product.status === "ACTIVE"
                        ? "success"
                        : product.status === "ENDED"
                          ? "default"
                          : "error"
                    }
                  >
                    {product.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-text">
                    {formatUSD(product.currentPrice)}
                  </p>
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
                    <button
                      onClick={() =>
                        setDeleteProduct({
                          id: product.id,
                          title: product.title || product.name,
                        })
                      }
                      className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-error"
                      title="Remove product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
              <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * limit, totalProducts)}
              </span>{" "}
              of <span className="font-medium">{totalProducts}</span> products
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
      </div>

      {products.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-text-muted" />
          <h3 className="mt-4 text-lg font-semibold text-text">
            No products found
          </h3>
          <p className="mt-2 text-text-muted">
            {searchQuery
              ? "Try adjusting your search query"
              : "No products available at the moment"}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Remove Product"
        message={`Are you sure you want to remove "${deleteProduct?.title}"? This action cannot be undone.`}
        confirmText="Remove"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
