import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResultReport } from "@/components/report/result-report";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/student/exams");

  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      responses: {
        include: {
          question: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    redirect("/student/exams");
  }

  if (attempt.status === "IN_PROGRESS") {
    redirect(`/student/exams/${attempt.examId}/take?attemptId=${attemptId}`);
  }

  // 영역별 통계
  const categoryStats: Record<
    string,
    { correct: number; total: number; points: number; earnedPoints: number }
  > = {};

  for (const r of attempt.responses) {
    const catName = r.question.category.name;
    if (!categoryStats[catName]) {
      categoryStats[catName] = { correct: 0, total: 0, points: 0, earnedPoints: 0 };
    }
    categoryStats[catName].total += 1;
    categoryStats[catName].points += r.question.points;
    if (r.isCorrect) {
      categoryStats[catName].correct += 1;
      categoryStats[catName].earnedPoints += r.earnedPoints ?? 0;
    }
  }

  return (
    <ResultReport
      exam={attempt.exam}
      attempt={attempt}
      responses={attempt.responses.map((r) => ({
        id: r.id,
        questionId: r.questionId,
        answer: r.answer,
        isCorrect: r.isCorrect ?? false,
        earnedPoints: r.earnedPoints ?? 0,
        question: {
          content: r.question.content,
          type: r.question.type,
          options: r.question.options as { label: string; text: string; isCorrect: boolean }[] | null,
          answer: r.question.answer,
          explanation: r.question.explanation,
          points: r.question.points,
          categoryName: r.question.category.name,
        },
      }))}
      categoryStats={categoryStats}
    />
  );
}
