import { EXAMS, type ExamId, type ExamQ } from "@/data/exams"
import { type Lang } from "@/lib/i18n"
import { chat, AI_ON, extractJson } from "@/lib/ai"

// Каждый новый тест генерирует AI. Если AI не подключён или ответ невалидный —
// берём встроенный набор вопросов.
export const EXAMGEN_ON = AI_ON

function valid(q: unknown): q is ExamQ {
  const o = q as ExamQ
  return !!o && typeof o.q === "string" && Array.isArray(o.options) && o.options.length === 4 &&
    typeof o.correct === "number" && o.correct >= 0 && o.correct < 4 && typeof o.w === "number"
}

const LANG_NAME: Record<Lang, string> = { ru: "русском", en: "English", kz: "казахском (қазақша)" }

export async function generateQuestions(
  examId: ExamId,
  lang: Lang = "ru",
): Promise<{ questions: ExamQ[]; ai: boolean }> {
  const fallback = EXAMS[examId].questions
  const ex = EXAMS[examId]
  const answer = await chat([
    // /no_think отключает «размышления вслух» у Qwen: без него модель тратит
    // весь бюджет на рассуждения, и JSON приходит оборванным.
    { role: "system", content: "/no_think Ты генератор диагностических вопросов. Верни СТРОГО JSON-массив и ничего больше: ни пояснений, ни рассуждений, ни разметки." },
    { role: "user", content:
      `Сгенерируй 6 новых вопросов уровня экзамена ${ex.name} (${ex.blurb}) для школьника. ` +
      `Текст вопросов и вариантов — на ${LANG_NAME[lang]} языке. ` +
      `Разной сложности. Формат: [{"q":"текст","options":["a","b","c","d"],"correct":0,"w":1}] ` +
      `где correct — индекс правильного (0–3), w — сложность 1..3. Только JSON.` },
  ], { temperature: 0.7, max_tokens: 900, task: "exam", noReasoning: true })
  if (!answer) return { questions: fallback, ai: false }
  const arr = extractJson<unknown[]>(answer, "[") ?? []
  const questions = (Array.isArray(arr) ? arr : []).filter(valid).slice(0, 8)
  return questions.length >= 4 ? { questions, ai: true } : { questions: fallback, ai: false }
}
