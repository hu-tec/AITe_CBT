"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "카테고리명을 입력하세요"),
  parentId: z.string().optional().nullable(),
});

export type CategoryState = {
  error?: string;
  success?: boolean;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  await prisma.category.create({ data: parsed.data });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(
  id: string,
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<CategoryState> {
  await requireAdmin();
  const questionCount = await prisma.question.count({
    where: { categoryId: id },
  });
  if (questionCount > 0) {
    return { error: `이 카테고리에 ${questionCount}개의 문제가 있습니다. 먼저 문제를 이동/삭제하세요.` };
  }
  const childCount = await prisma.category.count({
    where: { parentId: id },
  });
  if (childCount > 0) {
    return { error: "하위 카테고리가 있습니다. 먼저 삭제하세요." };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { questions: true } },
      children: {
        include: { _count: { select: { questions: true } } },
      },
    },
    where: { parentId: null },
    orderBy: { name: "asc" },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
