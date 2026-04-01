"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const examSchema = z.object({
  title: z.string().min(1, "시험명을 입력하세요"),
  description: z.string().optional(),
  mode: z.enum(["MOCK", "OFFICIAL"]),
  timeLimitMin: z.coerce.number().min(1),
  passingScore: z.coerce.number().min(0).max(100),
  shuffleQuestions: z.coerce.boolean(),
  shuffleOptions: z.coerce.boolean(),
  questionIds: z.string(),
});

export type ExamState = {
  error?: string;
  success?: boolean;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createExam(
  _prev: ExamState,
  formData: FormData
): Promise<ExamState> {
  await requireAdmin();

  const parsed = examSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    mode: formData.get("mode"),
    timeLimitMin: formData.get("timeLimitMin"),
    passingScore: formData.get("passingScore"),
    shuffleQuestions: formData.get("shuffleQuestions") === "true",
    shuffleOptions: formData.get("shuffleOptions") === "true",
    questionIds: formData.get("questionIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const qIds: string[] = JSON.parse(parsed.data.questionIds);
  if (qIds.length === 0) {
    return { error: "최소 1개 이상의 문제를 선택하세요" };
  }

  await prisma.exam.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      mode: parsed.data.mode,
      timeLimitMin: parsed.data.timeLimitMin,
      passingScore: parsed.data.passingScore,
      shuffleQuestions: parsed.data.shuffleQuestions,
      shuffleOptions: parsed.data.shuffleOptions,
      items: {
        create: qIds.map((id, i) => ({
          questionId: id,
          order: i + 1,
        })),
      },
    },
  });

  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function updateExam(
  id: string,
  _prev: ExamState,
  formData: FormData
): Promise<ExamState> {
  await requireAdmin();

  const parsed = examSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    mode: formData.get("mode"),
    timeLimitMin: formData.get("timeLimitMin"),
    passingScore: formData.get("passingScore"),
    shuffleQuestions: formData.get("shuffleQuestions") === "true",
    shuffleOptions: formData.get("shuffleOptions") === "true",
    questionIds: formData.get("questionIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const qIds: string[] = JSON.parse(parsed.data.questionIds);

  await prisma.$transaction([
    prisma.examItem.deleteMany({ where: { examId: id } }),
    prisma.exam.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        mode: parsed.data.mode,
        timeLimitMin: parsed.data.timeLimitMin,
        passingScore: parsed.data.passingScore,
        shuffleQuestions: parsed.data.shuffleQuestions,
        shuffleOptions: parsed.data.shuffleOptions,
        items: {
          create: qIds.map((qId, i) => ({
            questionId: qId,
            order: i + 1,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function togglePublish(id: string) {
  await requireAdmin();
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) throw new Error("Not found");

  await prisma.exam.update({
    where: { id },
    data: { isPublished: !exam.isPublished },
  });
  revalidatePath("/admin/exams");
}

export async function deleteExam(id: string) {
  await requireAdmin();
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/admin/exams");
}

export async function getExams() {
  return prisma.exam.findMany({
    include: {
      _count: { select: { items: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExam(id: string) {
  return prisma.exam.findUnique({
    where: { id },
    include: {
      items: {
        include: { question: { include: { category: true } } },
        orderBy: { order: "asc" },
      },
    },
  });
}
