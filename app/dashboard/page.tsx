import { prisma } from "@/app/src/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = decoded.userId;
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-8">
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
                <td className="border p-2">{new Date(tx.date).toLocaleDateString("pt-BR")}</td>
                <td className="border p-2">{tx.type}</td>
                <td className="border p-2">{tx.category}</td>
                <td className="border p-2">{tx.description || "-"}</td>
                <td className="border p-2">
                  {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}