import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRemainingSeconds } from "@/lib/timer";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/attempts/[attemptId]/save">
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await ctx.params;
  const body = await request.json();
  const { questionId, answer, flagged } = body;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { select: { timeLimitMin: true } } },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  await prisma.response.upsert({
    where: {
      attemptId_questionId: { attemptId, questionId },
    },
    update: {
      answer: answer ?? "",
      flagged: flagged ?? false,
    },
    create: {
      attemptId,
      questionId,
      answer: answer ?? "",
      flagged: flagged ?? false,
    },
  });

  const remaining = getRemainingSeconds(
    attempt.startedAt,
    attempt.exam.timeLimitMin
  );

  return NextResponse.json({ ok: true, remainingSeconds: remaining });
}
