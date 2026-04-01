import Link from "next/link";
import { getExams } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { ExamListAdmin } from "@/components/admin/exam-list-admin";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const exams = await getExams();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">시험 관리</h2>
        <Link href="/admin/exams/new">
          <Button>시험 생성</Button>
        </Link>
      </div>
      <ExamListAdmin exams={exams} />
    </div>
  );
}
