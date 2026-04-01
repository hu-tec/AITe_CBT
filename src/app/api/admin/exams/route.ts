import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exams = await prisma.exam.findMany({
    include: {
      _count: { select: { items: true, attempts: true } },
      items: {
        include: { question: { select: { id: true, content: true } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const body = await request.json();
  const exam = await prisma.exam.create({
    data: {
      title: body.title,
      description: body.description || null,
      mode: body.mode || "MOCK",
      timeLimitMin: body.timeLimitMin || 60,
      passingScore: body.passingScore || 70,
      shuffleQuestions: body.shuffleQuestions ?? true,
      shuffleOptions: body.shuffleOptions ?? true,
      isPublished: body.isPublished ?? false,
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
  return NextResponse.json(exam, { status: 201 });
}
