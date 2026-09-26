import { setTariff, type TariffId } from "@/lib/store"

// Оплата тарифа. Включается VITE_PAY_ENDPOINT (Edge Function qadam-pay).
// Без него Pricing разблокирует тариф в демо-режиме (без реальной оплаты).
// Реальные платежи проводит провайдер (Stripe/Kaspi) на своей стороне —
// фронт лишь создаёт сессию и проверяет её результат.
const ENDPOINT = import.meta.env.VITE_PAY_ENDPOINT as string | undefined
export const PAY_ON = Boolean(ENDPOINT)

/** Создаёт платёжную сессию и уводит на страницу оплаты провайдера. */
export async function startCheckout(tariff: TariffId, userId: string | null): Promise<{ ok: boolean; error?: string }> {
  if (!ENDPOINT) return { ok: false, error: "Оплата не подключена" }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", tariff, userId, origin: window.location.origin }),
    })
    const data = await res.json()
    if (!res.ok || !data.url) return { ok: false, error: data.error ?? `Ошибка ${res.status}` }
    window.location.href = data.url // редирект на оплату
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

/** После возврата с оплаты проверяет сессию и активирует тариф. Вызвать на старте. */
export async function verifyReturn(): Promise<void> {
  if (!ENDPOINT) return
  const p = new URLSearchParams(window.location.search)
  const sessionId = p.get("session_id")
  if (!sessionId) return
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", sessionId }),
    })
    const data = await res.json()
    if (data.ok && data.tariff) setTariff(data.tariff as TariffId)
  } catch { /* ignore */ }
  // убираем query-параметры из URL
  window.history.replaceState({}, "", window.location.pathname)
}
