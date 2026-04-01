"use client";

import Link from "next/link";
import { togglePublish, deleteExam } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Exam = {
  id: string;
  title: string;
  mode: string;
  timeLimitMin: number;
  passingScore: number;
  isPublished: boolean;
  _count: { items: number; attempts: number };
};

export function ExamListAdmin({ exams }: { exams: Exam[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleToggle(id: string) {
    setLoading(id);
    await togglePublish(id);
    setLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLoading(id);
    await deleteExam(id);
    setLoading(null);
  }

  if (exams.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">등록된 시험이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{exam.title}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  exam.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {exam.isPublished ? "공개" : "비공개"}
              </span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                {exam.mode === "MOCK" ? "모의시험" : "본시험"}
              </span>
            </div>
            <div className="mt-1 flex gap-3 text-xs text-gray-500">
              <span>{exam._count.items}문제</span>
              <span>{exam.timeLimitMin}분</span>
              <span>합격 {exam.passingScore}점</span>
              <span>응시 {exam._count.attempts}회</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => handleToggle(exam.id)}
              disabled={loading === exam.id}
            >
              {exam.isPublished ? "비공개" : "공개"}
            </Button>
            <Link href={`/admin/exams/${exam.id}/edit`}>
              <Button variant="ghost" className="text-xs">수정</Button>
            </Link>
            <Button
              variant="danger"
              className="text-xs"
              onClick={() => handleDelete(exam.id)}
              disabled={loading === exam.id}
            >
              삭제
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
