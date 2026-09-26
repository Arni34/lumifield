import { type TariffId } from "@/lib/store"

// Ручная оплата — работает, пока не подключён платёжный шлюз (Stripe/FreedomPay).
// Пользователь пишет в Telegram, получает реквизиты в личке и промокод после оплаты.
// Реквизиты НЕ хардкодим: телефон в публичном бандле = спам и подделка платежей.
const env = import.meta.env

/** "gateway" — только когда шлюз реально настроен. По умолчанию ручной режим. */
export const PAY_MODE: "manual" | "gateway" =
  (env.VITE_PAY_MODE as "manual" | "gateway") ?? "manual"

export const TG_CONTACT = (env.VITE_TG_CONTACT as string | undefined) ?? ""
/** Номер Kaspi показываем ТОЛЬКО если владелец явно задал его в env. */
export const KASPI_NUMBER = (env.VITE_KASPI_NUMBER as string | undefined) ?? ""

/** Цена в тенге — для локальной аудитории понятнее доллара. */
const KZT: Record<TariffId, string | undefined> = {
  free: undefined,
  plus: env.VITE_PRICE_KZT_PLUS as string | undefined,
  package: env.VITE_PRICE_KZT_PRO as string | undefined,
}
export const priceKzt = (id: TariffId) => KZT[id]

export const tgLink = (text: string) =>
  TG_CONTACT ? `https://t.me/${TG_CONTACT.replace(/^@/, "")}?text=${encodeURIComponent(text)}` : ""
