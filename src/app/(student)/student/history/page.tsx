import { getAttemptHistory } from "@/app/actions/attempts";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const attempts = await getAttemptHistory();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">응시 이력</h2>
      {attempts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">응시 기록이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{a.exam.title}</p>
                  <div className="mt-1 flex gap-3 text-xs text-gray-500">
                    <span>
                      {new Date(a.startedAt).toLocaleDateString("ko-KR")}{" "}
                      {new Date(a.startedAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`font-medium ${
                        a.status === "GRADED"
                          ? a.passed
                            ? "text-green-600"
                            : "text-red-600"
                          : "text-orange-500"
                      }`}
                    >
                      {a.status === "IN_PROGRESS"
                        ? "진행 중"
                        : a.passed
                        ? "합격"
                        : "불합격"}
                    </span>
                    {a.score !== null && (
                      <span>
                        {a.score}/{a.totalPoints}점
                      </span>
                    )}
                  </div>
                </div>
                {a.status === "GRADED" && (
                  <Link href={`/student/exams/${a.examId}/result?attemptId=${a.id}`}>
                    <Button variant="ghost" className="text-xs">결과 보기</Button>
                  </Link>
                )}
                {a.status === "IN_PROGRESS" && (
                  <Link href={`/student/exams/${a.examId}/take?attemptId=${a.id}`}>
                    <Button className="text-xs">이어하기</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
