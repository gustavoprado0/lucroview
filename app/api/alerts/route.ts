import { prisma } from "@/app/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
  }

  try {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar alertas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, message } = body;

  if (!userId || !message) {
    return NextResponse.json({ error: "userId e message são obrigatórios" }, { status: 400 });
  }

  try {
    const alert = await prisma.alert.create({
      data: { userId, message },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar alerta" }, { status: 500 });
  }
}