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

    ...(saved !== undefined
      ? [
          prisma.transaction.updateMany({
            where: {
              userId: goal.userId,
              category: "Objetivo",
              description: {
                contains: goal.name,
              },
            },
            data: {
              amount: Number(saved),
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