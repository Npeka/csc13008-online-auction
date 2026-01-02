import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { productsApi } from "@/lib";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // API supports status filter 'active' | 'ended'
      // If 'all', we might need to fetch both or API handles it.
      // Assuming API handles no param as all.
      const statusParam = filter === "all" ? undefined : filter;
      const data = await productsApi.getMyProducts(statusParam);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: "active" | "sold" | "ended") => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success hover:bg-success/20";
      case "sold":
        return "bg-primary/10 text-primary hover:bg-primary/20";
      case "ended":
        return "bg-text-muted/10 text-text-muted hover:bg-text-muted/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">My Products</h1>
          <p className="mt-1 text-text-secondary">
            Manage your auction listings
          </p>
        </div>
        <Link to="/seller/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Listing
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search products..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filter === "ended" ? "default" : "outline"}
            onClick={() => setFilter("ended")}
            size="sm"
          >
            Ended
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-text-muted">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <FileText className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="mb-4 text-text-secondary">
              You haven't listed any products yet.
            </p>
            <Link to="/seller/products/new">
              <Button>Create your first listing</Button>
            </Link>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ending</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                          <img
                            src={
                              typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0]?.url
                            }
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium hover:underline">
                            <Link to={`/products/${product.slug}`}>
                              {product.title}
                            </Link>
                          </div>
                          <div className="text-xs text-text-muted">
                            Added{" "}
                            {new Date(product.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(product.currentPrice)}
                      </div>
                      {product.buyNowPrice && (
                        <div className="text-xs text-text-muted">
                          Buy Now: {formatCurrency(product.buyNowPrice)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.bidCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(product.status as any)}
                      >
                        {product.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-text-secondary">
                        {new Date(product.endTime) < new Date()
                          ? "Ended"
                          : formatDistanceToNow(new Date(product.endTime), {
                              addSuffix: true,
                            })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/products/${product.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Detail
                            </Link>
                          </DropdownMenuItem>
                          {product.status === "ACTIVE" && (
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/seller/products/${product.id}/append`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Append Description
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
