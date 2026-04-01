import { notFound } from "next/navigation";
import { getExam } from "@/app/actions/exams";
import { prisma } from "@/lib/prisma";
import { ExamBuilder } from "@/components/admin/exam-builder";

export const dynamic = "force-dynamic";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exam, allQuestions] = await Promise.all([
    getExam(id),
    prisma.question.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!exam) notFound();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">시험 수정</h2>
      <ExamBuilder
        allQuestions={allQuestions}
        exam={{
          ...exam,
          items: exam.items.map((i) => ({ questionId: i.questionId })),
        }}
      />
    </div>
  );
}
