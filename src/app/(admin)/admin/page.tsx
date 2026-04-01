import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [questionCount, examCount, studentCount, attemptCount, recentAttempts, wrongQuestions] =
    await Promise.all([
      prisma.question.count(),
      prisma.exam.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.attempt.count({ where: { status: "GRADED" } }),
      prisma.attempt.findMany({
        where: { status: "GRADED" },
        include: {
          user: { select: { name: true } },
          exam: { select: { title: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.response.groupBy({
        by: ["questionId"],
        where: { isCorrect: false },
        _count: true,
        orderBy: { _count: { questionId: "desc" } },
        take: 10,
      }),
    ]);

  const passedCount = await prisma.attempt.count({
    where: { status: "GRADED", passed: true },
  });
  const passRate = attemptCount > 0 ? Math.round((passedCount / attemptCount) * 100) : 0;

  // 자주 틀리는 문제 TOP 10
  const wrongQuestionIds = wrongQuestions.map((w) => w.questionId);
  const wrongQuestionDetails = wrongQuestionIds.length > 0
    ? await prisma.question.findMany({
        where: { id: { in: wrongQuestionIds } },
        include: { category: true },
      })
    : [];

  const wrongQMap = new Map(wrongQuestions.map((w) => [w.questionId, w._count]));

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">관리자 대시보드</h2>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardTitle>문제 수</CardTitle>
          <p className="mt-2 text-3xl font-bold text-blue-600">{questionCount}</p>
        </Card>
        <Card>
          <CardTitle>시험 수</CardTitle>
          <p className="mt-2 text-3xl font-bold text-blue-600">{examCount}</p>
        </Card>
        <Card>
          <CardTitle>응시자 수</CardTitle>
          <p className="mt-2 text-3xl font-bold text-blue-600">{studentCount}</p>
        </Card>
        <Card>
          <CardTitle>합격률</CardTitle>
          <p className="mt-2 text-3xl font-bold text-green-600">{passRate}%</p>
          <p className="text-xs text-gray-500">{passedCount}/{attemptCount}회</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 최근 응시 */}
        <Card>
          <CardTitle>최근 응시</CardTitle>
          {recentAttempts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">응시 기록 없음</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentAttempts.map((a) => (
                <div key={a.id} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                  <div>
                    <span className="text-gray-700">{a.user.name}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500">{a.exam.title}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${a.passed ? "text-green-600" : "text-red-500"}`}>
                      {a.score}/{a.totalPoints}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 자주 틀리는 문제 TOP 10 */}
        <Card>
          <CardTitle>자주 틀리는 문제 TOP 10</CardTitle>
          {wrongQuestionDetails.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">데이터 없음</p>
          ) : (
            <div className="mt-3 space-y-2">
              {wrongQuestionDetails.map((q, i) => (
                <div key={q.id} className="flex items-center gap-2 text-sm border-b border-gray-50 pb-2">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-gray-700">{q.content}</p>
                    <span className="text-xs text-gray-400">{q.category.name}</span>
                  </div>
                  <span className="text-xs text-red-500 shrink-0">
                    {wrongQMap.get(q.id) ?? 0}회 오답
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
