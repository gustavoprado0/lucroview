import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
  }

  const goals = await prisma.financialGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ goals });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const goal = await prisma.financialGoal.create({
    data: {
      userId: body.userId,
      name: body.name,
      target: Number(body.target),
      saved: 0,
      deadline: body.deadline ? new Date(body.deadline) : null,
    },
  });

  return NextResponse.json(goal);
}