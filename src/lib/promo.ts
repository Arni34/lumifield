import { supabase } from "@/lib/supabase"
import { type TariffId } from "@/lib/store"

// Гашение промокода через защищённую БД-функцию redeem_promo (SECURITY DEFINER).
// Коды НЕ хранятся в коде сайта — только в таблице promo_codes в Supabase.
// Функция атомарно проверяет и помечает код использованным (строго один раз).
export type RedeemResult =
  | { status: "ok"; tariff: TariffId; until: number | null } // until: epoch ms или null (бессрочно)
  | { status: "used" }
  | { status: "invalid" }
  | { status: "unavailable" } // БД-функция ещё не создана (SQL не выполнен) / сеть

export async function redeemPromo(code: string, by: string | null): Promise<RedeemResult> {
  if (!supabase) return { status: "unavailable" }
  try {
    const { data, error } = await supabase.rpc("redeem_promo", { p_code: code, p_by: by })
    if (error) {
      // Функция отсутствует (PGRST202) или иная ошибка БД/сети — не «неверный код».
      if (error.code === "PGRST202" || /redeem_promo/.test(error.message ?? "")) return { status: "unavailable" }
      return { status: "unavailable" }
    }
    if (typeof data !== "string") return { status: "invalid" }
    if (data === "USED") return { status: "used" }
    // формат: "plus" | "package" (бессрочно) или "plus:14" | "package:14" (дней)
    const [t, d] = data.split(":")
    if (t === "plus" || t === "package") {
      const days = parseInt(d, 10)
      const until = Number.isFinite(days) && days > 0 ? Date.now() + days * 86_400_000 : null
      return { status: "ok", tariff: t, until }
    }
    return { status: "invalid" } // 'INVALID' — код не найден в базе
  } catch {
    return { status: "unavailable" }
  }
}
