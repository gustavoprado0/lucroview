type Props = {
  totalExpense: number;
  totalIncome: number;
  fmt: (value: number) => string;
};

export default function Spending({ totalExpense, totalIncome, fmt }: Props) {
  const ratio = totalIncome === 0 ? 0 : (totalExpense / totalIncome) * 100;

  return (
    <div className="bg-white rounded-xl p-4 border">
      <p className="text-sm text-gray-500">Gastos sobre Receita</p>

      <p className="text-2xl font-bold mt-1">
        {ratio.toFixed(0)}%
      </p>

      <p className="text-xs text-gray-500 mt-1">
        {fmt(totalExpense)} de {fmt(totalIncome)}
      </p>
    </div>
  );
}