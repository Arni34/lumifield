import { chat, AI_ON, type AiTask } from "@/lib/ai"
import { type YAnswers } from "@/data/youpath"
import { type Lang } from "@/lib/i18n"

const LANG_NAME: Record<Lang, string> = { ru: "русском", en: "English", kz: "казахском (қазақша)" }

// YouPath AI: по анкете из 20 вопросов генерирует полный отчёт
// (профессии + вузы + мотивационное письмо + книги) через Groq/LLM.
// Опционально подмешивает свежие данные из интернета через Tavily (Edge Function).
export const YOUPATH_AI_ON = AI_ON
const TAVILY_ENDPOINT = import.meta.env.VITE_TAVILY_ENDPOINT as string | undefined

async function getWebData(a: YAnswers): Promise<string> {
  if (!TAVILY_ENDPOINT) return ""
  try {
    const queries = [
      `admission requirements ${a.country} universities ${a.timeline} GPA IELTS official`,
      `scholarships international students ${a.country} ${a.timeline} Kazakhstan`,
      `application deadlines top universities ${a.country} ${a.timeline}`,
    ]
    const res = await fetch(TAVILY_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "web", queries }),
    })
    if (!res.ok) return ""
    const d = await res.json()
    return typeof d.text === "string" ? d.text : ""
  } catch { return "" }
}

// ── профиль и части отчёта ─────────────────────────────
// ВАЖНО: отчёт собирается ЧЕТЫРЬМЯ параллельными запросами, а не одним.
// Бесплатный Groq режет вывод одного запроса (лимит токенов в минуту считается
// отдельно для каждой модели), поэтому один большой запрос обрывался на первой
// части. Четыре части идут на четыре РАЗНЫЕ модели — у каждой своя квота,
// в сумме выходит полный объём и без оплаты.

function profileBlock(a: YAnswers): string {
  return `ПРОФИЛЬ СТУДЕНТА:
— GPA: ${a.gpa} / ${a.gpa_scale}
— Класс/курс: ${a.grade}
— Сильные предметы: ${a.strong_sub}
— Слабые предметы: ${a.weak_sub}
— IELTS: ${a.ielts} | TOEFL: ${a.toefl} | HSK: ${a.hsk} | Другие: ${a.other_lang}
— Интересы: ${a.interests}
— Стиль работы: ${a.work_style}
— Стресс: ${a.stress}
— Ценности: ${a.values}
— Активность: ${a.activities}
— Страна: ${a.country} | Бюджет: ${a.budget} USD/год
— Цель после учёбы: ${a.work_after}
— Поступление в: ${a.timeline}
— Университет мечты: ${a.dream_uni}
— Главная слабость: ${a.weakness}`
}

function partPrompt(n: 1 | 2 | 3 | 4, a: YAnswers, web: string, lang: Lang, paid: boolean): string {
  // ВАЖНО про объём: у раздела жёсткий потолок в 900 токенов. Без явного лимита
  // модель пишет «сколько получится» и обрывается на полуслове. Поэтому просим
  // уложиться заведомо короче и обязательно закончить последнее предложение.
  const head = `${profileBlock(a)}\n\nПиши ТОЛЬКО на ${LANG_NAME[lang]} языке. Конкретно, без вводных фраз и воды.\nНе повторяй профиль и не пиши вступлений — сразу по делу.\nОБЪЁМ: не более 350 слов. Пиши плотно, короткими строками.\nОБЯЗАТЕЛЬНО заверши последнее предложение — лучше короче, чем оборванный текст.\n\n`

  if (n === 1) {
    return head + `Напиши раздел «ТОП-3 ПРОФЕССИИ». Для каждой:
✦ Название и краткое описание
✦ Почему подходит именно этому студенту (ссылайся на профиль)
✦ Топ-5 навыков для развития
✦ Средняя зарплата в ${a.country} и в Казахстане
✦ День из жизни специалиста (2–3 предложения)
Начни сразу с заголовка раздела. Уложись в раздел целиком, не обрывайся.`
  }

  if (n === 2) {
    const src = web
      ? `АКТУАЛЬНЫЕ ДАННЫЕ С ОФИЦИАЛЬНЫХ САЙТОВ:\n${web}\n\n`
      : `Свежих веб-данных нет — опирайся на свои знания реальных вузов, ничего не выдумывай.\n\n`
    if (!paid) {
      return head + src + `Напиши раздел «ТОП-5 УНИВЕРСИТЕТОВ».
Подбери РОВНО 5 реальных университетов под этот профиль, но дай только КРАТКИЙ анонс.
Каждый университет — ОДНА строка, начинается с номера («1.», «2.» …), формат:
«1. Название — Страна, город · одна фраза, почему подходит именно этому студенту»
СТРОГО ЗАПРЕЩЕНО: дедлайны, минимальный GPA, языковые требования, стоимость,
стипендии, шанс поступления, ссылки. Ничего из этого не упоминай — эти детали
доступны только в платном тарифе. Никаких других строк, кроме заголовка и пяти строк.`
    }
    return head + src + `Напиши раздел «ТОП-5 УНИВЕРСИТЕТОВ» (только реальные).
Каждый университет начинай с новой строки и с номера («1.», «2.» …). Для каждого:
✦ Название, страна, город
✦ Минимальный GPA (переведи на шкалу ${a.gpa_scale})
✦ Языковые требования (IELTS/TOEFL минимум)
✦ Дедлайн подачи ${a.timeline}
✦ Стоимость в год (USD)
✦ Доступные стипендии для казахстанцев
✦ Шанс поступления: высокий/средний/низкий — объясни почему
✦ Ссылка на приёмную комиссию
Начни сразу с заголовка раздела. Уложись во все пять, не обрывайся.`
  }

  if (n === 3) {
    return head + `Напиши раздел «МОТИВАЦИОННОЕ ПИСЬМО» — 5 абзацев:
  1 — Сильное открытие на основе «${a.interests}» и «${a.values}»
  2 — Академические достижения (${a.strong_sub}, ${a.activities})
  3 — Почему эта профессия (связь с «${a.work_style}» и «${a.values}»)
  4 — Почему именно этот университет (конкретно)
  5 — Цели после учёбы (связь с «${a.work_after}»)
Затем: 3 типичные ошибки казахстанских студентов в мотивационном письме
и список документов для подачи в ${a.timeline}.
Начни сразу с заголовка раздела.`
  }

  return head + `Напиши раздел «КНИГИ И РАЗВИТИЕ» — 4–5 книг. Для каждой:
✦ Название и автор
✦ Главная идея (2 предложения)
✦ Цитата или идея, которую можно взять в мотивационное письмо
✦ Как связана с профилем этого студента
Начни сразу с заголовка раздела. Обязательно доведи список до конца.`
}

const FALLBACK_TR: Record<Lang, string> = {
  ru: "Чтобы получить полный AI-отчёт (профессии, вузы с дедлайнами, мотивационное письмо и книги), подключи ключ модели: добавь VITE_GROQ_KEY (или VITE_HF_TOKEN) в qadam-app/.env.local и перезапусти. Тогда YouPath проанализирует твою анкету полностью.",
  en: "To get the full AI report (careers, universities with deadlines, a motivation letter and books), connect a model key: add VITE_GROQ_KEY (or VITE_HF_TOKEN) to qadam-app/.env.local and restart. Then YouPath will analyze your survey fully.",
  kz: "Толық AI-есеп алу үшін (мамандықтар, мерзімі бар университеттер, мотивациялық хат және кітаптар) модель кілтін қос: qadam-app/.env.local ішіне VITE_GROQ_KEY (не VITE_HF_TOKEN) қосып, қайта іске қос. Сонда YouPath анкетаңды толық талдайды.",
}

// reason: "unconfigured" — ключ модели не задан (только dev);
//         "failed" — модель не ответила (таймаут/сеть) — пользователю предлагаем повтор.
// Часть считается законченной, если текст кончается знаком завершения мысли.
// Модели игнорируют просьбы «уложись в N слов» и пишут до упора в лимит токенов,
// поэтому обрыв ловим по факту и дописываем вторым запросом.
const ENDS_CLEANLY = /[.!?…»"')\]]\s*$/

/** Дописывает оборванный раздел силами СОСЕДНЕЙ модели — у неё своя квота. */
async function completePart(
  text: string,
  n: 1 | 2 | 3 | 4,
  system: string,
  lang: Lang,
): Promise<string> {
  if (!text || ENDS_CLEANLY.test(text.trim())) return text

  // Обрезаем последнее — почти наверняка недописанное — слово.
  const base = text.replace(/\s*\S*$/, "")
  const next = ((n % 4) + 1) as 1 | 2 | 3 | 4 // квота соседней модели

  const cont = await chat(
    [
      { role: "system", content: system },
      {
        role: "user",
        content: `Ниже — конец раздела, который оборвался на середине. Продолжи ровно с места обрыва и доведи раздел до конца.
Не повторяй уже написанное, не пиши вступлений и заголовков. Не более 150 слов. Обязательно заверши последнее предложение.
Пиши на ${LANG_NAME[lang]} языке.

КОНЕЦ РАЗДЕЛА:
…${base.slice(-700)}`,
      },
    ],
    { max_tokens: 400, temperature: 0.6, task: (`p${next}` as AiTask) },
  )

  return cont ? `${base} ${cont.trim()}` : base
}

export async function generateReport(a: YAnswers, lang: Lang = "ru", paid = false): Promise<{ text: string; ai: boolean; reason?: "unconfigured" | "failed" }> {
  if (!AI_ON) return { text: FALLBACK_TR[lang], ai: false, reason: "unconfigured" }

  // Веб-данные нужны только разделу про вузы — остальным не отдаём, чтобы не
  // раздувать промпт и не тратить токены впустую.
  const web = await getWebData(a)

  const system = `Ты персональный карьерный консультант и эксперт по поступлению. Пиши ТОЛЬКО на ${LANG_NAME[lang]} языке, конкретно, реальные вузы — не выдумывай.`
  const nums: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4]

  // Параллельно: четыре запроса к четырём моделям укладываются в те же ~3 секунды,
  // что и один, но дают полный объём вместо обрезанной первой части.
  const parts = await Promise.all(
    nums.map((n) =>
      chat(
        [
          { role: "system", content: system },
          { role: "user", content: partPrompt(n, a, n === 2 ? web : "", lang, paid) },
        ],
        { max_tokens: 900, temperature: 0.7, task: (`p${n}` as AiTask) },
      ),
    ),
  )

  // Первая часть — обязательная: без неё отчёта нет. Остальные, если модель
  // не ответила, просто пропускаем — лучше отдать три раздела, чем ничего.
  if (!parts[0]) return { text: "", ai: false, reason: "failed" }

  // Дописываем оборванные разделы — параллельно, каждый на своей модели.
  const whole = await Promise.all(
    nums.map((n) => completePart((parts[n - 1] ?? "").trim(), n, system, lang)),
  )

  const text = nums
    .map((n) => (whole[n - 1] ? `[[PART${n}]]\n${whole[n - 1].trim()}` : ""))
    .filter(Boolean)
    .join("\n\n")

  return { text, ai: true }
}


// ── разбор отчёта на части ─────────────────────────────
// Модель ставит служебные маркеры [[PART1]]…[[PART4]] перед заголовками частей.
// Это позволяет показать ЧАСТЬ 2 (вузы) отдельно и закрыть её для Free —
// не ломая отчёт, если маркеров нет (старые сохранённые отчёты).
export type ReportParts = {
  hasMarkers: boolean
  intro: string
  parts: [string, string, string, string] // ЧАСТЬ 1..4
}

const MARKER_RE = /\[\[PART([1-4])\]\][ \t]*\n?/g

export function splitReport(text: string): ReportParts {
  const parts: [string, string, string, string] = ["", "", "", ""]
  const hits = [...text.matchAll(MARKER_RE)]
  if (hits.length === 0) return { hasMarkers: false, intro: text.trim(), parts }
  const intro = text.slice(0, hits[0].index).trim()
  hits.forEach((h, i) => {
    const from = h.index + h[0].length
    const to = i + 1 < hits.length ? hits[i + 1].index : text.length
    const n = Number(h[1]) - 1
    parts[n] = (parts[n] ? parts[n] + "\n" : "") + text.slice(from, to).trim()
  })
  return { hasMarkers: true, intro, parts }
}

/** Убирает служебные маркеры — на случай, если часть текста рендерится целиком. */
export function stripMarkers(text: string): string {
  return text.replace(MARKER_RE, "")
}

/**
 * Сколько университетов реально подобрала модель в ЧАСТИ 2.
 * Считаем нумерованные строки («1. …»); число берём из отчёта, не выдумываем.
 */
export function countUniversities(part2: string): number {
  const lines = part2.split("\n").filter((l) => /^\s*\d{1,2}[.)]\s+\S/.test(l))
  return lines.length
}

/** Названия вузов из ЧАСТИ 2 — для размытого превью (без деталей). */
export function universityTeasers(part2: string): string[] {
  return part2
    .split("\n")
    .filter((l) => /^\s*\d{1,2}[.)]\s+\S/.test(l))
    .map((l) => l.replace(/^\s*\d{1,2}[.)]\s*/, "").trim())
}
