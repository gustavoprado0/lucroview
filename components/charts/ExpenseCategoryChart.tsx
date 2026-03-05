"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Props = {
  categoryData: any[];
  tooltipStyle: any;
};

export function ExpenseCategoryChart({ categoryData, tooltipStyle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Top categorias</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
            Sem despesas ainda
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                className="stroke-muted"
              />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />

              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                width={80}
              />

              <Tooltip contentStyle={tooltipStyle} />

              <Bar
                dataKey="value"
                fill="#ef4444"
                radius={[0, 8, 8, 0]}
                name="Valor"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}