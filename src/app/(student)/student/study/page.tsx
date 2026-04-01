import { getWrongAnswers, getStudyStats } from "@/app/actions/study";
import { Card, CardTitle } from "@/components/ui/card";
import { StudyList } from "@/components/study/study-list";

export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const [wrongAnswers, stats] = await Promise.all([
    getWrongAnswers(),
    getStudyStats(),
  ]);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">학습 모드</h2>

      {/* 통계 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>오답 문제</CardTitle>
          <p className="mt-2 text-3xl font-bold text-red-500">{stats.totalWrong}</p>
        </Card>
        <Card>
          <CardTitle>마스터 완료</CardTitle>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.mastered}</p>
        </Card>
        <Card>
          <CardTitle>학습 진도</CardTitle>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.totalWrong > 0
              ? Math.round((stats.mastered / stats.totalWrong) * 100)
              : 0}
            %
          </p>
        </Card>
      </div>

      {/* 영역별 현황 */}
      {Object.keys(stats.byCategory).length > 0 && (
        <Card className="mb-6">
          <CardTitle>영역별 학습 현황</CardTitle>
          <div className="mt-3 space-y-2">
            {Object.entries(stats.byCategory).map(([cat, s]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-gray-700">{cat}</span>
                <span className="text-gray-500">
                  마스터 {s.mastered}/{s.total}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 오답 목록 */}
      <StudyList items={wrongAnswers} />
    </div>
  );
}
