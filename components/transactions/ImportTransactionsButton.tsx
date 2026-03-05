"use client";

import { Transaction } from "@/types/transaction";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "../ui/input";

type Props = {
  userId: string;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

export default function ImportTransactionsButton({
  userId,
  setTransactions,
  setPage,
}: Props) {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`${data.createdCount} transações importadas com sucesso!`);

        const fetched = await fetch(`/api/transactions?userId=${userId}`);
        const updated = await fetched.json();

        setTransactions(updated.transactions || []);
        setPage(1);
      } else {
        toast.error(data.error || "Erro ao importar transações");
      }
    } catch {
      toast.error("Erro ao processar arquivo");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <label className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap">
      <Plus className="w-4 h-4" />
      Importar CSV
      <Input
        type="file"
        accept=".csv,.ofx"
        className="hidden"
        onChange={handleImport}
      />
    </label>
  );
}