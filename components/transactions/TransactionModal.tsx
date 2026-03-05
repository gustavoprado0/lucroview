"use client";

import { DollarSign, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormType = {
  type: "income" | "expense";
  amount: string;
  category: string;
  description: string;
  date: string;
};

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  form: FormType;
  setForm: React.Dispatch<React.SetStateAction<FormType>>;
  loading: boolean;
  handleSubmit: () => void;
  categories: string[];
};

export default function CreateTransactionModal({
  open,
  setOpen,
  form,
  setForm,
  loading,
  handleSubmit,
  categories,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "income", label: "Receita", icon: <DollarSign className="w-4 h-4" /> },
            { value: "expense", label: "Despesa", icon: <TrendingDown className="w-4 h-4" /> },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setForm((f) => ({ ...f, type: opt.value as "income" | "expense" }))
              }
              className={`py-2.5 cursor-pointer rounded-xl text-sm font-medium transition border flex items-center justify-center gap-2
              ${
                form.type === opt.value
                  ? opt.value === "income"
                    ? "bg-green-100 border-green-400 text-green-600"
                    : "bg-red-100 border-red-400 text-red-600"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Valor"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
          />

          <Select
            value={form.category}
            onValueChange={(value) =>
              setForm((f) => ({ ...f, category: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Descrição"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />

          <Input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((f) => ({ ...f, date: e.target.value }))
            }
            className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>

          <Button className="cursor-pointer" onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}