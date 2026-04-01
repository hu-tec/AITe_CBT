import { getCategories } from "@/app/actions/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">카테고리 관리</h2>
      <CategoryManager categories={categories} />
    </div>
  );
}
