"use client";

type Option = { label: string; text: string; isCorrect: boolean };

type Question = {
  id: string;
  type: string;
  content: string;
  options: Option[] | null;
  order: number;
};

export function QuestionCard({
  question,
  answer,
  isFlagged,
  onAnswer,
  onToggleFlag,
}: {
  question: Question;
  answer: string;
  isFlagged: boolean;
  onAnswer: (answer: string) => void;
  onToggleFlag: () => void;
}) {
  const selectedLabels = answer ? answer.split(",") : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Q{question.order}
        </span>
        <button
          type="button"
          onClick={onToggleFlag}
          className={`rounded px-2 py-1 text-xs cursor-pointer ${
            isFlagged
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-500 hover:bg-orange-50"
          }`}
        >
          {isFlagged ? "플래그 해제" : "플래그"}
        </button>
      </div>

      <p className="mb-6 text-gray-900 whitespace-pre-wrap">{question.content}</p>

      {/* 객관식 (단일) */}
      {question.type === "MULTIPLE_CHOICE" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const displayLabel = String.fromCharCode(65 + idx);
            return (
              <label
                key={opt.label}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  answer === opt.label
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt.label}
                  checked={answer === opt.label}
                  onChange={() => onAnswer(opt.label)}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-500 w-5">{displayLabel}</span>
                <span className="text-sm">{opt.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* 객관식 (복수) */}
      {question.type === "MULTIPLE_SELECT" && question.options && (
        <div className="space-y-2">
          <p className="mb-2 text-xs text-gray-400">복수 선택 가능</p>
          {question.options.map((opt, idx) => {
            const displayLabel = String.fromCharCode(65 + idx);
            const checked = selectedLabels.includes(opt.label);
            return (
              <label
                key={opt.label}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  checked
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selectedLabels.filter((l) => l !== opt.label)
                      : [...selectedLabels, opt.label];
                    onAnswer(next.join(","));
                  }}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-500 w-5">{displayLabel}</span>
                <span className="text-sm">{opt.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* O/X */}
      {question.type === "TRUE_FALSE" && (
        <div className="flex gap-4">
          {["O", "X"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onAnswer(val)}
              className={`flex-1 rounded-lg border py-4 text-2xl font-bold transition-colors cursor-pointer ${
                answer === val
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      )}

      {/* 단답형 */}
      {question.type === "SHORT_ANSWER" && (
        <input
          type="text"
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="답을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      )}
    </div>
  );
}
