import { supabase } from "@/lib/supabase"
import { onAuth } from "@/lib/auth"
import { subscribe, snapshot, loadSnapshot, isPaid, enforceTariffExpiry, type Snapshot } from "@/lib/store"

// Привязывает данные аккаунта к пользователю: при входе тянем строку user_data,
// при изменениях стора — сохраняем обратно (debounce). Данные становятся
// доступны на любом устройстве после входа.

// Объединяет две коллекции по ключу без потерь (локальные записи важнее при
// совпадении ключа; уникальные с обеих сторон сохраняются).
function mergeBy<T>(remote: T[], local: T[], key: (x: T) => string): T[] {
  const m = new Map<string, T>()
  for (const x of remote) m.set(key(x), x)
  for (const x of local) m.set(key(x), x)
  return [...m.values()]
}

// Мёрж снапшотов: платный тариф не понижаем; коллекции (отчёты, заявки, тесты)
// объединяем, чтобы несинхронизированные локальные данные не терялись.
function mergeSnapshots(local: Snapshot, remote: Partial<Snapshot>): Snapshot {
  const keepLocalTariff = isPaid(local.tariff) && !isPaid(remote.tariff ?? "free")
  const tariff = keepLocalTariff ? local.tariff : (remote.tariff ?? local.tariff)
  // срок действия едет вместе с выбранным тарифом (временные промокоды)
  const tariffUntil = keepLocalTariff ? (local.tariffUntil ?? null) : (remote.tariffUntil ?? null)
  return {
    tariff,
    tariffUntil,
    progress: { ...(remote.progress ?? {}), ...local.progress },
    profile: local.profile ?? remote.profile ?? null,
    savedResult: local.savedResult ?? remote.savedResult ?? null,
    grade: local.grade ?? remote.grade ?? null,
    examResults: mergeBy(remote.examResults ?? [], local.examResults ?? [], (r) => `${r.exam}-${r.at}`),
    apps: mergeBy(remote.apps ?? [], local.apps ?? [], (a) => a.id),
    reports: mergeBy(remote.reports ?? [], local.reports ?? [], (r) => r.id),
    // Пробный период «залипает»: использован на любом устройстве — использован везде.
    trialUsed: remote.trialUsed || local.trialUsed,
  }
}

let userId: string | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let started = false

async function push() {
  // ВАЖНО №1: запрос supabase-js ЛЕНИВЫЙ — без await/then он не уходит на сервер.
  // Из-за этого строка создавалась при первом входе и больше не обновлялась:
  // отчёты и план не доезжали до других устройств.
  // ВАЖНО №2: без updated_at — колонки может не быть в таблице, upsert упал бы.
  if (!userId || !supabase) return
  const { error } = await supabase.from("user_data").upsert({ user_id: userId, data: snapshot() })
  if (error) console.warn("[sync] не удалось сохранить:", error.message)
}

export function initSync() {
  if (!supabase || started) return
  started = true

  onAuth(async (session) => {
    userId = session?.user?.id ?? null
    if (!userId || !supabase) return
    const { data } = await supabase.from("user_data").select("data").eq("user_id", userId).maybeSingle()
    const remote = data?.data as Partial<Snapshot> | undefined
    if (remote) {
      const merged = mergeSnapshots(snapshot(), remote)
      loadSnapshot(merged)
      enforceTariffExpiry() // истёкший временный тариф → Free
      void push() // фиксируем объединённый результат на сервере
    } else {
      await supabase.from("user_data").upsert({ user_id: userId, data: snapshot() }) // первая строка
    }
  })

  subscribe(() => {
    if (!userId || !supabase) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { void push() }, 800)
  })

  // Вкладку закрыли/свернули до истечения debounce — дописываем сразу,
  // иначе последние изменения (отчёт, прогресс) не доедут до других устройств.
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden") return
      if (timer) { clearTimeout(timer); timer = null }
      void push()
    })
  }
}
