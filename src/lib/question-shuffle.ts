// Seeded PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function fisherYates<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type Option = { label: string; text: string; isCorrect: boolean };

export type ShuffledQuestion = {
  id: string;
  type: string;
  content: string;
  options: Option[] | null;
  difficulty: number;
  points: number;
  categoryId: string;
  order: number;
};

export function shuffleExam(
  questions: {
    id: string;
    type: string;
    content: string;
    options: unknown;
    difficulty: number;
    points: number;
    categoryId: string;
  }[],
  seed: string,
  shuffleQuestions: boolean,
  shuffleOptions: boolean
): ShuffledQuestion[] {
  const rng = mulberry32(seedFromString(seed));

  let ordered = questions.map((q, i) => ({ ...q, order: i + 1 }));

  if (shuffleQuestions) {
    ordered = fisherYates(ordered, rng);
  }

  return ordered.map((q, i) => {
    let options = q.options as Option[] | null;
    if (shuffleOptions && options && options.length > 0) {
      options = fisherYates(options, rng);
    }
    return { ...q, options, order: i + 1 };
  });
}
