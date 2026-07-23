"use client";

import { useSyncExternalStore } from "react";

/** Prova objetiva: 11/10/2026 (horário do Maranhão, UTC-3). */
const EXAM_DATE_MS = Date.parse("2026-10-11T00:00:00-03:00");

const DAY_MS = 24 * 60 * 60 * 1000;

function subscribe() {
  return () => {};
}

function getDays(): number {
  return Math.max(0, Math.ceil((EXAM_DATE_MS - Date.now()) / DAY_MS));
}

function getServerDays(): null {
  return null;
}

/**
 * Contador de dias até a prova. Client-only (a landing é estática;
 * calcular no servidor congelaria o valor no build). No SSR renderiza
 * um placeholder; após a hidratação, o valor real.
 */
export function DaysUntilExam() {
  const days = useSyncExternalStore(subscribe, getDays, getServerDays);

  if (days === null) {
    return <span aria-hidden>—</span>;
  }
  return <>{days}</>;
}
