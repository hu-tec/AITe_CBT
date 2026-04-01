import { getAllCategories } from "@/app/actions/categories";
import { QuestionForm } from "@/components/admin/question-form";

export const dynamic = "force-dynamic";

export default async function NewQuestionPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">문제 등록</h2>
      <QuestionForm categories={categories} />
    </div>
  );
}
