"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const questionSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "MULTIPLE_SELECT", "SHORT_ANSWER", "TRUE_FALSE"]),
  content: z.string().min(1, "문제 내용을 입력하세요"),
  options: z.string().optional(),
  answer: z.string().optional(),
  explanation: z.string().optional(),
  difficulty: z.coerce.number().min(1).max(5),
  points: z.coerce.number().min(1),
  categoryId: z.string().min(1, "카테고리를 선택하세요"),
});

export type QuestionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createQuestion(
  _prev: QuestionState,
  formData: FormData
): Promise<QuestionState> {
  await requireAdmin();

  const parsed = questionSchema.safeParse({
    type: formData.get("type"),
    content: formData.get("content"),
    options: formData.get("options"),
    answer: formData.get("answer"),
    explanation: formData.get("explanation"),
    difficulty: formData.get("difficulty"),
    points: formData.get("points"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { options, ...rest } = parsed.data;
  let parsedOptions = null;
  if (options) {
    try {
      parsedOptions = JSON.parse(options);
    } catch {
      return { error: "보기 형식이 올바르지 않습니다" };
    }
  }

  await prisma.question.create({
    data: {
      ...rest,
      options: parsedOptions,
    },
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function updateQuestion(
  id: string,
  _prev: QuestionState,
  formData: FormData
): Promise<QuestionState> {
  await requireAdmin();

  const parsed = questionSchema.safeParse({
    type: formData.get("type"),
    content: formData.get("content"),
    options: formData.get("options"),
    answer: formData.get("answer"),
    explanation: formData.get("explanation"),
    difficulty: formData.get("difficulty"),
    points: formData.get("points"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { options, ...rest } = parsed.data;
  let parsedOptions = null;
  if (options) {
    try {
      parsedOptions = JSON.parse(options);
    } catch {
      return { error: "보기 형식이 올바르지 않습니다" };
    }
  }

  await prisma.question.update({
    where: { id },
    data: { ...rest, options: parsedOptions },
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
}

export async function getQuestions(params: {
  categoryId?: string;
  type?: string;
  difficulty?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { categoryId, type, difficulty, search, page = 1, pageSize = 20 } = params;

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.content = { contains: search };
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.question.count({ where }),
  ]);

  return { questions, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getQuestion(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: { category: true },
  });
}
