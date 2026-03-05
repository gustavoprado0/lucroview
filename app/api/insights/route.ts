import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/src/lib/prisma";

interface JwtPayload {
  userId: string;
}

function calculateScore(transactions: any[]) {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = income - expense;

  let score = 0;

  /* ===============================
     1️⃣ Saúde do saldo (30)
  =============================== */
  if (balance > 0) {
    score += 30;
  } else if (balance > -500) {
    score += 15;
  }

  /* ===============================
     2️⃣ Taxa de economia (20)
  =============================== */
  if (income > 0) {
    const savingsRate = (balance / income) * 100;

    if (savingsRate >= 30) score += 20;
    else if (savingsRate >= 15) score += 15;
    else if (savingsRate >= 5) score += 8;
  }

  /* ===============================
     3️⃣ Concentração por categoria (20)
  =============================== */
  const expenseByCategory: Record<string, number> = {};

  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseByCategory[t.category] =
        (expenseByCategory[t.category] || 0) + t.amount;
    });

  const highestCategory = Math.max(...Object.values(expenseByCategory), 0);

  if (expense > 0) {
    const concentration = (highestCategory / expense) * 100;

    if (concentration < 40) score += 20;
    else if (concentration < 60) score += 10;
  }

  /* ===============================
     4️⃣ Tendência últimos meses (20)
  =============================== */
  const months: Record<string, number> = {};

  transactions.forEach(tx => {
    const key = tx.date.toISOString().slice(0, 7);

    if (!months[key]) months[key] = 0;

    if (tx.type === "income") months[key] += tx.amount;
    else months[key] -= tx.amount;
  });

  const monthBalances = Object.values(months);

  if (monthBalances.length >= 2) {
    const last = monthBalances[monthBalances.length - 1];
    const previous = monthBalances[monthBalances.length - 2];

    if (last > previous) score += 20;
    else if (last > 0) score += 10;
  }

  /* ===============================
     5️⃣ Segurança de caixa (10)
  =============================== */
  if (balance > 1000) score += 10;
  else if (balance > 0) score += 5;

  /* ===============================
     Limite 0–100
  =============================== */
  score = Math.max(0, Math.min(100, Math.round(score)));

  /* ===============================
     Mensagem dinâmica
  =============================== */
  let message = "";

  if (score >= 85) {
    message = "Excelente gestão financeira. Continue assim.";
  } else if (score >= 70) {
    message = "Boa saúde financeira, mas há espaço para melhorar.";
  } else if (score >= 50) {
    message = "Atenção: seus gastos estão pressionando seu caixa.";
  } else {
    message = "Risco financeiro elevado. Reavalie despesas urgentemente.";
  }

  return { score, message };
}

/* ===============================
   GET - Buscar Insight
=============================== */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const insight = await prisma.financialInsight.findFirst({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    if (!insight) {
      return NextResponse.json(null);
    }

    return NextResponse.json(insight);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao buscar insight" }, { status: 500 });
  }
}

/* ===============================
   POST - Gerar Insight
=============================== */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
    });

    const { score, message } = calculateScore(transactions);

    const insight = await prisma.financialInsight.create({
      data: {
        userId: decoded.userId,
        score,
        message,
      },
    });

    return NextResponse.json(insight);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao gerar insight" }, { status: 500 });
  }
}