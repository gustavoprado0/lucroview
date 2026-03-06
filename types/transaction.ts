export type Transaction = {
    id: string;
    date: string | Date;
    description?: string | null;
    category: string;
    type: "income" | "expense";
    amount: number;
  };

export type TransactionForm = {
    type: "income" | "expense";
    amount: string;
    category: string;
    description: string;
    date: string;
  };