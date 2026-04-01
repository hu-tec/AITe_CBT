"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shuffleExam } from "@/lib/question-shuffle";
import { gradeAttempt } from "@/lib/grading";
import { isTimeExpired } from "@/lib/timer";
import { redirect } from "next/navigation";

async function requireStudent() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function startAttempt(examId: string) {
  const session = await requireStudent();

  // 진행 중인 시험이 있으면 복원
  const existing = await prisma.attempt.findFirst({
    where: {
      userId: session.user.id,
      examId,
      status: "IN_PROGRESS",
    },
  });
  if (existing) {
    redirect(`/student/exams/${examId}/take?attemptId=${existing.id}`);
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      items: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!exam || !exam.isPublished) throw new Error("시험을 찾을 수 없습니다");

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      examId,
    },
  });

  redirect(`/student/exams/${examId}/take?attemptId=${attempt.id}`);
}

export async function getAttemptData(attemptId: string) {
  const session = await requireStudent();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          items: {
            include: { question: true },
            orderBy: { order: "asc" },
          },
        },
      },
      responses: true,
    },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    throw new Error("Not found");
  }

  // 시간 초과 체크
  if (
    attempt.status === "IN_PROGRESS" &&
    isTimeExpired(attempt.startedAt, attempt.exam.timeLimitMin)
  ) {
    await gradeAttempt(attempt.id);
    redirect(`/student/exams/${attempt.examId}/result?attemptId=${attempt.id}`);
  }

  const seed = `${attempt.id}-${attempt.examId}`;
  const questions = attempt.exam.items.map((item) => item.question);
  const shuffled = shuffleExam(
    questions,
    seed,
    attempt.exam.shuffleQuestions,
    attempt.exam.shuffleOptions
  );

  // 기존 응답 매핑
  const answers: Record<string, string> = {};
  const flagged: string[] = [];
  for (const r of attempt.responses) {
    answers[r.questionId] = r.answer;
    if (r.flagged) flagged.push(r.questionId);
  }

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
    },
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
      timeLimitMin: attempt.exam.timeLimitMin,
    },
    questions: shuffled.map((q) => ({
      id: q.id,
      type: q.type,
      content: q.content,
      options: q.options,
      order: q.order,
    })),
    answers,
    flagged,
  };
}

export async function submitAttempt(attemptId: string) {
  const session = await requireStudent();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    throw new Error("Not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("이미 제출된 시험입니다");
  }

  const result = await gradeAttempt(attemptId);
  return result;
}

export async function getPublishedExams() {
  const session = await requireStudent();

  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { items: true } },
      attempts: {
        where: { userId: session.user.id },
        select: { id: true, status: true, passed: true, score: true },
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return exams;
}

export async function getAttemptHistory() {
  const session = await requireStudent();

  return prisma.attempt.findMany({
    where: { userId: session.user.id },
    include: {
      exam: { select: { title: true, passingScore: true } },
    },
    orderBy: { startedAt: "desc" },
  });
}
