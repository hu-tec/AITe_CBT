import { create } from "zustand";

type Question = {
  id: string;
  type: string;
  content: string;
  options: { label: string; text: string; isCorrect: boolean }[] | null;
  order: number;
};

interface ExamStore {
  attemptId: string;
  examId: string;
  examTitle: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Set<string>;
  timeRemaining: number;
  isSubmitting: boolean;

  init: (data: {
    attemptId: string;
    examId: string;
    examTitle: string;
    questions: Question[];
    answers: Record<string, string>;
    flagged: string[];
    timeRemaining: number;
  }) => void;
  setAnswer: (questionId: string, answer: string) => void;
  toggleFlag: (questionId: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  tick: () => void;
  setSubmitting: (v: boolean) => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  attemptId: "",
  examId: "",
  examTitle: "",
  questions: [],
  currentIndex: 0,
  answers: {},
  flagged: new Set(),
  timeRemaining: 0,
  isSubmitting: false,

  init: (data) =>
    set({
      attemptId: data.attemptId,
      examId: data.examId,
      examTitle: data.examTitle,
      questions: data.questions,
      answers: data.answers,
      flagged: new Set(data.flagged),
      timeRemaining: data.timeRemaining,
      currentIndex: 0,
      isSubmitting: false,
    }),

  setAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),

  toggleFlag: (questionId) =>
    set((s) => {
      const next = new Set(s.flagged);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return { flagged: next };
    }),

  goTo: (index) => set({ currentIndex: index }),
  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1) })),
  prev: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),
  tick: () => set((s) => ({ timeRemaining: Math.max(0, s.timeRemaining - 1) })),
  setSubmitting: (v) => set({ isSubmitting: v }),
}));
