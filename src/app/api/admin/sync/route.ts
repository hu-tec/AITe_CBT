import { corsJson, corsOptions } from "../cors";
import { importFromWS, fullSync, pushToWS } from "@/lib/ws-sync";

export async function OPTIONS() {
  return corsOptions();
}

/**
 * POST /api/admin/sync
 * body: { mode: "full" | "import" | "push", questionId?: string }
 *
 * - full: 양방향 전체 동기화 (WS→CBT + CBT→WS)
 * - import: WS→CBT 단방향 import
 * - push: 특정 문제 CBT→WS push (questionId 필수)
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode = body.mode || "full";

  if (mode === "push") {
    if (!body.questionId) {
      return corsJson({ error: "questionId required for push mode" }, 400);
    }
    await pushToWS(body.questionId);
    return corsJson({ success: true, mode: "push", questionId: body.questionId });
  }

  const result = mode === "import" ? await importFromWS() : await fullSync();

  return corsJson({ success: true, mode, ...result });
}
