"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface Insight {
  score: number;
  message: string;
}

export function FinancialInsights() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadInsight() {
    try {
      const res = await fetch("/api/insights", {
        credentials: "include",
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setInsight(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generateInsight() {
    setLoading(true);

    await fetch("/api/insights", {
      method: "POST",
      credentials: "include",
    });

    await loadInsight();
  }

  useEffect(() => {
    loadInsight();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 p-6 rounded-xl text-white">
        Carregando insights...
      </div>
    );
  }

  if (!insight) {
    return (
      <Card className="bg-slate-900 p-6 rounded-xl text-white">
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
    <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        Score Financeiro do Mês
      </h2>

      <div className="text-4xl font-bold mb-4">
        {insight.score}/100
      </div>

      <p className="text-slate-300 mb-6">
        {insight.message}
      </p>

      <Button
        onClick={generateInsight}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg cursor-pointer"
      >
        Atualizar Insight
      </Button>
    </div>
  );
}