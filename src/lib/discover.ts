import { type Program } from "@/data/programs"

// Поиск новых программ и проверка дедлайнов через Tavily.
// Фронт ходит на serverless-прокси (ключ Tavily живёт на сервере, не в браузере).
// Включается заданием VITE_TAVILY_ENDPOINT. См. supabase/functions/qadam-discover.
const ENDPOINT = import.meta.env.VITE_TAVILY_ENDPOINT as string | undefined
export const DISCOVER_ON = Boolean(ENDPOINT)

export type Candidate = Program & { sourceUrl?: string }

export type DiscoverResult = {
  ok: boolean
  candidates: Candidate[]
  error?: string
}

/** Ищет новые возможности по теме. Кандидаты уходят в модерацию как pending. */
export async function discoverPrograms(query: string): Promise<DiscoverResult> {
  if (!ENDPOINT) return { ok: false, candidates: [], error: "Tavily не подключён (нет VITE_TAVILY_ENDPOINT)" }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "discover", query }),
    })
    if (!res.ok) throw new Error(`endpoint ${res.status}`)
    const data = await res.json()
    return { ok: true, candidates: Array.isArray(data.candidates) ? data.candidates : [] }
  } catch (e) {
    return { ok: false, candidates: [], error: String(e) }
  }
}

export type DeadlineFlag = { id: string; t: string; note: string; soon: boolean }

/** Проверяет актуальность дедлайнов у списка программ (Tavily перепроверяет даты). */
export async function checkDeadlines(programs: Program[]): Promise<DeadlineFlag[]> {
  if (!ENDPOINT) return []
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "deadlines", programs: programs.map((p) => ({ id: p.id, t: p.t, url: p.url, dl: p.dl })) }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.flags) ? data.flags : []
  } catch { return [] }
}
