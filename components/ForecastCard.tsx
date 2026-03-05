"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Forecast = {
  avgIncome: number;
  avgExpense: number;
  nextBalance: number;
};

type Props = {
  forecast: Forecast | null;
  fmt: (value: number) => string;
};

export default function ForecastCard({ forecast, fmt }: Props) {
  if (!forecast) return null;

  const isPositive = forecast.nextBalance >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Previsão Financeira
        </CardTitle>

        <CardDescription>
          Baseado no seu histórico financeiro
        </CardDescription>
      </CardHeader>

      <CardContent>

        <div className="space-y-3">

          <p className="text-sm text-gray-600">
            Receita média mensal:
            <span className="font-semibold text-green-600 ml-1">
              {fmt(forecast.avgIncome)}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            Despesa média mensal:
            <span className="font-semibold text-red-600 ml-1">
              {fmt(forecast.avgExpense)}
            </span>
          </p>

          <div className="pt-2 border-t border-gray-200">

            <p className="text-sm text-gray-500 mb-1">
              Previsão para o próximo mês
            </p>

            <div className="flex items-center gap-3">

              <span
                className={`text-3xl font-bold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {fmt(forecast.nextBalance)}
              </span>

              {isPositive ? (
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              )}

            </div>

          </div>

        </div>

      </CardContent>
    </Card>
  );
}