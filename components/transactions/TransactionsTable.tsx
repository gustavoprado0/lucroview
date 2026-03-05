"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Transaction = {
  id: string;
  date: string | Date;
  description?: string | null;
  category: string;
  type: "income" | "expense";
  amount: number;
};

type Props = {
  transactions: Transaction[];
  paginatedTransactions: Transaction[];
  page: number;
  totalPages: number;
  pageInput: string | number;
  setPageInput: (v: any) => void;
  setPage: (fn: (p: number) => number) => void;
  handlePageSubmit: () => void;
  fmt: (value: number) => string;
};

export function TransactionsTable({
  transactions,
  paginatedTransactions,
  page,
  totalPages,
  pageInput,
  setPageInput,
  setPage,
  handlePageSubmit,
  fmt,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>
        <CardDescription>
          {transactions.length} transações no total
        </CardDescription>
      </CardHeader>

      <CardContent>

        <div className="w-full overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedTransactions.map((tx, index) => (
                <TableRow key={`${tx.id}-${index}`}>
                  <TableCell>
                    {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </TableCell>

                  <TableCell>{tx.description || "-"}</TableCell>

                  <TableCell>
                    <Badge variant="secondary">{tx.category}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={tx.type === "income" ? "default" : "destructive"}
                    >
                      {tx.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>

                  <TableCell
                    className={`text-right font-semibold ${tx.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                      }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {fmt(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>


        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">

          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Página {page} de {totalPages}
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center">

            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span>Ir para</span>

              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePageSubmit();
                  }
                }}
                className="w-16 h-8 text-center px-1"
              />

              <span>de {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}