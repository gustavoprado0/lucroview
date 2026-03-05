type Props = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  fmt: (value: number) => string;
};

export default function Health({ balance, totalIncome, totalExpense, fmt }: Props) {
  const health = totalIncome === 0 ? 0 : (balance / totalIncome) * 100;

  return (
    <div className="bg-white rounded-xl p-4 border">
      <p className="text-sm text-gray-500">Saúde Financeira</p>

      <p className="text-2xl font-bold mt-1">
        {health.toFixed(0)}%
      </p>

      <p className="text-xs text-gray-500 mt-1">
        Quanto sobra da sua receita após despesas
      </p>
    </div>
  );
}