import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "../../cors";

export async function OPTIONS() { return corsOptions(); }

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/admin/exams/[id]">
) {
  const { id } = await ctx.params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      items: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { attempts: true } },
    },
  });
  if (!exam) return corsJson({ error: "Not found" }, 404);
  return corsJson(exam);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/exams/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  if (body.questionIds) {
    await prisma.examItem.deleteMany({ where: { examId: id } });
  }

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      mode: body.mode,
      timeLimitMin: body.timeLimitMin,
      passingScore: body.passingScore,
      shuffleQuestions: body.shuffleQuestions,
      shuffleOptions: body.shuffleOptions,
      isPublished: body.isPublished,
      items: body.questionIds
        ? {
            create: body.questionIds.map((qId: string, i: number) => ({
              questionId: qId,
              order: i + 1,
            })),
          }
        : undefined,
    },
  });
  return corsJson(exam);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/exams/[id]">
) {
  const { id } = await ctx.params;
  await prisma.exam.delete({ where: { id } });
  return corsJson({ success: true });
}
