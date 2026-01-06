import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link"],
    ["clean"],
  ],
};

export function AppendDescriptionPage() {
  const { id } = useParams<{ id: string }>();
  const [currentDescription, setCurrentDescription] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [productTitle, setProductTitle] = useState("");

  // Fetch product details to show current description
  const fetchProduct = async () => {
    if (!id) return;
    setIsFetching(true);
    try {
      const product = await productsApi.getProductById(id);
      setCurrentDescription(product.description || "");
      setProductTitle(product.title || "");
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error("Failed to load product details");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || newDescription === "<p><br></p>") {
      toast.error("Description cannot be empty");
      return;
    }

    if (!id) return;

    setIsLoading(true);
    try {
      await productsApi.appendDescription(id, newDescription);
      toast.success("Description appended successfully!");

      // Reset the input
      setNewDescription("");

      // Refetch the product to get the updated description
      await fetchProduct();
    } catch (error: any) {
      console.error("Append description error:", error);
      toast.error(
        error.response?.data?.message || "Failed to append description",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container-app max-w-4xl py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app max-w-4xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/seller/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Append Description</h1>
          <p className="text-text-muted">
            {productTitle || "Add new information to your product"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Description - Read Only */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Current Description
          </h2>
          <div
            className="prose prose-slate dark:prose-invert max-w-none rounded-lg border border-border bg-bg-secondary p-4"
            dangerouslySetInnerHTML={{ __html: currentDescription }}
          />
        </div>

        {/* Append New Description Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-bg-card p-6"
        >
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-text">
            <p>
              <strong>Note:</strong> You cannot edit the original description.
              Any text you add here will be appended to the bottom of the
              existing description with the current timestamp.
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-text">
              Additional Information
            </label>
            <div className="rounded-lg border border-border bg-bg-card">
              <ReactQuill
                theme="snow"
                value={newDescription}
                onChange={setNewDescription}
                modules={quillModules}
                placeholder="Enter additional information..."
                className="bg-bg-card"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/seller/products">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Append Description"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
