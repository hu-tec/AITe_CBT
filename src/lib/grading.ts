import { prisma } from "@/lib/prisma";

type Option = { label: string; text: string; isCorrect: boolean };

export type GradeResult = {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  categoryScores: Record<string, { correct: number; total: number; points: number; earnedPoints: number }>;
};

export async function gradeAttempt(attemptId: string): Promise<GradeResult> {
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

  if (!attempt) throw new Error("Attempt not found");

  let totalScore = 0;
  let totalPoints = 0;
  const categoryScores: GradeResult["categoryScores"] = {};

  for (const response of attempt.responses) {
    const question = response.question;
    const catName = question.category.name;

    if (!categoryScores[catName]) {
      categoryScores[catName] = { correct: 0, total: 0, points: 0, earnedPoints: 0 };
    }
    categoryScores[catName].total += 1;
    categoryScores[catName].points += question.points;
    totalPoints += question.points;

    let isCorrect = false;

    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE": {
        const options = question.options as Option[];
        const correctLabel = options?.find((o) => o.isCorrect)?.label;
        isCorrect = response.answer === correctLabel;
        break;
      }
      case "MULTIPLE_SELECT": {
        const options = question.options as Option[];
        const correctLabels = options
          ?.filter((o) => o.isCorrect)
          .map((o) => o.label)
          .sort()
          .join(",");
        const answerLabels = response.answer
          .split(",")
          .map((s) => s.trim())
          .sort()
          .join(",");
        isCorrect = correctLabels === answerLabels;
        break;
      }
      case "SHORT_ANSWER": {
        isCorrect =
          response.answer.trim().toLowerCase() ===
          (question.answer ?? "").trim().toLowerCase();
        break;
      }
    }

    const earnedPoints = isCorrect ? question.points : 0;
    totalScore += earnedPoints;

    if (isCorrect) {
      categoryScores[catName].correct += 1;
      categoryScores[catName].earnedPoints += question.points;
    }

    await prisma.response.update({
      where: { id: response.id },
      data: { isCorrect, earnedPoints },
    });

    // 오답 → StudyRecord 자동 생성
    if (!isCorrect) {
      await prisma.studyRecord.upsert({
        where: {
          userId_questionId: {
            userId: attempt.userId,
            questionId: question.id,
          },
        },
        update: {},
        create: {
          userId: attempt.userId,
          questionId: question.id,
        },
      });
    }
  }

  const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
  const passed = percentage >= attempt.exam.passingScore;

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      score: totalScore,
      totalPoints,
      passed,
      status: "GRADED",
      submittedAt: new Date(),
    },
  });

  // work_studio로 결과 전송
  const wsUrl = process.env.WORK_STUDIO_URL || "http://localhost:3000";
  const user = await prisma.user.findUnique({ where: { id: attempt.userId } });
  try {
    await fetch(`${wsUrl}/api/cbt_results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user?.name ?? "",
        email: user?.email ?? "",
        examTitle: attempt.exam.title,
        examMode: attempt.exam.mode,
        score: totalScore,
        totalPoints,
        percentage,
        passed,
        categoryScores,
        submittedAt: new Date().toISOString(),
      }),
    });
  } catch {
    // work_studio 전송 실패해도 채점 결과는 유지
  }

  return { score: totalScore, totalPoints, percentage, passed, categoryScores };
}
