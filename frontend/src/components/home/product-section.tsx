import { Link } from "react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { ProductGrid } from "@/components/cards/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  products: Product[];
  viewAllLink: string;
  backgroundColor?: string;
}

export function ProductSection({
  title,
  Icon,
  iconColor,
  iconBgColor,
  products,
  viewAllLink,
  backgroundColor,
}: ProductSectionProps) {
  const Container = backgroundColor ? "section" : "div";
  const containerClasses = backgroundColor
    ? `${backgroundColor} py-16`
    : "container-app py-16";

  const content = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-lg p-2", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <h2 className="text-2xl font-bold text-text">{title}</h2>
        </div>
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductGrid products={products} columns={4} />
    </>
  );

  if (backgroundColor) {
    return (
      <Container className={containerClasses}>
        <div className="container-app">{content}</div>
      </Container>
    );
  }

  return <section className={containerClasses}>{content}</section>;
}
