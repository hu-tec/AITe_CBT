"use client";

import { useState } from "react";
import { markMastered, markReviewed } from "@/app/actions/study";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Option = { label: string; text: string; isCorrect: boolean };

type StudyItem = {
  id: string;
  questionId: string;
  mastered: boolean;
  reviewCount: number;
  lastReviewedAt: Date | null;
  lastAnswer: string | null;
  question: {
    content: string;
    type: string;
    options: unknown;
    answer: string | null;
    explanation: string | null;
    difficulty: number;
    points: number;
    category: { name: string };
  };
};

export function StudyList({ items }: { items: StudyItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [showMastered, setShowMastered] = useState(false);

  const filtered = showMastered ? items : items.filter((i) => !i.mastered);

  async function handleMaster(questionId: string) {
    setLoading(questionId);
    await markMastered(questionId);
    setLoading(null);
  }

  async function handleReview(questionId: string) {
    setLoading(questionId);
    await markReviewed(questionId);
    setLoading(null);
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        오답 기록이 없습니다. 시험을 응시해보세요!
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showMastered}
            onChange={(e) => setShowMastered(e.target.checked)}
          />
          마스터 완료 항목 표시
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const options = item.question.options as Option[] | null;
          const isExpanded = expanded === item.id;
          const correctIdx = options?.findIndex((o) => o.isCorrect) ?? -1;
          const correctOption = correctIdx >= 0 ? options![correctIdx] : null;
          const correctAnswer =
            item.question.type === "SHORT_ANSWER"
              ? item.question.answer
              : correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : null;

          return (
            <Card
              key={item.id}
              className={`p-4 ${item.mastered ? "opacity-60" : ""}`}
            >
              <div
                className="cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : item.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                        {item.question.category.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {"★".repeat(item.question.difficulty)}
                      </span>
                      {item.mastered && (
                        <span className="text-xs rounded bg-green-100 px-1.5 py-0.5 text-green-700">
                          마스터
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900">{item.question.content}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    복습 {item.reviewCount}회
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  {item.lastAnswer && (
                    <p className="text-sm text-red-600 mb-1">
                      내 답: {(() => {
                        if (!options) return item.lastAnswer;
                        return item.lastAnswer.split(",").map((lbl) => {
                          const idx = options.findIndex((o) => o.label === lbl.trim());
                          return idx >= 0 ? String.fromCharCode(65 + idx) : lbl;
                        }).join(", ");
                      })()}
                    </p>
                  )}
                  <p className="text-sm text-green-700 mb-2">
                    정답: {correctAnswer}
                    {correctOption ? ` - ${correctOption.text}` : ""}
                  </p>

                  {options && (
                    <div className="mb-3 space-y-1">
                      {options.map((opt, idx) => (
                        <p
                          key={opt.label}
                          className={`text-sm ${
                            opt.isCorrect ? "text-green-700 font-medium" : "text-gray-500"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}. {opt.text} {opt.isCorrect && "(정답)"}
                        </p>
                      ))}
                    </div>
                  )}

                  {item.question.explanation && (
                    <div className="rounded bg-blue-50 p-3 mb-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">해설</p>
                      <p className="text-sm text-gray-700">{item.question.explanation}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!item.mastered && (
                      <Button
                        onClick={() => handleMaster(item.questionId)}
                        disabled={loading === item.questionId}
                        className="text-xs"
                      >
                        마스터 완료
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => handleReview(item.questionId)}
                      disabled={loading === item.questionId}
                      className="text-xs"
                    >
                      복습 완료
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
