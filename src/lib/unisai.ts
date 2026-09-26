import { chat, AI_ON, extractJson } from "@/lib/ai"

// AI-подбор вузов (в духе YouPath AI): модель предлагает РЕАЛЬНЫЕ вузы под
// профиль ученика. Ничего не выдумываем — при выключенном AI отдаём пусто,
// и UI показывает встроенный список (unisForDir).
export type AiUni = { name: string; country: string; why: string; deadline?: string }

export async function suggestUniversities(
  direction: string, dream: string, withDeadlines: boolean,
): Promise<AiUni[]> {
  if (!AI_ON) return []
  const sys =
    "Ты — приёмный AI-консультант по поступлению (как YouPath AI). " +
    "Предлагай ТОЛЬКО реальные существующие университеты — ничего не выдумывай. Верни строго JSON-массив."
  const user =
    `Школьник из Казахстана, ведущее направление: «${direction}». ${dream ? `Его мечта своими словами: ${dream}. ` : ""}` +
    `Предложи 6 подходящих реальных вузов — микс: сильные вузы Казахстана и мировые, разной селективности (реалистичные + пара амбициозных). ` +
    `Для каждого верни объект {"name":"точное название","country":"страна","why":"1 короткая причина именно под этого ученика"` +
    `${withDeadlines ? `,"deadline":"типичный срок подачи"` : ""}}. Только JSON-массив, без текста вокруг.`
  const raw = await chat([{ role: "system", content: sys }, { role: "user", content: user }], { max_tokens: 800, task: "assist" })
  const arr = raw ? extractJson<AiUni[]>(raw, "[") : null
  return Array.isArray(arr) ? arr.filter((u) => u && typeof u.name === "string").slice(0, 6) : []
}
