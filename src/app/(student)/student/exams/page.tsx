import { getPublishedExams } from "@/app/actions/attempts";
import { Card } from "@/components/ui/card";
import { ExamStartButton } from "@/components/exam/exam-start-button";

export const dynamic = "force-dynamic";

export default async function ExamListPage() {
  const exams = await getPublishedExams();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">시험 목록</h2>
      {exams.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          현재 응시 가능한 시험이 없습니다.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => {
            const lastAttempt = exam.attempts[0];
            const inProgress = lastAttempt?.status === "IN_PROGRESS";

            return (
              <Card key={exam.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                    {exam.description && (
                      <p className="mt-1 text-sm text-gray-500">{exam.description}</p>
                    )}
                    <div className="mt-2 flex gap-2 text-xs text-gray-500">
                      <span>{exam._count.items}문제</span>
                      <span>{exam.timeLimitMin}분</span>
                      <span>합격 {exam.passingScore}점</span>
                      <span className="rounded bg-blue-50 px-1.5 text-blue-700">
                        {exam.mode === "MOCK" ? "모의시험" : "본시험"}
                      </span>
                    </div>
                    {exam.attempts.length > 0 && (
                      <p className="mt-2 text-xs text-gray-400">
                        응시 {exam.attempts.length}회
                        {lastAttempt?.passed !== null && (
                          <span
                            className={`ml-1 ${
                              lastAttempt.passed ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            (최근: {lastAttempt.passed ? "합격" : "불합격"} {lastAttempt.score}점)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <ExamStartButton examId={exam.id} inProgress={inProgress} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
