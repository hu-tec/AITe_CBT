"use client";

import { useActionState, useState } from "react";
import { createCategory, deleteCategory, type CategoryState } from "@/app/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type CategoryWithCount = {
  id: string;
  name: string;
  parentId: string | null;
  _count: { questions: number };
  children: { id: string; name: string; _count: { questions: number } }[];
};

export function CategoryManager({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  const [state, formAction, isPending] = useActionState<CategoryState, FormData>(
    createCategory,
    {}
  );
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    setDeleteError(null);
    const result = await deleteCategory(id);
    if (result.error) {
      setDeleteError(result.error);
    }
    setDeleting(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="mb-4 text-lg font-semibold">새 카테고리 추가</h3>
        <form action={formAction} className="space-y-3">
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <Input
            id="name"
            name="name"
            label="카테고리명"
            placeholder="예: AI 기초"
            required
          />
          <select
            name="parentId"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">상위 카테고리 없음 (최상위)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={isPending}>
            {isPending ? "추가 중..." : "카테고리 추가"}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">카테고리 목록</h3>
        {deleteError && (
          <p className="mb-3 text-sm text-red-600">{deleteError}</p>
        )}
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">카테고리가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({cat._count.questions}문제)
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    className="text-xs px-2 py-1"
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                  >
                    {deleting === cat.id ? "..." : "삭제"}
                  </Button>
                </div>
                {cat.children.length > 0 && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {cat.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm"
                      >
                        <div>
                          {child.name}
                          <span className="ml-2 text-xs text-gray-500">
                            ({child._count.questions}문제)
                          </span>
                        </div>
                        <Button
                          variant="danger"
                          className="text-xs px-2 py-1"
                          onClick={() => handleDelete(child.id)}
                          disabled={deleting === child.id}
                        >
                          삭제
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
