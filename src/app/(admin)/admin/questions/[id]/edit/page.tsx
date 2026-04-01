import { notFound } from "next/navigation";
import { getQuestion } from "@/app/actions/questions";
import { getAllCategories } from "@/app/actions/categories";
import { QuestionForm } from "@/components/admin/question-form";

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [question, categories] = await Promise.all([
    getQuestion(id),
    getAllCategories(),
  ]);

  if (!question) notFound();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">문제 수정</h2>
      <QuestionForm
        categories={categories}
        question={{
          ...question,
          options: question.options as { label: string; text: string; isCorrect: boolean }[] | null,
        }}
      />
    </div>
  );
}
