import { useState } from "react";
import toast from "react-hot-toast";
import { Link,useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib";

// Simple container page for appending description
export function AppendDescriptionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Description cannot be empty");
      return;
    }

    if (!id) return;

    setIsLoading(true);
    try {
      await productsApi.appendDescription(id, description);
      toast.success("Description appended successfully!");
      navigate("/seller/products");
    } catch (error: any) {
      console.error("Append description error:", error);
      toast.error(
        error.response?.data?.message || "Failed to append description",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-app max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/seller/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Append Description</h1>
          <p className="text-text-secondary">
            Add new information to your listing (appended with timestamp)
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-bg-card p-6"
      >
        <div className="mb-4 rounded-md bg-secondary/50 p-4 text-sm text-text-secondary">
          <p>
            <strong>Note:</strong> You cannot edit the original description. Any
            text you add here will be appended to the bottom of the existing
            description with the current timestamp.
          </p>
        </div>

        <div className="mb-6">
          <textarea
            className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[200px] w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter additional information..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
  );
}
