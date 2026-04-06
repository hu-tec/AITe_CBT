/**
 * work_studio ↔ AITe_CBT 문제 동기화 서비스
 *
 * work_studio (데이터 창고) 가 master.
 * - importFromWS(): WS → CBT (전체 pull + upsert)
 * - pushToWS(): CBT → WS (단건 push)
 * - deleteFromWS(): WS 측 삭제
 * - fullSync(): 양방향 동기화
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { QuestionType } from "@prisma/client";

// ── 설정 ──

const WS_URL = process.env.WORK_STUDIO_URL || "http://localhost:3000";

// ── 타입 ──

type Option = { label: string; text: string; isCorrect: boolean };

/** work_studio questions 테이블 row */
interface WSRow {
  id: number;
  data: string; // JSON string
  created_at: string;
}

/** work_studio question JSON blob 파싱 결과 */
interface WSQuestion {
  _level_area?: string;
  _level_div?: string;
  _level_grade?: string;
  _field_big?: string;
  _field_mid?: string;
  _field_sm?: string;
  type?: string;
  difficulty?: string;
  points?: string;
  passage?: string;
  question?: string;
  choices?: string;
  answer?: string;
  explanation?: string;
  // CBT 역동기화 시 추가되는 메타
  _cbtId?: string;
  _cbtCategoryPath?: string;
}

// ── 매핑 상수 ──

const CIRCLE_NUMS = ["①", "②", "③", "④", "⑤"];
const LABELS = ["A", "B", "C", "D", "E"];

const WS_TO_CBT_TYPE: Record<string, QuestionType> = {
  "객관식(4지선다)": "MULTIPLE_CHOICE",
  "객관식(5지선다)": "MULTIPLE_CHOICE",
  OX: "TRUE_FALSE",
  "주관식(단답)": "SHORT_ANSWER",
  "주관식(서술)": "SHORT_ANSWER",
  빈칸채우기: "SHORT_ANSWER",
  듣기: "MULTIPLE_CHOICE",
  읽기이해: "MULTIPLE_CHOICE",
};

const CBT_TO_WS_TYPE: Record<string, (optLen: number) => string> = {
  MULTIPLE_CHOICE: (n) => (n <= 4 ? "객관식(4지선다)" : "객관식(5지선다)"),
  MULTIPLE_SELECT: () => "객관식(5지선다)",
  TRUE_FALSE: () => "OX",
  SHORT_ANSWER: () => "주관식(단답)",
};

// ── 변환 유틸 ──

/** "① 보기1\n② 보기2..." → Option[] */
function parseChoices(choicesStr: string, answerStr: string): Option[] {
  if (!choicesStr) return [];
  const lines = choicesStr.split("\n").filter((l) => l.trim());
  const options: Option[] = [];

  for (let i = 0; i < lines.length; i++) {
    // "① 텍스트" 또는 "1. 텍스트" 또는 그냥 텍스트
    const text = lines[i]
      .replace(/^[①②③④⑤]\s*/, "")
      .replace(/^\d+[.)]\s*/, "")
      .trim();
    const label = LABELS[i] || String(i + 1);
    const circleNum = CIRCLE_NUMS[i] || "";
    const numStr = String(i + 1);

    // answer가 ①, 1, A, 또는 텍스트 자체와 매칭되는지 확인
    const ans = (answerStr || "").trim();
    const isCorrect =
      ans === circleNum ||
      ans === numStr ||
      ans === label ||
      ans.toLowerCase() === text.toLowerCase();

    options.push({ label, text, isCorrect });
  }
  return options;
}

/** Option[] → "① 보기1\n② 보기2..." */
function formatChoices(options: Option[]): string {
  return options
    .map((o, i) => `${CIRCLE_NUMS[i] || `(${i + 1})`} ${o.text}`)
    .join("\n");
}

/** Option[] → 정답 circle number */
function formatAnswer(options: Option[]): string {
  const idx = options.findIndex((o) => o.isCorrect);
  return idx >= 0 ? CIRCLE_NUMS[idx] || String(idx + 1) : "";
}

/** 난이도: "상"/"중"/"하" → 1~5 */
function difficultyToNum(d: string): number {
  if (d === "상") return 5;
  if (d === "중") return 3;
  return 1;
}

/** 난이도: 1~5 → "상"/"중"/"하" */
function difficultyToStr(n: number): string {
  if (n >= 4) return "상";
  if (n >= 2) return "중";
  return "하";
}

// ── 카테고리 매핑 ──

/**
 * WS 분류 → CBT Category 찾기/생성
 * 계층: _level_area > _field_big (2단계)
 */
async function findOrCreateCategory(ws: WSQuestion): Promise<string> {
  const topName = ws._level_area || "미분류";
  const childName = ws._field_big || null;

  // 최상위 카테고리
  let top = await prisma.category.findFirst({
    where: { name: topName, parentId: null },
  });
  if (!top) {
    top = await prisma.category.create({ data: { name: topName } });
  }

  if (!childName) return top.id;

  // 하위 카테고리
  let child = await prisma.category.findFirst({
    where: { name: childName, parentId: top.id },
  });
  if (!child) {
    child = await prisma.category.create({
      data: { name: childName, parentId: top.id },
    });
  }
  return child.id;
}

/**
 * CBT Category → WS 분류축 역추출
 */
async function categoryToWS(
  categoryId: string
): Promise<{ _level_area: string; _field_big: string }> {
  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true },
  });
  if (!cat) return { _level_area: "미분류", _field_big: "" };

  if (cat.parent) {
    return { _level_area: cat.parent.name, _field_big: cat.name };
  }
  return { _level_area: cat.name, _field_big: "" };
}

// ── WS API 호출 ──

async function wsGet(path: string) {
  const res = await fetch(`${WS_URL}${path}`);
  if (!res.ok) throw new Error(`WS GET ${path} → ${res.status}`);
  return res.json();
}

async function wsPost(path: string, body: unknown) {
  const res = await fetch(`${WS_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`WS POST ${path} → ${res.status}`);
  return res.json();
}

async function wsPut(path: string, body: unknown) {
  const res = await fetch(`${WS_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`WS PUT ${path} → ${res.status}`);
  return res.json();
}

async function wsDelete(path: string) {
  const res = await fetch(`${WS_URL}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`WS DELETE ${path} → ${res.status}`);
  return res.json();
}

// ── 핵심: WS → CBT 변환 ──

function wsToQuestion(wsData: WSQuestion) {
  const wsType = wsData.type || "주관식(단답)";
  const cbtType = WS_TO_CBT_TYPE[wsType] || "SHORT_ANSWER";

  let options: Option[] | null = null;
  let answer: string | null = null;
  let content = wsData.question || "";

  // 지문이 있으면 content에 포함
  if (wsData.passage) {
    content = `[지문]\n${wsData.passage}\n\n[문제]\n${content}`;
  }

  if (cbtType === "MULTIPLE_CHOICE" || cbtType === "MULTIPLE_SELECT") {
    options = parseChoices(wsData.choices || "", wsData.answer || "");
  } else if (cbtType === "TRUE_FALSE") {
    const ans = (wsData.answer || "").trim().toUpperCase();
    options = [
      { label: "A", text: "O", isCorrect: ans === "O" },
      { label: "B", text: "X", isCorrect: ans === "X" },
    ];
  } else {
    // SHORT_ANSWER
    answer = wsData.answer || null;
  }

  return {
    type: cbtType as QuestionType,
    content,
    options,
    answer,
    explanation: wsData.explanation || null,
    difficulty: difficultyToNum(wsData.difficulty || "중"),
    points: parseInt(wsData.points || "10") || 10,
  };
}

// ── 핵심: CBT → WS 변환 ──

async function questionToWS(question: {
  id: string;
  type: QuestionType;
  content: string;
  options: unknown;
  answer: string | null;
  explanation: string | null;
  difficulty: number;
  points: number;
  categoryId: string;
  wsRaw: string | null;
}): Promise<WSQuestion> {
  // wsRaw가 있으면 기존 분류 메타를 보존
  let base: WSQuestion = {};
  if (question.wsRaw) {
    try {
      base = JSON.parse(question.wsRaw);
    } catch {
      /* ignore */
    }
  }

  const catInfo = await categoryToWS(question.categoryId);
  const opts = (question.options as Option[]) || [];

  // content에서 지문/문제 분리
  let passage = "";
  let questionText = question.content;
  const passageMatch = question.content.match(
    /\[지문\]\n([\s\S]*?)\n\n\[문제\]\n([\s\S]*)/
  );
  if (passageMatch) {
    passage = passageMatch[1];
    questionText = passageMatch[2];
  }

  const typeFn = CBT_TO_WS_TYPE[question.type];
  const wsType = typeFn ? typeFn(opts.length) : "주관식(단답)";

  let choices = "";
  let answer = question.answer || "";
  if (
    question.type === "MULTIPLE_CHOICE" ||
    question.type === "MULTIPLE_SELECT"
  ) {
    choices = formatChoices(opts);
    answer = formatAnswer(opts);
  } else if (question.type === "TRUE_FALSE") {
    const correct = opts.find((o) => o.isCorrect);
    answer = correct?.text || "O";
  }

  return {
    ...base,
    _level_area: base._level_area || catInfo._level_area,
    _level_div: base._level_div || "",
    _level_grade: base._level_grade || "",
    _field_big: base._field_big || catInfo._field_big,
    _field_mid: base._field_mid || "",
    _field_sm: base._field_sm || "",
    type: wsType,
    difficulty: difficultyToStr(question.difficulty),
    points: String(question.points),
    passage,
    question: questionText,
    choices,
    answer,
    explanation: question.explanation || "",
    _cbtId: question.id,
  };
}

// ── 공개 API ──

export type SyncResult = {
  imported: number;
  exported: number;
  errors: string[];
};

/**
 * work_studio → AITe_CBT 전체 import
 * wsId 기준 upsert, WS가 master
 */
export async function importFromWS(): Promise<SyncResult> {
  const result: SyncResult = { imported: 0, exported: 0, errors: [] };

  let rows: WSRow[];
  try {
    rows = await wsGet("/api/questions");
  } catch (e) {
    result.errors.push(`WS 연결 실패: ${e}`);
    return result;
  }

  for (const row of rows) {
    try {
      const wsData: WSQuestion = JSON.parse(row.data);
      const converted = wsToQuestion(wsData);
      const categoryId = await findOrCreateCategory(wsData);
      const prismaData = {
        type: converted.type,
        content: converted.content,
        options: converted.options ?? Prisma.JsonNull,
        answer: converted.answer,
        explanation: converted.explanation,
        difficulty: converted.difficulty,
        points: converted.points,
        categoryId,
        wsRaw: row.data,
        lastSyncAt: new Date(),
      };

      const existing = await prisma.question.findUnique({
        where: { wsId: row.id },
      });

      if (existing) {
        await prisma.question.update({
          where: { wsId: row.id },
          data: prismaData,
        });
      } else {
        await prisma.question.create({
          data: { ...prismaData, wsId: row.id },
        });
      }
      result.imported++;
    } catch (e) {
      result.errors.push(`WS #${row.id}: ${e}`);
    }
  }

  return result;
}

/**
 * CBT → work_studio 단건 push
 * wsId가 있으면 PUT, 없으면 POST
 */
export async function pushToWS(questionId: string): Promise<void> {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question) return;

  const wsData = await questionToWS(question);

  try {
    if (question.wsId) {
      await wsPut(`/api/questions/${question.wsId}`, wsData);
    } else {
      const res = await wsPost("/api/questions", wsData);
      // work_studio returns { success: true, id: N }
      if (res.id) {
        await prisma.question.update({
          where: { id: questionId },
          data: {
            wsId: typeof res.id === "bigint" ? Number(res.id) : res.id,
            wsRaw: JSON.stringify(wsData),
            lastSyncAt: new Date(),
          },
        });
      }
    }
  } catch {
    // 동기화 실패해도 CBT 작업에 영향 없음
  }
}

/**
 * work_studio 측 삭제
 */
export async function deleteFromWS(wsId: number | null): Promise<void> {
  if (!wsId) return;
  try {
    await wsDelete(`/api/questions/${wsId}`);
  } catch {
    // 실패해도 무시
  }
}

/**
 * 양방향 전체 동기화
 * 1) WS → CBT import (master 우선)
 * 2) CBT only (wsId 없는 것) → WS export
 */
export async function fullSync(): Promise<SyncResult> {
  // Phase 1: WS → CBT
  const result = await importFromWS();

  // Phase 2: CBT → WS (wsId 없는 로컬 전용 문제)
  const localOnly = await prisma.question.findMany({
    where: { wsId: null },
  });

  for (const q of localOnly) {
    try {
      const wsData = await questionToWS(q);
      const res = await wsPost("/api/questions", wsData);
      if (res.id) {
        await prisma.question.update({
          where: { id: q.id },
          data: {
            wsId: typeof res.id === "bigint" ? Number(res.id) : res.id,
            wsRaw: JSON.stringify(wsData),
            lastSyncAt: new Date(),
          },
        });
        result.exported++;
      }
    } catch (e) {
      result.errors.push(`CBT ${q.id} export: ${e}`);
    }
  }

  return result;
}
