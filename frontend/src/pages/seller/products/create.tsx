import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productsApi } from "@/lib";
import { useCategoryStore } from "@/stores/category-store";
import { useAuthStore } from "@/stores/auth-store";
import { uploadImages } from "@/lib/upload";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Switch } from "@/components/ui/switch";
import { useSystemConfig } from "@/hooks/use-system-config";

// Helper to flatten categories for the select dropdown
const flattenCategories = (
  categories: Category[],
  level = 0,
): { id: string; name: string; disabled: boolean }[] => {
  let result: { id: string; name: string; disabled: boolean }[] = [];

  for (const cat of categories) {
    // Add current category
    // Disable if it has children (enforce selecting leaf nodes if desired, or allow all)
    // Usually in e-commerce, you select the specific sub-category.
    const hasChildren = cat.children && cat.children.length > 0;

    result.push({
      id: cat.id,
      name: `${"• ".repeat(level)}${cat.name}`,
      disabled: false, // Let's allow selecting any level for now, or true if strict
    });

    // Recursively add children
    if (hasChildren) {
      result = [...result, ...flattenCategories(cat.children!, level + 1)];
    }
  }
  return result;
};

export function CreateProductPage() {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const { user } = useAuthStore();
  const { config } = useSystemConfig();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    startPrice: "",
    bidStep: "",
    buyNowPrice: "",
    endTime: "",
    description: "",
    autoExtend: true,
    allowNewBidders: true, // Will sync with user setting
  });

  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sync allowNewBidders with user's default preference (user is already cached in auth store)
  useEffect(() => {
    if (user?.allowNewBidders !== undefined) {
      setFormData((prev) => ({
        ...prev,
        allowNewBidders: user.allowNewBidders ?? true,
      }));
    }
  }, [user?.allowNewBidders]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validate max files (let's say 5 max for now, requirement said multiple)
      if (imageFiles.length + newFiles.length > 5) {
        toast.error("You can upload a maximum of 5 images");
        return;
      }

      setImageFiles((prev) => [...prev, ...newFiles]);

      // Generate previews
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      // Revoke URL to prevent memory leak
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";

    if (!formData.startPrice || Number(formData.startPrice) <= 0)
      newErrors.startPrice = "Start price must be greater than 0";

    if (!formData.bidStep || Number(formData.bidStep) <= 0)
      newErrors.bidStep = "Bid step must be greater than 0";

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    } else if (new Date(formData.endTime) <= new Date()) {
      newErrors.endTime = "End time must be in the future";
    }

    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (imageFiles.length < 3) {
      newErrors.images = "At least 3 images are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload Images
      setIsUploading(true);
      const imageUrls = await uploadImages(imageFiles);
      setIsUploading(false);

      // 2. Create Product
      await productsApi.createProduct({
        title: formData.title,
        categoryId: formData.categoryId,
        description: formData.description,
        images: imageUrls,
        startPrice: Number(formData.startPrice),
        bidStep: Number(formData.bidStep),
        buyNowPrice: formData.buyNowPrice
          ? Number(formData.buyNowPrice)
          : undefined,
        endTime: new Date(formData.endTime).toISOString(),
        autoExtend: formData.autoExtend,
        allowNewBidders: formData.allowNewBidders,
      });

      toast.success("Product created successfully!");
      navigate("/seller/products");
    } catch (error: any) {
      console.error("Create product error:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="container-app max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/seller/products">
          <Button variant="ghost" size="icon" className="hover:bg-bg-card">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text">Create New Product</h1>
          <p className="text-text-secondary">
            Fill in the details for your auction
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="space-y-6 lg:col-span-2">
          <form
            id="create-product-form"
            onSubmit={handleSubmit}
            className="space-y-8 rounded-xl border border-border bg-bg-card p-6 shadow-sm md:p-8"
          >
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                Basic Information
              </h2>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Vintage Camera Lens"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={cn(
                      errors.title && "border-error focus-visible:ring-error",
                    )}
                  />
                  {errors.title && (
                    <p className="text-xs text-error">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "bg-bg-card",
                        errors.categoryId && "border-error focus:ring-error",
                      )}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] border-border bg-bg-card shadow-lg">
                      {flattenCategories(categories).map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id}
                          disabled={cat.disabled}
                          className="cursor-pointer hover:bg-bg-secondary focus:bg-bg-secondary"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-xs text-error">{errors.categoryId}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  2
                </span>
                Pricing & Duration
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startPrice">Start Price ($) *</Label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
                      $
                    </span>
                    <Input
                      id="startPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={cn(
                        "pl-7",
                        errors.startPrice &&
                          "border-error focus-visible:ring-error",
                      )}
                      value={formData.startPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, startPrice: e.target.value })
                      }
                    />
                  </div>
                  {errors.startPrice && (
                    <p className="text-xs text-error">{errors.startPrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bidStep">Bid Step ($) *</Label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
                      $
                    </span>
                    <Input
                      id="bidStep"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1.00"
                      className={cn(
                        "pl-7",
                        errors.bidStep &&
                          "border-error focus-visible:ring-error",
                      )}
                      value={formData.bidStep}
                      onChange={(e) =>
                        setFormData({ ...formData, bidStep: e.target.value })
                      }
                    />
                  </div>
                  {errors.bidStep && (
                    <p className="text-xs text-error">{errors.bidStep}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyNowPrice">Buy Now Price ($)</Label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
                      $
                    </span>
                    <Input
                      id="buyNowPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      className="pl-7"
                      value={formData.buyNowPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyNowPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-text-muted">
                    Optional instant buy price
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className={cn(
                      errors.endTime && "border-error focus-visible:ring-error",
                    )}
                  />
                  {errors.endTime && (
                    <p className="text-xs text-error">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Description */}
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  3
                </span>
                Description
              </h2>
              <div className="space-y-2">
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value })
                  }
                  className={cn(
                    "bg-bg",
                    errors.description ? "rounded-md border border-error" : "",
                  )}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "clean"],
                    ],
                  }}
                />
                {errors.description && (
                  <p className="text-xs text-error">{errors.description}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Auction Settings, Images & Actions */}
        <div className="space-y-6">
          {/* Auction Settings */}
          <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                4
              </span>
              Auction Settings
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-sm font-medium">Auto-extend</Label>
                  <p className="text-xs text-text-muted">
                    Extend auction by {config.extensionDuration} minutes if a
                    bid is placed in the last {config.extensionTriggerTime}{" "}
                    minutes
                  </p>
                </div>
                <Switch
                  checked={formData.autoExtend}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoExtend: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-sm font-medium">
                    Allow new bidders
                  </Label>
                  <p className="text-xs text-text-muted">
                    Allow bidders without ratings to bid on this product
                  </p>
                </div>
                <Switch
                  checked={formData.allowNewBidders}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowNewBidders: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                5
              </span>
              Images
            </h2>

            <div className="space-y-4">
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-bg-secondary/50 p-8 transition-colors hover:bg-bg-secondary",
                  errors.images && "border-error/50 bg-error/5",
                )}
              >
                <Upload className="h-8 w-8 text-text-muted" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-text-muted">JPG, PNG up to 5MB</p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Preview Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((url, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-md border border-border"
                    >
                      <img
                        src={url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="text-xs text-error">{errors.images}</p>
              )}

              <p className="text-xs text-text-muted">
                Upload at least 3 images to showcase your product effectively.
              </p>
            </div>
          </div>

          {/* Sticky Actions (Mobile friendly) */}
          <div className="sticky top-20 lg:top-34">
            <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Ready to post?</h3>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    const form = document.getElementById(
                      "create-product-form",
                    ) as HTMLFormElement | null;
                    form?.requestSubmit();
                  }}
                  disabled={isLoading || isUploading}
                  className="w-full"
                >
                  {isLoading || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading
                        ? "Uploading Images..."
                        : "Creating Product..."}
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
                <Link to="/seller/products">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-center text-xs text-text-muted">
                By posting, you agree to our terms of service and auction rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
