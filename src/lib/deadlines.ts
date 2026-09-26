import { UNIS, unisForDir, type Uni } from "@/data/universities"
import { type AnalyzeResult } from "@/lib/profori"
import { type AppItem } from "@/lib/store"

// ╔══════════════════════════════════════════════════════════════════════╗
// ║ ПРАВИЛО: FAIL CLOSED. Никогда не показываем дату, в которой не       ║
// ║ уверены. Если день и месяц не разобрались однозначно, или дата       ║
// ║ дальше 12 месяцев, или источник — текст, сгенерированный моделью, —  ║
// ║ строку НЕ показываем вовсе. Неверный дедлайн на продукте о           ║
// ║ поступлении хуже отсутствующего: из-за него можно пропустить подачу. ║
// ║ Не ослаблять это правило при доработках.                             ║
// ╚══════════════════════════════════════════════════════════════════════╝

const MONTHS: Record<string, number> = {
  янв: 0, фев: 1, мар: 2, апр: 3, май: 4, мая: 4, июн: 5,
  июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11,
}

const MAX_AHEAD_DAYS = 366 // дальше года — не показываем

/**
 * Разбирает человеческую строку дедлайна вида «1 марта», «до 25 августа».
 * Возвращает ближайшую будущую дату или null, если уверенности нет.
 * Строки без числа («октябрь (early)», «Круглый год», «Сезон: осень–весна»)
 * сознательно отбрасываются.
 */
export function parseDeadline(dl: string, now = new Date()): Date | null {
  if (!dl) return null
  const m = /(\d{1,2})\s*([а-яё]{3,})/i.exec(dl)
  if (!m) return null
  const day = parseInt(m[1], 10)
  if (!Number.isFinite(day) || day < 1 || day > 31) return null
  const mon = MONTHS[m[2].slice(0, 3).toLowerCase()]
  if (mon === undefined) return null

  // Годовой дедлайн повторяется — берём ближайшее будущее наступление.
  let d = new Date(now.getFullYear(), mon, day)
  if (d.getTime() <= now.getTime()) d = new Date(now.getFullYear() + 1, mon, day)
  // Проверяем, что дата реальна (напр. «31 февраля» → отбрасываем).
  if (d.getDate() !== day || d.getMonth() !== mon) return null
  return d
}

/** ISO-дата из трекера заявок пользователя. Только строгий формат. */
export function parseIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const d = new Date(iso + "T00:00:00")
  return Number.isNaN(d.getTime()) ? null : d
}

export function daysUntil(d: Date, now = new Date()): number {
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000)
}

export type NearestDeadline = { name: string; days: number; date: Date }

/**
 * Ближайший реальный дедлайн пользователя: его собственный трекер заявок
 * (ISO-даты) + вузы, подобранные под его направление (данные каталога).
 * Текст AI-отчёта НЕ разбираем — там даты сгенерированы моделью.
 */
export function nearestDeadline(
  result: AnalyzeResult | null,
  apps: AppItem[],
  now = new Date(),
): NearestDeadline | null {
  const found: NearestDeadline[] = []

  for (const a of apps) {
    const d = parseIso(a.deadline)
    if (d) found.push({ name: a.name, days: daysUntil(d, now), date: d })
  }

  const dir = result?.top[0]?.dir.id
  const unis: Uni[] = dir ? unisForDir(dir, 6) : []
  for (const u of unis) {
    const d = parseDeadline(u.dl, now)
    if (d) found.push({ name: u.name, days: daysUntil(d, now), date: d })
  }

  const valid = found.filter((x) => x.days >= 0 && x.days <= MAX_AHEAD_DAYS)
  if (!valid.length) return null
  return valid.sort((a, b) => a.days - b.days)[0]
}

/** Для отладки/тестов: сколько дедлайнов каталога вообще разбирается. */
export function parsableUniCount(now = new Date()): number {
  return UNIS.filter((u) => parseDeadline(u.dl, now)).length
}
