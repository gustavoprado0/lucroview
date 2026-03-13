import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { goalId, userId, amount } = await req.json();

        if (!goalId || !userId || !amount) {
            return NextResponse.json(
                { error: "Dados inválidos" },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {

            const goal = await tx.financialGoal.update({
                where: { id: goalId },
                data: {
                    saved: {
                        increment: Number(amount),
                    }
                },
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: "expense",
                    category: "Objetivo",
                    description: `Guardar para objetivo: ${goal.name}`,
                    amount: amount,
                    date: new Date(),
                },
            });

            return goal;
        });

        return NextResponse.json({ goal: result });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao adicionar valor ao objetivo" },
            { status: 500 }
        );
    }
}