// Единый вызов «Lumifield AI». Несколько путей (первый заданный — побеждает):
//  1) GROQ (как в YouPath): VITE_GROQ_KEY → api.groq.com, модель llama-3.3-70b-versatile.
//  2) HuggingFace: VITE_HF_TOKEN → router.huggingface.co (модель VITE_HF_MODEL).
//  3) Прокси: VITE_PROFORI_ENDPOINT → Edge Function qadam-ai (ключ на сервере).
// ⚠️ Ключи в п.1–2 видны в браузере — для теста бери лимитированные; прод → прокси.

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY as string | undefined
const GROQ_MODEL = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? "qwen/qwen3.8-27b"
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined
const HF_MODEL = (import.meta.env.VITE_HF_MODEL as string | undefined) ?? "NousResearch/Hermes-4-70B"
const PROXY = import.meta.env.VITE_PROFORI_ENDPOINT as string | undefined

// Токен нужен, чтобы прокси сам проверил права на полный отчёт. Раньше объём
// решал клиент — значит его можно было подделать из консоли браузера.
async function authHeader(): Promise<Record<string, string>> {
  try {
    const { supabase } = await import("@/lib/supabase")
    const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
    const tok = data.session?.access_token
    return tok ? { Authorization: `Bearer ${tok}` } : {}
  } catch { return {} }
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const HF_URL = "https://router.huggingface.co/v1/chat/completions"

export const AI_ON = Boolean(GROQ_KEY || HF_TOKEN || PROXY)

export type Msg = { role: "system" | "user" | "assistant"; content: string }

async function openaiCompatible(url: string, key: string, model: string, messages: Msg[], max: number, temp: number) {
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: temp, max_tokens: max }),
  })
  if (!r.ok) return null
  const d = await r.json()
  return (d.choices?.[0]?.message?.content ?? null) as string | null
}

/** Возвращает текст ответа модели или null (тогда используется локальный фолбэк). */
export type AiTask = "report" | "exam" | "assist"

/** task определяет модель на сервере — у каждой свой лимит токенов в минуту. */
export async function chat(messages: Msg[], opts?: { temperature?: number; max_tokens?: number; task?: AiTask; noReasoning?: boolean }): Promise<string | null> {
  const max = opts?.max_tokens ?? 800
  const temp = opts?.temperature ?? 0.6
  try {
    if (GROQ_KEY) return await openaiCompatible(GROQ_URL, GROQ_KEY, GROQ_MODEL, messages, max, temp)
    if (HF_TOKEN) return await openaiCompatible(HF_URL, HF_TOKEN, HF_MODEL, messages, max, temp)
    if (PROXY) {
      // ВАЖНО: max_tokens обязательно передаём. Без него сервер подставлял максимум
      // каждому вызову, и мелкие функции (эссе — 700, профориентация — 500)
      // резервировали полный потолок, выжигая общую минутную квоту втрое быстрее.
      const r = await fetch(PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ messages, max_tokens: max, temperature: temp, task: opts?.task ?? "assist", no_reasoning: opts?.noReasoning ?? false }),
      })
      if (!r.ok) return null
      const d = await r.json()
      return d.content ?? d.choices?.[0]?.message?.content ?? null
    }
    return null
  } catch {
    return null
  }
}

/** Достаёт JSON из ответа модели (терпимо к тексту вокруг). */
/**
 * Убирает рассуждения модели. Qwen и подобные пишут ход мысли в <think>…</think>
 * перед ответом — это съедает бюджет токенов и ломает разбор JSON: до полезной
 * части дело не доходит, и тест подставлял встроенные вопросы вместо новых.
 */
export function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim()
}

export function extractJson<T>(text: string, open: "{" | "[" = "{"): T | null {
  const close = open === "{" ? "}" : "]"
  const clean = stripThinking(text)
  const a = clean.indexOf(open), b = clean.lastIndexOf(close)
  text = clean
  if (a < 0 || b < 0) return null
  try { return JSON.parse(text.slice(a, b + 1)) as T } catch { return null }
}
