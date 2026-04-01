"use client";

import { startAttempt } from "@/app/actions/attempts";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ExamStartButton({
  examId,
  inProgress,
}: {
  examId: string;
  inProgress: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    await startAttempt(examId);
  }

  return (
    <Button
      onClick={handleStart}
      disabled={loading}
      className="shrink-0"
    >
      {loading ? "..." : inProgress ? "이어하기" : "응시하기"}
    </Button>
  );
}
