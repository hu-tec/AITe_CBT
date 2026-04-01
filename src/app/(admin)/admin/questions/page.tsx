import Link from "next/link";
import { getQuestions } from "@/app/actions/questions";
import { getAllCategories } from "@/app/actions/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionList } from "@/components/admin/question-list";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "객관식(단일)",
  MULTIPLE_SELECT: "객관식(복수)",
  SHORT_ANSWER: "단답형",
  TRUE_FALSE: "O/X",
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const categoryId = params.categoryId;
  const type = params.type;
  const difficulty = params.difficulty ? parseInt(params.difficulty) : undefined;
  const search = params.search;
  const page = params.page ? parseInt(params.page) : 1;

  const [{ questions, total, totalPages }, categories] = await Promise.all([
    getQuestions({ categoryId, type, difficulty, search, page }),
    getAllCategories(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">문제 관리</h2>
        <Link href="/admin/questions/new">
          <Button>문제 등록</Button>
        </Link>
      </div>

      <Card className="mb-4">
        <form className="flex flex-wrap gap-3">
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={type ?? ""}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">전체 유형</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            name="difficulty"
            defaultValue={difficulty?.toString() ?? ""}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">전체 난이도</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>{"★".repeat(d)}</option>
            ))}
          </select>
          <input
            name="search"
            type="text"
            defaultValue={search ?? ""}
            placeholder="문제 검색..."
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <Button type="submit" variant="secondary" className="text-sm">
            검색
          </Button>
        </form>
      </Card>

      <QuestionList questions={questions} />

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>총 {total}개</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/questions?page=${page - 1}`}>
              <Button variant="ghost" className="text-sm">이전</Button>
            </Link>
          )}
          <span className="px-2 py-1">{page} / {totalPages || 1}</span>
          {page < totalPages && (
            <Link href={`/admin/questions?page=${page + 1}`}>
              <Button variant="ghost" className="text-sm">다음</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
