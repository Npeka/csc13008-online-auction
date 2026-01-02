import { useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, ExternalLink, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  category: string;
  seller: string;
  status: "ACTIVE" | "ENDED" | "CANCELLED";
  currentPrice: number;
  endTime: string;
}

export function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      title: "iPhone 15 Pro Max",
      category: "Electronics",
      seller: "John Doe",
      status: "ACTIVE",
      currentPrice: 1200,
      endTime: "2026-01-05T10:00:00Z",
    },
    {
      id: "2",
      title: "Gaming Laptop RTX 4090",
      category: "Electronics",
      seller: "Jane Smith",
      status: "ACTIVE",
      currentPrice: 2500,
      endTime: "2026-01-06T14:30:00Z",
    },
  ]);

  const handleRemoveProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to remove "${product.title}"?`)) {
      // TODO: Call API to remove product
      setProducts(products.filter((p) => p.id !== product.id));
      toast.success("Product removed successfully");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-border bg-bg-card py-3 pr-4 pl-10 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Product
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Seller
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-text">
                Current Price
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-text">
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
                  <p className="font-medium text-text">{product.title}</p>
                  <p className="text-xs text-text-muted">ID: {product.id}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text-muted">{product.category}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text">{product.seller}</p>
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
                    ${product.currentPrice.toLocaleString()}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="rounded-lg p-2 text-primary transition-colors hover:bg-primary-light"
                      title="View product"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(product)}
                      className="rounded-lg p-2 text-error transition-colors hover:bg-error-light"
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
      </div>

      {filteredProducts.length === 0 && (
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
    </div>
  );
}
