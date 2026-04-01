import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "../cors";

export async function OPTIONS() { return corsOptions(); }

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { name: "asc" },
  });
  return corsJson(categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const category = await prisma.category.create({
    data: { name: body.name, parentId: body.parentId || null },
  });
  return corsJson(category, 201);
}
