"use client";

import { useActionState, useState } from "react";
import { createQuestion, updateQuestion, type QuestionState } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Option = { label: string; text: string; isCorrect: boolean };

type Category = { id: string; name: string };

type QuestionData = {
  id: string;
  type: string;
  content: string;
  options: Option[] | null;
  answer: string | null;
  explanation: string | null;
  difficulty: number;
  points: number;
  categoryId: string;
};

export function QuestionForm({
  categories,
  question,
}: {
  categories: Category[];
  question?: QuestionData;
}) {
  const isEdit = !!question;

  const boundUpdate = question
    ? updateQuestion.bind(null, question.id)
    : undefined;

  const [state, formAction, isPending] = useActionState<QuestionState, FormData>(
    isEdit ? boundUpdate! : createQuestion,
    {}
  );

  const [type, setType] = useState(question?.type ?? "MULTIPLE_CHOICE");
  const [options, setOptions] = useState<Option[]>(
    question?.options ?? [
      { label: "A", text: "", isCorrect: true },
      { label: "B", text: "", isCorrect: false },
      { label: "C", text: "", isCorrect: false },
      { label: "D", text: "", isCorrect: false },
    ]
  );

  const showOptions = type === "MULTIPLE_CHOICE" || type === "MULTIPLE_SELECT";
  const showTrueFalse = type === "TRUE_FALSE";

  function addOption() {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions([...options, { label: nextLabel, text: "", isCorrect: false }]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index: number, field: keyof Option, value: string | boolean) {
    setOptions(
      options.map((opt, i) => {
        if (i !== index) {
          if (field === "isCorrect" && value === true && type === "MULTIPLE_CHOICE") {
            return { ...opt, isCorrect: false };
          }
          return opt;
        }
        return { ...opt, [field]: value };
      })
    );
  }

  return (
    <Card className="max-w-3xl">
      <h3 className="mb-4 text-lg font-semibold">
        {isEdit ? "문제 수정" : "문제 등록"}
      </h3>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              name="categoryId"
              defaultValue={question?.categoryId ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">선택하세요</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {state.fieldErrors?.categoryId && (
              <p className="text-xs text-red-600 mt-1">{state.fieldErrors.categoryId[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">문제 유형</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="MULTIPLE_CHOICE">객관식 (단일 선택)</option>
              <option value="MULTIPLE_SELECT">객관식 (복수 선택)</option>
              <option value="SHORT_ANSWER">단답형</option>
              <option value="TRUE_FALSE">O/X</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
            <select
              name="difficulty"
              defaultValue={question?.difficulty ?? 3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {"★".repeat(d)}{"☆".repeat(5 - d)}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="points"
            name="points"
            type="number"
            label="배점"
            defaultValue={question?.points ?? 10}
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            문제 본문 (Markdown 지원)
          </label>
          <textarea
            name="content"
            defaultValue={question?.content ?? ""}
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="문제 내용을 입력하세요..."
          />
          {state.fieldErrors?.content && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.content[0]}</p>
          )}
        </div>

        {showOptions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">보기</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-sm font-medium text-gray-500">{opt.label}</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(i, "text", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                    placeholder="보기 내용"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type={type === "MULTIPLE_SELECT" ? "checkbox" : "radio"}
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={(e) => updateOption(i, "isCorrect", e.target.checked)}
                    />
                    정답
                  </label>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              + 보기 추가
            </button>
            <input type="hidden" name="options" value={JSON.stringify(options)} />
          </div>
        )}

        {showTrueFalse && (
          <input
            type="hidden"
            name="options"
            value={JSON.stringify([
              { label: "O", text: "맞다", isCorrect: true },
              { label: "X", text: "틀리다", isCorrect: false },
            ])}
          />
        )}

        {(type === "SHORT_ANSWER" || showTrueFalse) && (
          <Input
            id="answer"
            name="answer"
            label={showTrueFalse ? "정답 (O 또는 X)" : "정답"}
            defaultValue={question?.answer ?? ""}
            placeholder={showTrueFalse ? "O 또는 X" : "정답을 입력하세요"}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            해설 (Markdown 지원)
          </label>
          <textarea
            name="explanation"
            defaultValue={question?.explanation ?? ""}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="해설을 입력하세요..."
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : isEdit ? "수정" : "등록"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => history.back()}>
            취소
          </Button>
        </div>
      </form>
    </Card>
  );
}
