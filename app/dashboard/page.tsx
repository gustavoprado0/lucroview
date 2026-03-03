import { prisma } from "@/app/src/lib/prisma";


export default async function TransactionsPage() {
  // Busca o primeiro usuário do banco diretamente no Server Component
  const user = await prisma.user.findFirst();

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Minhas Transações</h1>
        <p>Nenhum usuário encontrado no banco de dados.</p>
      </div>
    );
  }

  // Busca as transações do usuário diretamente via Prisma (sem fetch)
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-8">
      {/* Dados do usuário */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-1">Usuário</h2>
        <p><span className="font-medium">Nome:</span> {user.name}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
      </div>

      <h1 className="text-2xl font-bold mb-4">Minhas Transações</h1>

      {transactions.length === 0 ? (
        <p>Nenhuma transação encontrada.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Data</th>
              <th className="border p-2 text-left">Tipo</th>
              <th className="border p-2 text-left">Categoria</th>
              <th className="border p-2 text-left">Descrição</th>
              <th className="border p-2 text-left">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="border p-2">
                  {new Date(tx.date).toLocaleDateString("pt-BR")}
                </td>
                <td className="border p-2">{tx.type}</td>
                <td className="border p-2">{tx.category}</td>
                <td className="border p-2">{tx.description || "-"}</td>
                <td className="border p-2">
                  {tx.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}