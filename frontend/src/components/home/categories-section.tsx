import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/cards/category-card";
import type { Category } from "@/types";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="container-app py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">Browse Categories</h2>
        <Link
          to="/products"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
