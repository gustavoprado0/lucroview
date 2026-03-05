import { prisma } from "@/app/src/lib/prisma";

export async function generateFinancialInsight(userId: string) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, month, 1),
        lte: new Date(year, month + 1, 0),
      },
    },
  });

  const receitas = transactions
    .filter((t: { type: string; }) => t.type === "Receita")
    .reduce((acc, t) => acc + t.amount, 0);

  const despesas = transactions
    .filter(t => t.type === "Despesa")
    .reduce((acc, t) => acc + t.amount, 0);

  let score = 100;
  let messages: string[] = [];

  if (transactions.length === 0) {
    score = 0;
    messages.push("Nenhuma transação registrada este mês.");
  }

  if (despesas > receitas) {
    score -= 40;
    messages.push("⚠️ Suas despesas estão maiores que suas receitas.");
  }

  if (despesas > receitas * 0.7) {
    score -= 20;
    messages.push("📉 Você está gastando mais de 70% do que ganha.");
  }

  if (receitas > despesas) {
    messages.push("📈 Você está operando com lucro este mês.");
  }

  const insight = await prisma.financialInsight.create({
    data: {
      userId,
      month,
      year,
      score,
      message: messages.join(" "),
    },
  });

  return insight;
}

export async function getLatestInsight(userId: string) {
  return prisma.financialInsight.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}