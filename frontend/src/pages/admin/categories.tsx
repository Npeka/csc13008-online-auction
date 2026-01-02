import { useState } from "react";
import toast from "react-hot-toast";
import { Edit, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export function CategoriesManagement() {
  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Electronics",
      description: "Electronic devices and gadgets",
      productCount: 145,
    },
    {
      id: "2",
      name: "Fashion",
      description: "Clothing and accessories",
      productCount: 89,
    },
    {
      id: "3",
      name: "Home & Garden",
      description: "Home improvement and garden items",
      productCount: 67,
    },
  ]);

  const [_isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = (category: Category) => {
    if (category.productCount > 0) {
      toast.error(
        `Cannot delete "${category.name}" - it has ${category.productCount} products!`,
      );
      return;
    }

    // TODO: Call API to delete
    toast.success(`Category "${category.name}" deleted successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">
            Categories Management
          </h1>
          <p className="mt-2 text-text-muted">Manage auction categories</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Description
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-text">
                Products
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-text">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="transition-colors hover:bg-bg-secondary"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-text">{category.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text-muted">
                    {category.description}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
                    <Package className="h-3.5 w-3.5" />
                    {category.productCount}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="rounded-lg p-2 text-primary transition-colors hover:bg-primary-light"
                      title="Edit category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={category.productCount > 0}
                      className="rounded-lg p-2 text-error transition-colors hover:bg-error-light disabled:cursor-not-allowed disabled:opacity-50"
                      title={
                        category.productCount > 0
                          ? "Cannot delete - has products"
                          : "Delete category"
                      }
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

      {categories.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-text-muted" />
          <h3 className="mt-4 text-lg font-semibold text-text">
            No categories yet
          </h3>
          <p className="mt-2 text-text-muted">
            Get started by creating your first category
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
}
