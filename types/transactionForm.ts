export type TransactionForm = {
    type: "income" | "expense";
    amount: string;
    category: string;
    description: string;
    date: string;
  };