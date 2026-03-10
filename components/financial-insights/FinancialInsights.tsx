"use client";

import SpendingProgress from "./SpendingProgress";
import SmartInsightCard from "./SmartInsightCard";
import FinancialHealthCard from "./FinancialHealthCard";

type Props = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  fmt: (value: number) => string;
};

function calculateInsight(balance: number, totalIncome: number, totalExpense: number) {
  let score = 0;

  if (balance > 0) score += 30;
  else if (balance > -500) score += 15;

  if (totalIncome > 0) {
    const savingsRate = (balance / totalIncome) * 100;
    if (savingsRate >= 30) score += 20;
    else if (savingsRate >= 15) score += 15;
    else if (savingsRate >= 5) score += 8;
  }

  if (totalIncome > 0 && totalExpense < totalIncome * 0.05) score += 15;
  else if (totalIncome > 0 && totalExpense < totalIncome * 0.15) score += 10;
  else if (totalIncome > 0 && totalExpense < totalIncome * 0.30) score += 5;

  if (balance > 1000) score += 10;
  else if (balance > 0) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let message = "";
  if (score >= 85) message = "Excelente gestão financeira. Continue assim.";
  else if (score >= 70) message = "Boa saúde financeira, mas há espaço para melhorar.";
  else if (score >= 50) message = "Atenção: seus gastos estão pressionando seu caixa.";
  else message = "Risco financeiro elevado. Reavalie suas despesas.";

  return { score, message };
}

export function FinancialInsights({ balance, totalIncome, totalExpense, fmt }: Props) {
  const { message } = calculateInsight(balance, totalIncome, totalExpense);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FinancialHealthCard
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        fmt={fmt}
      />
      <SpendingProgress
        totalExpense={totalExpense}
        totalIncome={totalIncome}
        fmt={fmt}
      />
      <SmartInsightCard message={message} />
    </div>
  );
}