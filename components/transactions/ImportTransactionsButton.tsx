"use client";

import { Transaction } from "@/types/transaction";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPollingPaused: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ImportTransactionsButton({
  userId,
  setTransactions,
  setPage,
  setPollingPaused,
}: Props) {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    // Pausa o polling para não aparecer dados parciais
    setPollingPaused(true);

    const toastId = toast.loading("Importando transações...");

    try {
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Busca TODOS os dados atualizados antes de mostrar
        const fetched = await fetch(`/api/transactions?userId=${userId}`);
        const updated = await fetched.json();

        // Primeiro atualiza os dados...
        setTransactions(updated.transactions || []);
        setPage(1);

        // ...depois mostra o toast de sucesso
        toast.update(toastId, {
          render: `${data.createdCount} transações importadas com sucesso!`,
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        toast.update(toastId, {
          render: data.error || "Erro ao importar transações",
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      }
    } catch {
      toast.update(toastId, {
        render: "Erro ao processar arquivo",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      e.target.value = "";
      // Retoma o polling após 2 segundos
      setTimeout(() => setPollingPaused(false), 2000);
    }
  };

  return (
    <label className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap">
      <Plus className="w-4 h-4" />
      Importar CSV
      <input
        type="file"
        accept=".csv,.ofx,.pdf"
        className="hidden"
        onChange={handleImport}
      />
    </label>
  );
}