import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">응시자 대시보드</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>응시 가능한 시험</CardTitle>
          <p className="mt-2 text-3xl font-bold text-blue-600">-</p>
          <Link href="/student/exams" className="mt-3 block">
            <Button variant="secondary" className="w-full">
              시험 목록 보기
            </Button>
          </Link>
        </Card>
        <Card>
          <CardTitle>응시 완료</CardTitle>
          <p className="mt-2 text-3xl font-bold text-green-600">-</p>
          <Link href="/student/history" className="mt-3 block">
            <Button variant="secondary" className="w-full">
              응시 이력 보기
            </Button>
          </Link>
        </Card>
        <Card>
          <CardTitle>학습 진도</CardTitle>
          <p className="mt-2 text-3xl font-bold text-orange-500">-</p>
          <Link href="/student/study" className="mt-3 block">
            <Button variant="secondary" className="w-full">
              학습 모드
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
