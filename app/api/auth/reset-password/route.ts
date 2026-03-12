import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  if (tokenRecord.expires < new Date()) {
    return NextResponse.json({ error: "Token expirado" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: tokenRecord.identifier },
    data: { password: hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  return NextResponse.json({ success: true });
}