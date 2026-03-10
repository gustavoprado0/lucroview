import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { Transaction } from "@/types/transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const transactionsFromDb = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const serialized: Transaction[] = transactionsFromDb.map(
    (tx: typeof transactionsFromDb[number]) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      description: tx.description ?? null,
      category: tx.category,
      type: tx.type === "income" ? "income" : "expense",
      amount: tx.amount,
    })
  );

  return (
    <main>
      <DashboardClient
        user={{
          id: user.id,
          name: user.name ?? "Usuário",
          email: user.email,
          image: user.image ?? null, 
        }}
        transactions={serialized}
      />
    </main>
  );
}