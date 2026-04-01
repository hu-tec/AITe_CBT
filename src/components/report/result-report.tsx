"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ResponseData = {
  id: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  earnedPoints: number;
  question: {
    content: string;
    type: string;
    options: { label: string; text: string; isCorrect: boolean }[] | null;
    answer: string | null;
    explanation: string | null;
    points: number;
    categoryName: string;
  };
};

type Props = {
  exam: { title: string; passingScore: number; id: string };
  attempt: {
    score: number | null;
    totalPoints: number | null;
    passed: boolean | null;
    submittedAt: Date | null;
  };
  responses: ResponseData[];
  categoryStats: Record<
    string,
    { correct: number; total: number; points: number; earnedPoints: number }
  >;
};

export function ResultReport({ exam, attempt, responses, categoryStats }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const score = attempt.score ?? 0;
  const total = attempt.totalPoints ?? 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const correctCount = responses.filter((r) => r.isCorrect).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">시험 결과</h2>

      {/* 점수 카드 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{pct}점</p>
          <p className="text-sm text-gray-500">
            {score}/{total}
          </p>
        </Card>
        <Card className="text-center">
          <p
            className={`text-3xl font-bold ${
              attempt.passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {attempt.passed ? "합격" : "불합격"}
          </p>
          <p className="text-sm text-gray-500">합격 기준: {exam.passingScore}점</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-700">
            {correctCount}/{responses.length}
          </p>
          <p className="text-sm text-gray-500">정답 수</p>
        </Card>
      </div>

      {/* 영역별 성취도 */}
      <Card className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">영역별 성취도</h3>
        <div className="space-y-3">
          {Object.entries(categoryStats).map(([name, stat]) => {
            const catPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{name}</span>
                  <span className="text-gray-500">
                    {stat.correct}/{stat.total} ({catPct}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200">
                  <div
                    className={`h-3 rounded-full ${
                      catPct >= 80 ? "bg-green-500" : catPct >= 60 ? "bg-blue-500" : "bg-red-400"
                    }`}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 문항별 리뷰 */}
      <Card className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">문항별 리뷰</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {responses.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              className={`rounded px-2 py-1 text-xs font-medium cursor-pointer ${
                r.isCorrect
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Q{i + 1}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {responses.map((r, i) => (
            <div key={r.id}>
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full text-left flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      r.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.isCorrect ? "O" : "X"}
                  </span>
                  <span className="text-sm text-gray-500">Q{i + 1}</span>
                  <span className="text-sm truncate max-w-md">{r.question.content}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {r.earnedPoints}/{r.question.points}점
                </span>
              </button>

              {expanded === r.id && (
                <div className="mt-1 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
                  <p className="mb-2 text-gray-700">{r.question.content}</p>

                  {r.question.options && (
                    <div className="mb-3 space-y-1">
                      {r.question.options.map((opt, idx) => {
                        const displayLabel = String.fromCharCode(65 + idx);
                        const isMyAnswer = r.answer.split(",").includes(opt.label);
                        const isCorrectOpt = opt.isCorrect;
                        let cls = "text-gray-600";
                        if (isCorrectOpt) cls = "text-green-700 font-medium";
                        if (isMyAnswer && !isCorrectOpt) cls = "text-red-600 line-through";

                        return (
                          <p key={opt.label} className={cls}>
                            {displayLabel}. {opt.text}
                            {isMyAnswer && " (내 답)"}
                            {isCorrectOpt && " (정답)"}
                          </p>
                        );
                      })}
                    </div>
                  )}

                  {r.question.type === "SHORT_ANSWER" && (
                    <div className="mb-3">
                      <p className="text-red-600">내 답: {r.answer}</p>
                      <p className="text-green-700">정답: {r.question.answer}</p>
                    </div>
                  )}

                  {r.question.explanation && (
                    <div className="mt-2 rounded bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">해설</p>
                      <p className="text-gray-700">{r.question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/student/exams">
          <Button variant="secondary">시험 목록</Button>
        </Link>
        <Link href="/student/study">
          <Button>학습 모드</Button>
        </Link>
      </div>
    </div>
  );
}
