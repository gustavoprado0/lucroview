import { Landmark, TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  fmt: (v: number) => string;
};

export function SummaryCards({ balance, totalIncome, totalExpense, fmt }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Saldo atual</p>
          <h3 className="text-2xl font-semibold text-gray-800">
            {fmt(balance)}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Receitas</p>
          <h3 className="text-2xl font-semibold text-gray-800">
            {fmt(totalIncome)}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="bg-[#f3f4f6] rounded-3xl shadow-md px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Despesas</p>
          <h3 className="text-2xl font-semibold text-gray-800">
            {fmt(totalExpense)}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-white" />
        </div>
      </div>

    </div>
  );
}