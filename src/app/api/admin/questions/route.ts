import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "../cors";
import { pushToWS } from "@/lib/ws-sync";

export async function OPTIONS() { return corsOptions(); }

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;

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

  return corsJson({ questions, total });
}

export async function POST(request: Request) {
  const body = await request.json();
  const question = await prisma.question.create({
    data: {
      type: body.type,
      content: body.content,
      options: body.options || null,
      answer: body.answer || null,
      explanation: body.explanation || null,
      difficulty: body.difficulty || 3,
      points: body.points || 10,
      categoryId: body.categoryId,
    },
  });
  pushToWS(question.id).catch(() => {});
  return corsJson(question, 201);
}
