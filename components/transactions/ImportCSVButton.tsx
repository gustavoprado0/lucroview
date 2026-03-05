import { Plus } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  onImport: () => void;
};

export function ImportCSVButton({ userId, onImport }: Props) {
  return (
    <label className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl text-sm">
      <Plus className="w-4 h-4" />
      Importar CSV

      <input
        type="file"
        accept=".csv,.ofx"
        className="hidden"
        onChange={async (e) => {

          if (!e.target.files?.length) return;

          const file = e.target.files[0];
          const formData = new FormData();

          formData.append("file", file);
          formData.append("userId", userId);

          const res = await fetch("/api/transactions/import", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.ok) {
            toast.success(`${data.createdCount} transações importadas`);
            onImport();
          } else {
            toast.error("Erro ao importar arquivo");
          }

          e.target.value = "";

        }}
      />
    </label>
  );
}