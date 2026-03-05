"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Props = {
  chartData: any[];
  tooltipStyle: any;
};

export function IncomeExpenseChart({ chartData, tooltipStyle }: Props) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Receitas vs Despesas</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              width={48}
            />

            <Tooltip contentStyle={tooltipStyle} />

            <Legend wrapperStyle={{ fontSize: 12 }} />

            <Area
              type="monotone"
              dataKey="Receitas"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorIncome)"
            />

            <Area
              type="monotone"
              dataKey="Despesas"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}