import { useEffect,useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Plus,X } from "lucide-react";
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

// Fallback if Textarea component doesn't exist yet
const TextAreaFallback = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => (
  <textarea
    className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

export function CreateProductPage() {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    startPrice: "",
    bidStep: "",
    buyNowPrice: "",
    endTime: "",
    description: "",
    images: ["", "", ""], // Start with 3 empty slots
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

    const validImages = formData.images.filter((url) => url.trim().length > 0);
    if (validImages.length < 3) {
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
      await productsApi.createProduct({
        title: formData.title,
        categoryId: formData.categoryId,
        description: formData.description,
        images: formData.images.filter((url) => url.trim()),
        startPrice: Number(formData.startPrice),
        bidStep: Number(formData.bidStep),
        buyNowPrice: formData.buyNowPrice
          ? Number(formData.buyNowPrice)
          : undefined,
        endTime: new Date(formData.endTime).toISOString(),
        autoExtend: true, // Default to true as per requirements
        allowNewBidders: true,
      });

      toast.success("Product created successfully!");
      navigate("/seller/products");
    } catch (error: any) {
      console.error("Create product error:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageSlot = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageSlot = (index: number) => {
    if (formData.images.length <= 3) return; // Maintain at least 3
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="container-app max-w-3xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/seller/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text">Create New Listing</h1>
          <p className="text-text-secondary">
            Fill in the details for your auction
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-border bg-bg-card p-6 md:p-8"
      >
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid gap-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Vintage Camera Lens"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={errors.title ? "border-error" : ""}
            />
            {errors.title && (
              <p className="text-xs text-error">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value: string) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger
                className={errors.categoryId ? "border-error" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
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

        {/* Pricing & Timing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pricing & Duration</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startPrice">Start Price ($) *</Label>
              <Input
                id="startPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.startPrice}
                onChange={(e) =>
                  setFormData({ ...formData, startPrice: e.target.value })
                }
                className={errors.startPrice ? "border-error" : ""}
              />
              {errors.startPrice && (
                <p className="text-xs text-error">{errors.startPrice}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bidStep">Bid Step ($) *</Label>
              <Input
                id="bidStep"
                type="number"
                min="0"
                step="0.01"
                placeholder="1.00"
                value={formData.bidStep}
                onChange={(e) =>
                  setFormData({ ...formData, bidStep: e.target.value })
                }
                className={errors.bidStep ? "border-error" : ""}
              />
              {errors.bidStep && (
                <p className="text-xs text-error">{errors.bidStep}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buyNowPrice">Buy Now Price ($) (Optional)</Label>
              <Input
                id="buyNowPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={formData.buyNowPrice}
                onChange={(e) =>
                  setFormData({ ...formData, buyNowPrice: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className={errors.endTime ? "border-error" : ""}
              />
              {errors.endTime && (
                <p className="text-xs text-error">{errors.endTime}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-text-muted">
            * Note: Auto-extend logic (10 mins extension if bid in last 5 mins)
            is enabled by default.
          </p>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Product Images</h2>
          <p className="text-sm text-text-muted">
            Provide direct URLs for product images. Minimum 3 images required.
          </p>

          {formData.images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Image URL #${index + 1}`}
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className={
                  errors.images && index < 3 && !url ? "border-error" : ""
                }
              />
              {formData.images.length > 3 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImageSlot(index)}
                  type="button"
                >
                  <X className="h-4 w-4 text-text-muted" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageSlot}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Another Image
          </Button>

          {errors.images && (
            <p className="text-xs text-error">{errors.images}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-sm text-text-muted">
            Provide a detailed description of the item. Markdown is supported.
          </p>
          <div className="grid gap-2">
            <TextAreaFallback
              rows={8}
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full rounded-md border bg-bg-secondary p-3 ${errors.description ? "border-error" : "border-input"}`}
            />
            {errors.description && (
              <p className="text-xs text-error">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
          <Link to="/seller/products">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
