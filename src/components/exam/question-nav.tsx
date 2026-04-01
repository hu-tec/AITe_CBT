"use client";

type Question = {
  id: string;
  order: number;
};

export function QuestionNav({
  questions,
  currentIndex,
  answers,
  flagged,
  onSelect,
}: {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Set<string>;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {questions.map((q, i) => {
        const answered = !!answers[q.id];
        const isFlagged = flagged.has(q.id);
        const isCurrent = i === currentIndex;

        let bg = "bg-gray-100 text-gray-600";
        if (isCurrent) bg = "bg-blue-600 text-white";
        else if (isFlagged) bg = "bg-orange-100 text-orange-700";
        else if (answered) bg = "bg-blue-100 text-blue-700";

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(i)}
            className={`rounded p-1.5 text-xs font-medium cursor-pointer ${bg}`}
          >
            {q.order}
          </button>
        );
      })}
    </div>
  );
}
