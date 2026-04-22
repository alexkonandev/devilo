"use server";

import { prisma } from "@/lib/prisma";

/**
 * Recherche de clients filtrée par userId
 */
export async function searchClients(query: string, userId: string) {
  if (!query.trim()) {
    return [];
  }

  const clients = await prisma.client.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return clients;
}

/**
 * Métriques client : Encours et Santé
 * Encours = somme des devis non payés (DRAFT, SENT, ACCEPTED)
 * Santé = À Jour si pas de retard, sinon Retard
 */
export async function getClientMetrics(clientId: string, userId: string) {
  const quotes = await prisma.quote.findMany({
    where: {
      clientId,
      userId,
      status: { in: ["DRAFT", "SENT", "ACCEPTED"] },
    },
    include: {
      lines: true,
    },
  });

  // Calcul de l'encours (somme des unitPrice * quantity des lignes)
  const outstanding = quotes.reduce((total, quote) => {
    const quoteTotal = quote.lines.reduce(
      (lineTotal, line) => lineTotal + line.unitPrice * line.quantity,
      0,
    );
    return total + quoteTotal;
  }, 0);

  // Détermination de la santé (pour l'instant basé sur le statut des quotes)
  // On pourrait ajouter une logique de retard basée sur les dates d'échéance
  const hasOverdue = quotes.some(
    (quote) => quote.status === "SENT" || quote.status === "ACCEPTED",
  );
  const health = hasOverdue ? "RETARD" : "À JOUR";

  return {
    outstanding,
    health,
  };
}

/**
 * Historique Express : 5 dernières QuoteLines uniques de ce client
 */
export async function getClientHistory(clientId: string, userId: string) {
  const quotes = await prisma.quote.findMany({
    where: {
      clientId,
      userId,
    },
    include: {
      lines: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Extraire toutes les lignes et prendre les 5 premières uniques par titre
  const allLines = quotes.flatMap((quote) => quote.lines);
  const uniqueLines = new Map();

  for (const line of allLines) {
    if (!uniqueLines.has(line.title)) {
      uniqueLines.set(line.title, line);
    }
    if (uniqueLines.size >= 5) break;
  }

  return Array.from(uniqueLines.values()).slice(0, 5);
}

/**
 * Catalogue personnel de l'utilisateur
 */
export async function getCatalogOffers(userId: string) {
  const offers = await prisma.catalogOffer.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return offers;
}

/**
 * Services personnalisés de l'utilisateur
 */
export async function getUserServices(userId: string) {
  const services = await prisma.userService.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return services;
}
