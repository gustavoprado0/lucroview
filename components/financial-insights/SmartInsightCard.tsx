type Props = {
  balance: number;
};

export default function SmartInsight({ balance }: Props) {
  let message = "Seu caixa está equilibrado.";

  if (balance < 0) {
    message = "Seu caixa está negativo. Reduza despesas.";
  }

  if (balance > 5000) {
    message = "Ótimo caixa. Considere investir parte do valor.";
  }

  return (
    <div className="bg-white rounded-xl p-4 border">
      <p className="text-sm text-gray-500">Insight Inteligente</p>

      <p className="text-sm mt-2 text-gray-700">
        {message}
      </p>
    </div>
  );
}