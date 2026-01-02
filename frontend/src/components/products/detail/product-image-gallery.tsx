import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
  status: string;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ProductImageGallery = memo(function ProductImageGallery({
  images,
  title,
  status,
  selectedIndex,
  onSelectIndex,
  onNext,
  onPrev,
}: ProductImageGalleryProps) {
  return (
    <div>
      {/* Main Image */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-bg-secondary">
        <img
          src={images[selectedIndex]}
          alt={title}
          className="h-full w-full object-cover"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {status === "ACTIVE" && <Badge variant="success">Active</Badge>}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              className={cn(
                "h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                index === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
