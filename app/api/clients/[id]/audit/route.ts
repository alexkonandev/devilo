import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePdf } from "@/lib/pdf-engine";
import { generateAuditHtml } from "@/features/clients/audit-template";
import { ClientListItem } from "@/types/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: clientId } = await params;

    // 1. Fetch avec le bon nom de relation : 'lines'
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        quotes: {
          include: {
            lines: true, // C'est 'lines' dans ton schéma, pas 'items'
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) return new NextResponse("CLIENT_NOT_FOUND", { status: 404 });

    // 2. Calcul financier précis (Stratégie Profit)
    const quotesWithAmount = client.quotes.map((q) => {
      // Calcul du Total HT (Somme des lignes)
      const subtotalHT = q.lines.reduce(
        (sum: number, line) => sum + line.unitPrice * line.quantity,
        0,
      );

      // Calcul net (HT - Remise + TVA)
      const totalHT = subtotalHT - q.discount;
      const totalTTC = totalHT * (1 + q.vatRatePercent / 100);

      return {
        id: q.id,
        number: q.number,
        totalAmount: Math.round(totalTTC), // On arrondit pour un audit propre
        status: q.status,
        createdAt: q.createdAt,
      };
    });

    // 3. Mapping vers ton interface ClientListItem
    const clientData: ClientListItem = {
      id: client.id,
      name: client.name,
      email: client.email,
      taxId: client.taxId,
      address: client.address,
      createdAt: client.createdAt,
      quotes: quotesWithAmount,
      totalSpent: quotesWithAmount.reduce(
        (sum: number, q) => sum + q.totalAmount,
        0,
      ),
      quoteCount: quotesWithAmount.length,
    };

    // 4. Génération PDF
    const html = generateAuditHtml(clientData);
    const pdfBuffer = await generatePdf(html);

    const safeFileName = encodeURIComponent(
      `AUDIT_${client.name.replace(/\s+/g, "_").toUpperCase()}.pdf`,
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${safeFileName}`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[AUDIT_ERROR]:", error);
    return new NextResponse("INTERNAL_SERVER_ERROR", { status: 500 });
  }
}
