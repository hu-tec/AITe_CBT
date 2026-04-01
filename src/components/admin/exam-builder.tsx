"use client";

import { useActionState, useState } from "react";
import { createExam, updateExam, type ExamState } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Question = {
  id: string;
  content: string;
  type: string;
  difficulty: number;
  points: number;
  category: { name: string };
};

type ExamData = {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  timeLimitMin: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  items: { questionId: string }[];
};

export function ExamBuilder({
  allQuestions,
  exam,
}: {
  allQuestions: Question[];
  exam?: ExamData;
}) {
  const isEdit = !!exam;
  const boundUpdate = exam ? updateExam.bind(null, exam.id) : undefined;

  const [state, formAction, isPending] = useActionState<ExamState, FormData>(
    isEdit ? boundUpdate! : createExam,
    {}
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    exam?.items.map((i) => i.questionId) ?? []
  );
  const [filter, setFilter] = useState("");

  const filteredQuestions = allQuestions.filter(
    (q) =>
      !selectedIds.includes(q.id) &&
      (filter === "" ||
        q.content.toLowerCase().includes(filter.toLowerCase()) ||
        q.category.name.toLowerCase().includes(filter.toLowerCase()))
  );

  const selectedQuestions = selectedIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter(Boolean) as Question[];

  const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

  function addQuestion(id: string) {
    setSelectedIds((prev) => [...prev, id]);
  }

  function removeQuestion(id: string) {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    if (index === selectedIds.length - 1) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Card>
        <h3 className="mb-4 text-lg font-semibold">시험 정보</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="title"
            name="title"
            label="시험명"
            defaultValue={exam?.title ?? ""}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모드</label>
            <select
              name="mode"
              defaultValue={exam?.mode ?? "MOCK"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="MOCK">모의시험</option>
              <option value="OFFICIAL">본시험</option>
            </select>
          </div>
          <Input
            id="timeLimitMin"
            name="timeLimitMin"
            type="number"
            label="제한시간 (분)"
            defaultValue={exam?.timeLimitMin ?? 60}
            min={1}
          />
          <Input
            id="passingScore"
            name="passingScore"
            type="number"
            label="합격 기준 점수"
            defaultValue={exam?.passingScore ?? 70}
            min={0}
            max={100}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            name="description"
            defaultValue={exam?.description ?? ""}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="shuffleQuestions"
              value="true"
              defaultChecked={exam?.shuffleQuestions ?? true}
            />
            문제 순서 셔플
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="shuffleOptions"
              value="true"
              defaultChecked={exam?.shuffleOptions ?? true}
            />
            보기 순서 셔플
          </label>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">문제 선택</h3>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="문제/카테고리 검색..."
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <div className="max-h-96 overflow-y-auto space-y-1">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded border border-gray-100 p-2 text-sm hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="truncate">{q.content}</p>
                  <span className="text-xs text-gray-400">
                    {q.category.name} | {"★".repeat(q.difficulty)} | {q.points}점
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => addQuestion(q.id)}
                  className="text-blue-600 text-xs hover:underline shrink-0"
                >
                  추가
                </button>
              </div>
            ))}
            {filteredQuestions.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-400">문제 없음</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">
            선택된 문제 ({selectedQuestions.length}개, 총 {totalPoints}점)
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {selectedQuestions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded border border-blue-100 bg-blue-50 p-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                  <p className="truncate">{q.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => moveUp(i)} className="text-xs text-gray-400 hover:text-gray-600">↑</button>
                  <button type="button" onClick={() => moveDown(i)} className="text-xs text-gray-400 hover:text-gray-600">↓</button>
                  <button type="button" onClick={() => removeQuestion(q.id)} className="text-xs text-red-500 hover:text-red-700 ml-1">×</button>
                </div>
              </div>
            ))}
            {selectedQuestions.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-400">문제를 선택하세요</p>
            )}
          </div>
        </Card>
      </div>

      <input type="hidden" name="questionIds" value={JSON.stringify(selectedIds)} />

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : isEdit ? "수정" : "생성"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}
