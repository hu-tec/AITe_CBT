"use client";

import Link from "next/link";
import { deleteQuestion } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Question = {
  id: string;
  type: string;
  content: string;
  difficulty: number;
  points: number;
  category: { name: string };
};

const typeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "객관식(단일)",
  MULTIPLE_SELECT: "객관식(복수)",
  SHORT_ANSWER: "단답형",
  TRUE_FALSE: "O/X",
};

export function QuestionList({ questions }: { questions: Question[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(id);
    await deleteQuestion(id);
    setDeleting(null);
  }

  if (questions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        등록된 문제가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <div
          key={q.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {q.content}
            </p>
            <div className="mt-1 flex gap-2 text-xs text-gray-500">
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                {q.category.name}
              </span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">
                {typeLabels[q.type] ?? q.type}
              </span>
              <span>{"★".repeat(q.difficulty)}{"☆".repeat(5 - q.difficulty)}</span>
              <span>{q.points}점</span>
            </div>
          </div>
          <div className="ml-4 flex gap-2">
            <Link href={`/admin/questions/${q.id}/edit`}>
              <Button variant="ghost" className="text-xs">수정</Button>
            </Link>
            <Button
              variant="danger"
              className="text-xs"
              onClick={() => handleDelete(q.id)}
              disabled={deleting === q.id}
            >
              삭제
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
