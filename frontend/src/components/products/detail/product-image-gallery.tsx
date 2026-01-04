import { memo, useState, useEffect } from "react";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(selectedIndex);

  // Handle smooth transition when selectedIndex changes
  useEffect(() => {
    if (selectedIndex !== displayIndex) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayIndex(selectedIndex);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, displayIndex]);

  return (
    <div>
      {/* Main Image with transition effects */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-bg-secondary">
        <div
          className={cn(
            "relative h-full w-full transition-all duration-300 ease-in-out",
            isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100",
          )}
        >
          <img
            src={images[displayIndex]}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all hover:scale-110 hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all hover:scale-110 hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {status === "ACTIVE" && <Badge variant="success">Active</Badge>}
        </div>

        {/* Image indicator dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => onSelectIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === selectedIndex
                    ? "w-4 bg-white"
                    : "bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails with active state */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              className={cn(
                "h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-70 hover:border-border hover:opacity-100",
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
