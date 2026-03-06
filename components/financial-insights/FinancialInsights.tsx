"use client";

import { useEffect, useState } from "react";
import SpendingProgress from "./SpendingProgress";
import SmartInsightCard from "./SmartInsightCard";
import FinancialHealthCard from "./FinancialHealthCard";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface Insight {
  score: number;
  message: string;
}

type Props = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  fmt: (value: number) => string;
};

export function FinancialInsights({
  balance,
  totalIncome,
  totalExpense,
  fmt,
}: Props) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadInsight() {
    try {
      const res = await fetch("/api/insights", { credentials: "include" });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data: Insight = await res.json();
      setInsight(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generateInsight() {
    setLoading(true);

    try {
      await fetch("/api/insights", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance, totalIncome, totalExpense }),
      });

      await loadInsight();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsight();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-white border">
        Carregando insights...
      </div>
    );
  }

  if (!insight) {
    return (
      <Card className="p-6 rounded-xl border bg-white">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">
            Nenhum insight gerado ainda
          </h2>

          <Button
            onClick={generateInsight}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg cursor-pointer"
          >
            Gerar Insight do Mês
          </Button>
        </CardContent>
      </Card>
    );
  }

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

      <SmartInsightCard message={insight.message} />
    </div>
  );
}