"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  onCreate: () => void;
};

export default function EmptyDashboard({ onCreate }: Props) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-24 text-center">
      <div className="max-w-md space-y-4">

        <h2 className="text-xl font-semibold">
          Nenhuma transação ainda
        </h2>

        <p className="text-gray-600 text-sm">
          Comece registrando sua primeira receita ou despesa para ver
          gráficos, previsões financeiras e insights inteligentes.
        </p>

        <Button
          onClick={onCreate}
          className="mt-4 mx-auto flex items-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Criar primeira transação
        </Button>

      </div>
    </div>
  );
}