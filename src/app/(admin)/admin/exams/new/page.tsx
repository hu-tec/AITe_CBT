import { prisma } from "@/lib/prisma";
import { ExamBuilder } from "@/components/admin/exam-builder";

export const dynamic = "force-dynamic";

export default async function NewExamPage() {
  const questions = await prisma.question.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">시험 생성</h2>
      <ExamBuilder allQuestions={questions} />
    </div>
  );
}
