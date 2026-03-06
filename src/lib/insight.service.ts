import { prisma } from "@/src/lib/prisma";
import { Transaction } from "@/types/transaction";

export async function generateFinancialInsight(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
    },
  }) as Transaction[];

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === "income")
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t: Transaction) => t.type === "expense")
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0);

  let score = 100;
  let messages: string[] = [];

  if (transactions.length === 0) {
    score = 0;
    messages.push("Nenhuma transação registrada este mês.");
  }

  if (totalExpense > totalIncome) {
    score -= 40;
    messages.push("⚠️ Suas despesas estão maiores que suas receitas.");
  }

  if (totalExpense > totalIncome * 0.7) {
    score -= 20;
    messages.push("📉 Você está gastando mais de 70% do que ganha.");
  }

  if (totalIncome > totalExpense) {
    messages.push("📈 Você está operando com lucro este mês.");
  }

  const insight = await prisma.financialInsight.create({
    data: {
      userId,
      score,
      message: messages.join(" "),
      month,
      year,
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