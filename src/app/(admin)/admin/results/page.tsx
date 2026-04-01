import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const attempts = await prisma.attempt.findMany({
    where: { status: "GRADED" },
    include: {
      user: { select: { name: true, email: true } },
      exam: { select: { title: true, passingScore: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">응시 결과</h2>
      {attempts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">응시 기록이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {attempts.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.user.name} ({a.user.email})</p>
                  <p className="text-sm text-gray-500">{a.exam.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {a.score ?? 0}
                    <span className="text-sm text-gray-400">/{a.totalPoints ?? 0}</span>
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      a.passed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {a.passed ? "합격" : "불합격"}
                  </span>
                  {a.submittedAt && (
                    <p className="text-xs text-gray-400">
                      {new Date(a.submittedAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
