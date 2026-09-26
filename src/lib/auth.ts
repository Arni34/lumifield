import { useSyncExternalStore } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// Реальный аккаунт через Supabase Auth. Включается вместе с бэкендом
// (VITE_SUPABASE_URL + ANON_KEY). Без него аккаунт остаётся локальным.
export const AUTH_ON = Boolean(supabase)

let session: Session | null = null
// ВАЖНО: сессия восстанавливается асинхронно. Пока этого не произошло, session
// равна null — и экран, который на неё смотрит, покажет форму входа уже
// вошедшему человеку. Поэтому отдельно храним признак «проверка закончена»:
// до неё интерфейс должен показывать загрузку, а не логин.
let ready = !supabase
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    session = data.session
    ready = true
    notify()
  })
  supabase.auth.onAuthStateChange((_e, s) => {
    session = s
    ready = true
    notify()
  })
}

/** Закончилась ли первая проверка сессии. */
export function useAuthReady(): boolean {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => ready,
    () => ready,
  )
}

/** Логин текущего аккаунта — чтобы было видно, под кем вошли. */
export function currentLogin(): string {
  const email = session?.user?.email ?? ""
  return email.replace(/@edu\.lumifield\.app$/i, "").toUpperCase()
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => session,
    () => session,
  )
}
export function currentUserId(): string | null {
  return session?.user?.id ?? null
}
export function onAuth(cb: (s: Session | null) => void): () => void {
  const l = () => cb(session)
  listeners.add(l)
  cb(session)
  return () => listeners.delete(l)
}

export async function signUp(
  email: string, password: string, meta?: Record<string, string>,
): Promise<{ ok: boolean; msg?: string }> {
  if (!supabase) return { ok: false, msg: "Бэкенд не подключён" }
  const { error, data } = await supabase.auth.signUp({ email, password, options: { data: meta } })
  if (error) return { ok: false, msg: error.message }
  // если подтверждение email включено — сессии сразу не будет
  return { ok: true, msg: data.session ? undefined : "Проверь свою почту для подтверждения." }
}
export async function signIn(email: string, password: string): Promise<{ ok: boolean; msg?: string }> {
  if (!supabase) return { ok: false, msg: "Бэкенд не подключён" }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? { ok: false, msg: error.message } : { ok: true }
}
export async function signOut() {
  await supabase?.auth.signOut()
}
