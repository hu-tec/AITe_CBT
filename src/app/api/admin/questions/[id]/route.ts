import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/admin/questions/[id]">
) {
  const { id } = await ctx.params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(question);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/questions/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const question = await prisma.question.update({
    where: { id },
    data: {
      type: body.type,
      content: body.content,
      options: body.options || null,
      answer: body.answer || null,
      explanation: body.explanation || null,
      difficulty: body.difficulty,
      points: body.points,
      categoryId: body.categoryId,
    },
  });
  return NextResponse.json(question);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/questions/[id]">
) {
  const { id } = await ctx.params;
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
