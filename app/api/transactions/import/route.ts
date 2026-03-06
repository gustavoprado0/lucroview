import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/src/lib/prisma";
import { parse as csvParse } from "csv-parse/sync";
import { parse as parseOFX } from "ofx-parser";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

// --- Mapa de categorias por palavras-chave ---
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Transporte: ["uber", "99", "taxi", "metrô", "ônibus"],
  Alimentação: ["mc donald", "burger king", "restaurante", "pizza", "padaria", "mercado"],
  Saúde: ["farmácia", "drogasil", "droga raia", "hospital", "consulta"],
  Lazer: ["cinema", "spotify", "netflix", "ingresso", "theater"],
  Compras: ["amazon", "americanas", "submarino", "magalu", "mercado livre"],
  Educação: ["escola", "curso", "udemy", "cursos online"],
  Moradia: ["aluguel", "condomínio", "iptu", "energia", "água"],
};

function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return "Outros"; // caso não encontre correspondência
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file)
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

    if (!userId)
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });

    let transactions: any[] = [];
    const fileName = file.name.toLowerCase();

    // ================= PDF =================
    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      const lines = data.text.split("\n");

      let currentYear = new Date().getFullYear();
      const headerYearMatch = data.text.match(/20\d{2}/);
      if (headerYearMatch) currentYear = parseInt(headerYearMatch[0]);

      const monthMap: any = {
        JAN: "01", FEV: "02", MAR: "03", ABR: "04",
        MAI: "05", JUN: "06", JUL: "07", AGO: "08",
        SET: "09", OUT: "10", NOV: "11", DEZ: "12"
      };

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;
        if (trimmed.toUpperCase().includes("SALDO")) continue;

        const valueMatch = trimmed.match(/-?\d{1,3}(?:\.\d{3})*,\d{2}/);
        if (!valueMatch) continue;

        const rawAmount = valueMatch[0];
        const amount = parseAmount(rawAmount);

        let date: Date | null = null;

        const fullDate = trimmed.match(/\d{2}\/\d{2}\/\d{4}/);
        if (fullDate) date = parseDate(fullDate[0]);

        const shortDate = trimmed.match(/\d{2}\/\d{2}/);
        if (!date && shortDate) {
          const [day, month] = shortDate[0].split("/");
          date = new Date(`${currentYear}-${month}-${day}`);
        }

        const textDate = trimmed.match(/(\d{2})\s([A-Z]{3})/i);
        if (!date && textDate) {
          const day = textDate[1];
          const monthText = textDate[2].toUpperCase();
          const month = monthMap[monthText];
          if (month) date = new Date(`${currentYear}-${month}-${day}`);
        }

        if (!date || isNaN(date.getTime())) continue;

        let description = trimmed.replace(rawAmount, "")
                                 .replace(/\d{2}\/\d{2}\/\d{4}/, "")
                                 .replace(/\d{2}\/\d{2}/, "")
                                 .replace(/(\d{2})\s([A-Z]{3})/i, "")
                                 .trim();

        if (!description) continue;

        transactions.push({
          type: amount >= 0 ? "income" : "expense",
          amount: Math.abs(amount),
          category: categorizeTransaction(description),
          description,
          date,
          userId,
          imported: true,
        });
      }
    }

    // ================= CSV =================
    else if (fileName.endsWith(".csv")) {
      const content = await file.text();
      const records = csvParse(content, { columns: true, skip_empty_lines: true, bom: true });

      transactions = (records || [])
        .filter((r: any) => {
          const valor = r["Valor"] ?? r["amount"];
          const data = r["Data"] ?? r["date"];
          return valor && data;
        })
        .map((r: any) => {
          const amount = parseAmount(r["Valor"] ?? r["amount"]);
          const type = amount >= 0 ? "income" : "expense";

          const description =
            r["Descrição"] ?? r["descricao"] ?? r["description"] ??
            r["Histórico"] ?? r["historico"] ?? r["memo"] ??
            r["lançamento"] ?? r["lancamento"] ?? "Importado CSV";

          return {
            type,
            amount: Math.abs(amount),
            category: categorizeTransaction(description),
            description,
            date: parseDate(r["Data"] ?? r["date"]),
            userId,
            imported: true,
          };
        });
    }

    // ================= OFX =================
    else if (fileName.endsWith(".ofx")) {
      const content = await file.text();
      const ofxData = parseOFX(content);
      const ofxTransactions = ofxData.transactions ?? ofxData.statement?.transactions ?? [];

      if (!ofxTransactions.length)
        return NextResponse.json({ error: "Nenhuma transação válida encontrada no OFX" }, { status: 400 });

      transactions = ofxTransactions
        .filter((t: any) => t.amount !== undefined && t.date)
        .map((t: any) => ({
          type: t.amount >= 0 ? "income" : "expense",
          amount: Math.abs(t.amount),
          category: categorizeTransaction(t.memo ?? t.name ?? "Importado OFX"),
          description: t.memo ?? t.name ?? "Importado OFX",
          date: new Date(t.date),
          userId,
          imported: true,
        }));
    }

    else {
      return NextResponse.json(
        { error: "Formato não suportado. Envie .pdf, .csv ou .ofx" },
        { status: 400 }
      );
    }

    // ================= Filtrando transações válidas =================
    transactions = transactions.filter(
      (t) => !isNaN(t.amount) && t.amount > 0 && t.date instanceof Date && !isNaN(t.date.getTime())
    );

    if (!transactions.length)
      return NextResponse.json({ error: "Nenhuma transação válida encontrada" }, { status: 400 });

    // ================= Salvando no banco =================
    for (const tx of transactions) {
      const exists = await prisma.transaction.findFirst({
        where: { userId, amount: tx.amount, date: tx.date, description: tx.description },
      });

      if (!exists) await prisma.transaction.create({ data: tx });
    }

    return NextResponse.json({
      message: "Importação concluída com sucesso",
      createdCount: transactions.length,
    });

  } catch (error: any) {
    console.error("Erro ao importar:", error);
    return NextResponse.json({ error: "Erro interno ao importar transações" }, { status: 500 });
  }
}

// ================= Funções auxiliares =================
function parseAmount(value: string): number {
  if (!value) return 0;
  const v = value.toString().trim();
  if (v.includes(",") && v.includes(".")) return parseFloat(v.replace(/\./g, "").replace(",", "."));
  if (v.includes(",") && !v.includes(".")) return parseFloat(v.replace(",", "."));
  return parseFloat(v);
}

function parseDate(raw: string): Date {
  if (!raw) return new Date("invalid");
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw.trim())) {
    const [day, month, year] = raw.trim().split("/");
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date(raw.trim());
}