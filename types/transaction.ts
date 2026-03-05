export type Transaction = {
    id: string;
    date: string | Date;
    description?: string | null;
    category: string;
    type: "income" | "expense";
    amount: number;
  };