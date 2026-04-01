import { redirect } from "next/navigation";
import { getAttemptData } from "@/app/actions/attempts";
import { getRemainingSeconds } from "@/lib/timer";
import { ExamShell } from "@/components/exam/exam-shell";

export const dynamic = "force-dynamic";

export default async function TakeExamPage({
  searchParams,
}: {
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/student/exams");

  const data = await getAttemptData(attemptId);

  if (data.attempt.status !== "IN_PROGRESS") {
    redirect(`/student/exams/${data.exam.id}/result?attemptId=${attemptId}`);
  }

  const timeRemaining = getRemainingSeconds(
    new Date(data.attempt.startedAt),
    data.exam.timeLimitMin
  );

  return (
    <ExamShell
      attemptId={data.attempt.id}
      examId={data.exam.id}
      examTitle={data.exam.title}
      questions={data.questions}
      answers={data.answers}
      flagged={data.flagged}
      timeRemaining={timeRemaining}
    />
  );
}
