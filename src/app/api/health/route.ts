import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health check (roadmap 7.3): verifica app + conexão com o banco.
 * 200 = saudável · 503 = banco indisponível.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "up",
      latencyMs: Date.now() - startedAt,
      ts: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", db: "down", ts: new Date().toISOString() },
      { status: 503 },
    );
  }
}
