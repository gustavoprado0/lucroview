type Props = {
  message: string;
};

export default function SmartInsight({ message }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 border">
      <p className="text-sm text-gray-500">Insight Inteligente</p>
      <p className="text-sm mt-2 text-gray-700">{message}</p>
    </div>
  );
}
