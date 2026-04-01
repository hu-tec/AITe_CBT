"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireStudent() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function getWrongAnswers() {
  const session = await requireStudent();

  const records = await prisma.studyRecord.findMany({
    where: { userId: session.user.id },
    include: {
      question: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 각 문제에 대해 최근 응답 가져오기
  const enriched = await Promise.all(
    records.map(async (r) => {
      const lastResponse = await prisma.response.findFirst({
        where: {
          questionId: r.questionId,
          attempt: { userId: session.user.id },
        },
        orderBy: { attempt: { startedAt: "desc" } },
      });

      return {
        id: r.id,
        questionId: r.questionId,
        mastered: r.mastered,
        reviewCount: r.reviewCount,
        lastReviewedAt: r.lastReviewedAt,
        question: r.question,
        lastAnswer: lastResponse?.answer ?? null,
      };
    })
  );

  return enriched;
}

export async function markMastered(questionId: string) {
  const session = await requireStudent();

  await prisma.studyRecord.update({
    where: {
      userId_questionId: {
        userId: session.user.id,
        questionId,
      },
    },
    data: {
      mastered: true,
      reviewCount: { increment: 1 },
      lastReviewedAt: new Date(),
    },
  });

  revalidatePath("/student/study");
}

export async function markReviewed(questionId: string) {
  const session = await requireStudent();

  await prisma.studyRecord.update({
    where: {
      userId_questionId: {
        userId: session.user.id,
        questionId,
      },
    },
    data: {
      reviewCount: { increment: 1 },
      lastReviewedAt: new Date(),
    },
  });

  revalidatePath("/student/study");
}

export async function getStudyStats() {
  const session = await requireStudent();

  const records = await prisma.studyRecord.findMany({
    where: { userId: session.user.id },
    include: {
      question: {
        include: { category: true },
      },
    },
  });

  const totalWrong = records.length;
  const mastered = records.filter((r) => r.mastered).length;

  const byCategory: Record<string, { total: number; mastered: number }> = {};
  for (const r of records) {
    const cat = r.question.category.name;
    if (!byCategory[cat]) byCategory[cat] = { total: 0, mastered: 0 };
    byCategory[cat].total += 1;
    if (r.mastered) byCategory[cat].mastered += 1;
  }

  return { totalWrong, mastered, byCategory };
}
