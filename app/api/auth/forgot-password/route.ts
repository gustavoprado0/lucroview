import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 3600000),
    },
  });
  
  await sendResetPasswordEmail(email, token);
  console.log("EMAIL ENVIADO PARA:", email);

  const origin = new URL(req.url).origin;

  const resetLink = `${origin}/reset-password?token=${token}`;

  console.log("LINK RESET:", resetLink);

  return NextResponse.json({ success: true });
}