import { prisma } from "@/app/src/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import DashboardClient from "./DashboardClient";

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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const serialized = transactions.map((tx) => ({
    ...tx,
    date: tx.date.toISOString(),
    createdAt: tx.createdAt.toISOString(),
  }));

  return (
    <main>
      <DashboardClient user={{ id: user.id, name: user.name, email: user.email }} transactions={serialized} />
    </main>
  );
}