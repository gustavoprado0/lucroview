import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();

  const { name, target, deadline, saved } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const goal = await prisma.financialGoal.findUnique({
    where: { id },
  });

  if (!goal) {
    return NextResponse.json(
      { error: "Objetivo não encontrado" },
      { status: 404 }
    );
  }

  let diff = 0;

  if (saved !== undefined) {
    diff = Number(saved) - goal.saved;
  }

  await prisma.$transaction([
    prisma.financialGoal.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(target && { target: Number(target) }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(`${deadline}T00:00:00`) : null,
        }),
        ...(saved !== undefined && { saved: Number(saved) }),
      },
    }),

    ...(diff !== 0
      ? [
        prisma.transaction.create({
          data: {
            userId: goal.userId,
            type: diff > 0 ? "expense" : "income",
            amount: Math.abs(diff),
            category: "Objetivo",
            description: `Ajuste manual objetivo: ${goal.name}`,
            date: new Date(),
          },
        }),
      ]
      : []),
  ]);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const goal = await prisma.financialGoal.findUnique({
    where: { id },
  });

  if (!goal) {
    return NextResponse.json(
      { error: "Objetivo não encontrado" },
      { status: 404 }
    );
  }

  await prisma.$transaction([
    prisma.transaction.deleteMany({
      where: {
        category: "Objetivo",
        description: { contains: goal.name },
      },
    }),
    prisma.financialGoal.delete({
      where: { id },
    }),
  ]);

  return NextResponse.json({ success: true });
}