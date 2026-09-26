import { type State, type TariffId, TRIAL_DAYS } from "@/lib/store"

// Пробный период и честные подсказки об истечении.
// Правило: всё, что показываем пользователю, считаем по реальным данным стора —
// никаких выдуманных «осталось мест» и таймеров.

export { TRIAL_DAYS }

/** Сколько полных дней осталось до конца оплаченного периода. null — бессрочно. */
export function daysLeft(until: number | null): number | null {
  if (!until) return null
  return Math.max(0, Math.ceil((until - Date.now()) / 86_400_000))
}

/** Пробный доступен: аккаунт есть, ещё не брал, сейчас не на платном. */
export function canStartTrial(s: Pick<State, "trialUsed" | "tariff">, hasSession: boolean): boolean {
  return hasSession && !s.trialUsed && s.tariff === "free"
}

/** Осталось ≤ 2 дней — пора честно предупредить. */
export const ENDING_SOON_DAYS = 2
export function isEndingSoon(until: number | null): boolean {
  const d = daysLeft(until)
  return d !== null && d <= ENDING_SOON_DAYS
}

/**
 * Чем пользователь реально пользовался на платном тарифе.
 * Только ненулевые счётчики из стора — не расписываем то, чего не было.
 */
export type UsageItem = { key: string; n: number }
export function usageDuringPlus(s: State): UsageItem[] {
  const steps = Object.values(s.progress).filter(Boolean).length
  return [
    { key: "tr.u.reports", n: s.reports.length },
    { key: "tr.u.steps", n: steps },
    { key: "tr.u.apps", n: s.apps.length },
    { key: "tr.u.exams", n: s.examResults.length },
  ].filter((x) => x.n > 0)
}

/** Что закрывается при возврате на Free — ровно те функции, что реально платные. */
export const LOCKED_ON_FREE = ["tr.l.unis", "tr.l.phases", "tr.l.globe", "tr.l.exam", "tr.l.essay", "tr.l.tracker"] as const

/** Ярлык тарифа для полосы состояния. */
export const tariffIsTrial = (t: TariffId, until: number | null) => t === "plus" && until !== null
