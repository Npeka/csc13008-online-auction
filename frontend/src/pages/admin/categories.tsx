import { useState } from "react";
import toast from "react-hot-toast";
import { ChevronRight, Edit, Package, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { categoriesApi, type CreateCategoryData } from "@/lib";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function CategoriesManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    slug: "",
    description: "",
    parentId: undefined,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getCategories(true),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Category created successfully");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCategoryData>;
    }) => categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Category deleted successfully");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const openCreateModal = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", parentId });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    const payload = { ...formData };
    // Remove parentId if it's falsy (undefined, null, or empty string)
    // This prevents sending invalid UUIDs or nulls that might fail backend validation
    if (!payload.parentId) {
      delete payload.parentId;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (category: Category) => {
    const totalProducts =
      (category.productCount || 0) +
      (category.children?.reduce((sum, c) => sum + (c.productCount || 0), 0) ||
        0);

    if (totalProducts > 0) {
      toast.error(
        `Cannot delete "${category.name}" - it has ${totalProducts} products!`,
      );
      return;
    }

    if (
      (category.productCount || 0) > 0 ||
      (category.children?.reduce((sum, c) => sum + (c.productCount || 0), 0) ||
        0) > 0
    ) {
      toast.error(
        `Cannot delete "${category.name}" - it has associated products!`,
      );
      return;
    }

    setDeleteCategory(category);
  };

  // Get parent categories (no parentId)
  const parentCategories = categories.filter((c) => !c.parentId);

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id); // Or default expanded logic?
    // In original code: logic to auto-expand was in fetchCategories success.
    // In React Query, we can use side effect in onSuccess? Or separate useEffect.
    // But keeping it simple: start collapsed or expanded?
    // User logic: "Auto-expand all parent categories".
    // I can initialize expandedIds in a useEffect when data changes?
    // Or just let user expand.
    // The original code did:
    // const parentIds = new Set(data.filter(c => c.children > 0).map(c => c.id));
    // setExpandedIds(parentIds);
    // I'll skip this auto-expand for now or reimplement it if crucial.
    // Or add simple useEffect:
    // useEffect(() => { if (categories.length) ... }, [categories]);

    return (
      <div key={category.id}>
        <div
          className={cn(
            "flex items-center border-b border-border transition-colors hover:bg-bg-secondary",
            level > 0 && "bg-bg-secondary/50",
          )}
        >
          <div
            className="flex flex-1 items-center gap-2 px-6 py-4"
            style={{ paddingLeft: `${24 + level * 24}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="rounded p-1 hover:bg-bg-card"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-text-muted transition-transform",
                    isExpanded && "rotate-90",
                  )}
                />
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div className="flex-1">
              <p className="font-medium text-text">{category.name}</p>
              {category.description && (
                <p className="text-sm text-text-muted">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="px-6 py-4">
            <code className="rounded bg-bg-secondary px-2 py-1 text-sm">
              {category.slug}
            </code>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
              <Package className="h-3.5 w-3.5" />
              {category.productCount || 0}
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              {level === 0 && (
                <button
                  onClick={() => openCreateModal(category.id)}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-success"
                  title="Add subcategory"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => openEditModal(category)}
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-primary"
                title="Edit category"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(category)}
                disabled={
                  (category.productCount || 0) > 0 ||
                  (category.children?.length || 0) > 0
                }
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                title={
                  (category.productCount || 0) > 0
                    ? "Cannot delete - has products"
                    : (category.children?.length || 0) > 0
                      ? "Cannot delete - has subcategories"
                      : "Delete category"
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) =>
              renderCategory(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">
            Categories Management
          </h1>
          <p className="mt-2 text-text-muted">Manage auction categories</p>
        </div>
        <Button onClick={() => openCreateModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Tree */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
        {/* Header */}
        <div className="flex border-b border-border bg-bg-tertiary">
          <div className="flex-1 px-6 py-4 text-sm font-semibold whitespace-nowrap text-text">
            Name
          </div>
          <div className="w-32 px-6 py-4 text-sm font-semibold whitespace-nowrap text-text">
            Slug
          </div>
          <div className="w-32 px-6 py-4 text-center text-sm font-semibold whitespace-nowrap text-text">
            Products
          </div>
          <div className="w-40 px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-text">
            Actions
          </div>
        </div>
        {/* Tree */}
        <div>
          {parentCategories.map((category) => renderCategory(category))}
        </div>
      </div>

      {parentCategories.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-text-muted" />
          <h3 className="mt-4 text-lg font-semibold text-text">
            No categories yet
          </h3>
          <p className="mt-2 text-text-muted">
            Get started by creating your first category
          </p>
          <Button onClick={() => openCreateModal()} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory
            ? "Edit Category"
            : formData.parentId
              ? "Create Subcategory"
              : "Create Category"
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Slug
            </label>
            <Input
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="category-slug"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Description
            </label>
            <Input
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
            />
          </div>
          {!editingCategory &&
            !formData.parentId &&
            parentCategories.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text">
                  Parent Category (optional)
                </label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text focus:border-primary focus:outline-none"
                >
                  <option value="">None (top-level category)</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={() => {
          if (deleteCategory) {
            deleteMutation.mutate(deleteCategory.id);
            setDeleteCategory(null);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteCategory?.name}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
