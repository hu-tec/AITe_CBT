"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">오류가 발생했습니다</h2>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        <Button onClick={reset} className="mt-4">
          다시 시도
        </Button>
      </div>
    </div>
  );
}
