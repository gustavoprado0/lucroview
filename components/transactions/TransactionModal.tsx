"use client";

import { CalendarIcon, DollarSign, TrendingDown } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

dayjs.locale("pt-br");

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

function formatPretty(date?: string) {
  if (!date) return null;

  const d = dayjs(date);

  if (!d.isValid()) return null;

  return d.format("D [de] MMMM [de] YYYY");
}

function stringToDate(date?: string) {
  if (!date) return undefined;

  const d = dayjs(date);

  if (!d.isValid()) return undefined;

  return d.toDate();
}

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
                setForm((f) => ({
                  ...f,
                  type: opt.value as "income" | "expense",
                  category: "",
                }))
              }
              className={`py-2.5 cursor-pointer rounded-xl text-sm font-medium transition border flex items-center justify-center gap-2
              ${form.type === opt.value
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
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((c) => (
                <SelectItem className="cursor-pointer" key={c} value={c}>
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />

                {form.date
                  ? formatPretty(form.date)
                  : "Selecionar data"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={stringToDate(form.date)}
                onSelect={(date) => {
                  if (!date) return;

                  const formatted = dayjs(date).format("YYYY-MM-DD");

                  setForm((f) => ({
                    ...f,
                    date: formatted,
                  }));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            className="cursor-pointer bg-green-500 hover:bg-green-600"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}