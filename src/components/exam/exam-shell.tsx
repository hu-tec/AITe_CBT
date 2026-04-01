"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/stores/exam-store";
import { submitAttempt } from "@/app/actions/attempts";
import { QuestionCard } from "./question-card";
import { QuestionNav } from "./question-nav";
import { ExamTimer } from "./exam-timer";
import { Button } from "@/components/ui/button";

type Props = {
  attemptId: string;
  examId: string;
  examTitle: string;
  questions: {
    id: string;
    type: string;
    content: string;
    options: { label: string; text: string; isCorrect: boolean }[] | null;
    order: number;
  }[];
  answers: Record<string, string>;
  flagged: string[];
  timeRemaining: number;
};

export function ExamShell(props: Props) {
  const router = useRouter();
  const store = useExamStore();
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!initialized.current) {
      store.init({
        attemptId: props.attemptId,
        examId: props.examId,
        examTitle: props.examTitle,
        questions: props.questions,
        answers: props.answers,
        flagged: props.flagged,
        timeRemaining: props.timeRemaining,
      });
      initialized.current = true;
    }
  }, []);

  // 자동 저장
  const saveCurrentAnswer = useCallback(async () => {
    const s = useExamStore.getState();
    const q = s.questions[s.currentIndex];
    if (!q) return;
    const answer = s.answers[q.id];
    if (answer === undefined) return;

    try {
      await fetch(`/api/attempts/${s.attemptId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.id,
          answer,
          flagged: s.flagged.has(q.id),
        }),
      });
    } catch {}
  }, []);

  useEffect(() => {
    saveTimer.current = setInterval(saveCurrentAnswer, 5000);
    return () => {
      if (saveTimer.current) clearInterval(saveTimer.current);
    };
  }, [saveCurrentAnswer]);

  // 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      const s = useExamStore.getState();
      s.tick();
      if (s.timeRemaining <= 1) {
        clearInterval(interval);
        handleSubmit(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 이탈 경고
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  async function handleSubmit(auto = false) {
    const s = useExamStore.getState();
    if (s.isSubmitting) return;

    // 미응답 확인
    if (!auto) {
      const unanswered = s.questions.filter((q) => !s.answers[q.id]);
      if (unanswered.length > 0) {
        const ok = confirm(
          `미응답 문제가 ${unanswered.length}개 있습니다. 제출하시겠습니까?`
        );
        if (!ok) return;
      }
    }

    s.setSubmitting(true);

    // 모든 답안 저장
    for (const q of s.questions) {
      const answer = s.answers[q.id];
      if (answer !== undefined) {
        try {
          await fetch(`/api/attempts/${s.attemptId}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              answer,
              flagged: s.flagged.has(q.id),
            }),
          });
        } catch {}
      }
    }

    await submitAttempt(s.attemptId);
    router.push(
      `/student/exams/${s.examId}/result?attemptId=${s.attemptId}`
    );
  }

  const {
    questions,
    currentIndex,
    answers,
    flagged,
    timeRemaining,
    examTitle,
    isSubmitting,
  } = store;

  if (questions.length === 0) {
    return <div className="py-8 text-center">로딩 중...</div>;
  }

  const currentQ = questions[currentIndex];
  const unansweredCount = questions.filter((q) => !answers[q.id]).length;
  const flaggedCount = flagged.size;

  return (
    <div className="mx-auto max-w-6xl">
      {/* 상단 바 */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
        <h2 className="font-semibold text-gray-900">{examTitle}</h2>
        <ExamTimer seconds={timeRemaining} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        {/* 사이드 네비 */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <QuestionNav
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flagged={flagged}
            onSelect={(i) => store.goTo(i)}
          />
          <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <p>미응답: {unansweredCount}</p>
            <p>플래그: {flaggedCount}</p>
          </div>
          <Button
            className="mt-3 w-full"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "제출 중..." : "제출"}
          </Button>
        </div>

        {/* 문제 영역 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <QuestionCard
            question={currentQ}
            answer={answers[currentQ.id] ?? ""}
            isFlagged={flagged.has(currentQ.id)}
            onAnswer={(ans) => store.setAnswer(currentQ.id, ans)}
            onToggleFlag={() => store.toggleFlag(currentQ.id)}
          />
          <div className="mt-6 flex justify-between">
            <Button
              variant="secondary"
              onClick={() => store.prev()}
              disabled={currentIndex === 0}
            >
              &larr; 이전
            </Button>
            <Button
              variant="secondary"
              onClick={() => store.next()}
              disabled={currentIndex === questions.length - 1}
            >
              다음 &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
