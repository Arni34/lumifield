import { type Submission, type SubStatus } from "@/lib/store"
import { rowToSubmission } from "@/lib/supabase"

// Клиент к Edge Function модерации (service-ключ на сервере, доступ по секрету).
// Включается заданием VITE_ADMIN_ENDPOINT. Без него админка работает локально.
const ENDPOINT = import.meta.env.VITE_ADMIN_ENDPOINT as string | undefined
export const ADMIN_BACKEND = Boolean(ENDPOINT)

async function call(body: Record<string, unknown>) {
  const res = await fetch(ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

export async function adminList(secret: string): Promise<{ ok: boolean; submissions?: Submission[]; error?: string }> {
  try {
    const { status, data } = await call({ secret, action: "list" })
    if (status === 401) return { ok: false, error: "Неверный пароль" }
    if (status !== 200) return { ok: false, error: data.error ?? `Ошибка ${status}` }
    return { ok: true, submissions: (data.submissions ?? []).map(rowToSubmission) }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function adminSetStatus(secret: string, id: string, status: SubStatus): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await call({ secret, action: "setStatus", id, status })
    return res.status === 200 ? { ok: true } : { ok: false, error: res.data.error ?? `Ошибка ${res.status}` }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function adminDelete(secret: string, id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await call({ secret, action: "delete", id })
    return res.status === 200 ? { ok: true } : { ok: false, error: res.data.error ?? `Ошибка ${res.status}` }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
