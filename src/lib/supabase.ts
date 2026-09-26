import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { type Program } from "@/data/programs"
import { type Submission, type SubStatus } from "@/lib/store"

// Бэкенд включается, когда заданы ключи проекта (env). Без них всё работает
// на localStorage (см. store.ts). Ключи задаёт владелец — я их не ввожу.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Настройки хранения задаём явно. По умолчанию они такие же, но полагаться
// на умолчания здесь нельзя: от них зависит, переживёт ли вход переключение
// вкладок и перезагрузку страницы.
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,      // вход хранится между визитами
          autoRefreshToken: true,    // токен продлевается сам
          detectSessionInUrl: false, // ссылок с токеном мы не используем
          storageKey: "lumifield.auth",
        },
      })
    : null
export const BACKEND_ON = Boolean(supabase)

// Строка БД → доменный тип. Колонки названы как поля Program.
export function rowToSubmission(r: Record<string, unknown>): Submission {
  return {
    id: String(r.id), t: String(r.t), org: String(r.org), cat: r.cat as Program["cat"],
    price: r.price as Program["price"], format: r.format as Program["format"],
    scope: r.scope as Program["scope"], loc: String(r.loc ?? ""), age: String(r.age ?? "—"),
    dl: String(r.dl ?? ""), url: String(r.url ?? ""), d: String(r.d ?? ""),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    ok: Boolean(r.ok),
    status: (r.status as SubStatus) ?? "pending",
    submittedBy: String(r.submitted_by ?? "аноним"),
    submittedAt: r.submitted_at ? new Date(String(r.submitted_at)).getTime() : Date.now(),
  }
}

function toRow(s: Submission) {
  return {
    id: s.id, t: s.t, org: s.org, cat: s.cat, price: s.price, format: s.format,
    scope: s.scope, loc: s.loc, age: s.age, dl: s.dl, url: s.url, d: s.d, tags: s.tags,
    ok: s.ok, status: s.status, submitted_by: s.submittedBy,
    submitted_at: new Date(s.submittedAt).toISOString(),
  }
}

// Все обращения best-effort: при сбое сети UI продолжает на локальном сторе.
export async function remoteList(): Promise<Submission[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from("submissions").select("*").order("submitted_at", { ascending: false })
  if (error || !data) return null
  return data.map(rowToSubmission)
}
export async function remotePush(s: Submission) {
  // insert (не upsert): заявки всегда с новым id, а update анониму запрещён (RLS).
  try { await supabase?.from("submissions").insert(toRow(s)) } catch { /* offline ok */ }
}
export async function remoteSetStatus(id: string, status: SubStatus) {
  try { await supabase?.from("submissions").update({ status }).eq("id", id) } catch { /* offline ok */ }
}
export async function remoteDelete(id: string) {
  try { await supabase?.from("submissions").delete().eq("id", id) } catch { /* offline ok */ }
}
