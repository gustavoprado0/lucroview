import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount, category, description, date, userId } = body;

    if (!type || amount == null || !category || !userId) {
      return NextResponse.json(
        { error: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    const transactionDate = date ? new Date(date + "T00:00:00") : new Date();
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        description,
        date: transactionDate,
        userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/transactions error:", error);

    const message = error?.message || "Failed to create transaction";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, amount, category, description, date } = body;

    if (!id) {
      return NextResponse.json({ error: "Transaction id required" }, { status: 400 });
    }

    const transactionDate = date ? new Date(date) : undefined;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        category,
        description,
        date: transactionDate,
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Transaction id required" }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}