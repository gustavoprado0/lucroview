import { prisma } from "@/app/src/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import DashboardClient from "./DashboardClient";
import { Transaction } from "@/types/transaction";

export default async function DashboardPage() {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) redirect("/login");

  const transactionsFromDb = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const serialized: Transaction[] = transactionsFromDb.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString(),
    description: tx.description ?? null,
    category: tx.category,
    type: tx.type === "income" ? "income" : "expense",
    amount: tx.amount,
  }));

  return (
    <main>
      <DashboardClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
        }}
        transactions={serialized}
      />
    </main>
  );
}