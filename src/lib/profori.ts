import { PROGRAMS, type Program } from "@/data/programs"
import { DIRECTIONS, DIR_LIST, type Direction, type DirId } from "@/data/directions"
import { DIR_TR } from "@/data/directions.i18n"
import { QUIZ, TEXT_SIGNALS, type Weights } from "@/data/quiz"
import { chat, AI_ON, extractJson } from "@/lib/ai"
import { type Lang } from "@/lib/i18n"
export { AI_ON as AI_ENABLED } from "@/lib/ai"

const LANG_NAME: Record<Lang, string> = { ru: "русском", en: "English", kz: "казахском (қазақша)" }
const dirName = (d: Direction, lang: Lang) => (lang === "ru" ? d.title : DIR_TR[d.id]?.[lang]?.title ?? d.title)

// Ответы пользователя: single → индекс, multi → индексы, text → строка.
export type Answers = Record<string, number | number[] | string>

export type DirResult = {
  dir: Direction
  score: number
  why: string
  programs: Program[]
}

export type AnalyzeResult = {
  top: DirResult[]
  summary: string
  source: "local" | "hermes"
}

const ZERO = (): Record<DirId, number> =>
  Object.fromEntries(DIR_LIST.map((d) => [d.id, 0])) as Record<DirId, number>

function addWeights(acc: Record<DirId, number>, w: Weights) {
  for (const k in w) acc[k as DirId] += w[k as DirId]!
}

// Складываем вектор склонностей и попутно запоминаем, какие ответы
// вложились в каждое направление (для честного объяснения «почему»).
function score(answers: Answers) {
  const total = ZERO()
  const evidence: Record<DirId, string[]> = Object.fromEntries(
    DIR_LIST.map((d) => [d.id, [] as string[]])
  ) as Record<DirId, string[]>

  for (const question of QUIZ) {
    const a = answers[question.id]
    if (question.kind === "text") {
      if (typeof a === "string" && a.trim()) {
        for (const s of TEXT_SIGNALS) if (s.re.test(a)) addWeights(total, s.w)
      }
      continue
    }
    const idxs =
      question.kind === "single"
        ? typeof a === "number" ? [a] : []
        : Array.isArray(a) ? a : []
    for (const i of idxs) {
      const opt = question.options[i]
      if (!opt) continue
      addWeights(total, opt.w)
      for (const k in opt.w) evidence[k as DirId].push(opt.label.toLowerCase())
    }
  }
  return { total, evidence }
}

// Подбор реальных программ из каталога под направление.
function matchPrograms(dir: Direction, used: Set<string>, limit = 4): Program[] {
  const ranked = PROGRAMS.map((p) => {
    let s = 0
    if (dir.cats.includes(p.cat)) s += 3
    const hay = (p.t + " " + p.d + " " + p.tags.join(" ")).toLowerCase()
    for (const h of dir.hints) if (hay.includes(h)) s += 2
    return { p, s }
  })
    .filter((x) => x.s > 0 && !used.has(x.p.id))
    .sort((a, b) => b.s - a.s || (b.p.ok ? 1 : 0) - (a.p.ok ? 1 : 0))
    .map((x) => x.p)

  const picked = ranked.slice(0, limit)
  picked.forEach((p) => used.add(p.id))
  return picked
}

function localWhy(dir: Direction, ev: string[], lang: Lang): string {
  if (lang === "en") return "Your answers point most strongly to this direction."
  if (lang === "kz") return "Жауаптарың ең күшті осы бағытты көрсетеді."
  const uniq = [...new Set(ev)].slice(0, 2)
  if (uniq.length === 0) return dir.d
  const quoted = uniq.map((x) => `«${x}»`).join(" и ")
  return `Твои ответы ${quoted} сильнее всего указывают на это направление.`
}

function localSummary(names: string[], lang: Lang): string {
  const many = names.length > 1
  const head = names.slice(0, -1).join(", ")
  const last = names.at(-1)
  if (lang === "en") return many
    ? `Based on your answers, ${head} and ${last} stand out most. Below — why and where to start with each.`
    : `Your leading direction is ${names[0]}. Below — why and where to start.`
  if (lang === "kz") return many
    ? `Жауаптарыңа сүйенсек, ${head} және ${last} ең күшті байқалды. Төменде — әрқайсысы бойынша неге және неден бастау.`
    : `Жетекші бағытың — ${names[0]}. Төменде — неге және неден бастау.`
  return many
    ? `На основе твоих ответов сильнее всего проявились ${head} и ${last}. Ниже — почему и с чего начать по каждому.`
    : `Твоё ведущее направление — ${names[0]}. Ниже — почему и с чего начать.`
}

export function analyzeLocal(answers: Answers, lang: Lang = "ru"): AnalyzeResult {
  const { total, evidence } = score(answers)
  const ordered = DIR_LIST
    .map((d) => ({ d, s: total[d.id] }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)

  // хотя бы 2 направления, даже если сигнал слабый
  const chosen = (ordered.length >= 2 ? ordered : DIR_LIST.map((d) => ({ d, s: total[d.id] })))
    .slice(0, 3)

  const used = new Set<string>()
  const top: DirResult[] = chosen.map(({ d, s }) => ({
    dir: DIRECTIONS[d.id],
    score: s,
    why: localWhy(DIRECTIONS[d.id], evidence[d.id], lang),
    programs: matchPrograms(DIRECTIONS[d.id], used),
  }))

  const names = top.map((t) => dirName(t.dir, lang))
  const summary = localSummary(names, lang)

  return { top, summary, source: "local" }
}

// ─────────────────────────────────────────────────────────────
// Результат из анкеты YouPath (20 вопросов): направления выводятся из
// сильных/слабых предметов, ценностей и свободного текста. Ответы choice/multi
// хранятся оригинальными русскими строками (перевод — только отображение),
// поэтому матчим по ним. Возвращает обычный AnalyzeResult — его видят
// аккаунт («Направление») и карта поступления.
// ─────────────────────────────────────────────────────────────

const YP_SUBJECT_W: Record<string, Weights> = {
  "Математика": { math: 2, it: 1 }, "Физика": { eng: 2, sci: 1 }, "Информатика": { it: 2, math: 1 },
  "Химия": { sci: 2, med: 1 }, "Биология": { sci: 2, med: 2 }, "История": { soc: 2 },
  "Обществознание": { soc: 2 }, "Английский": { soc: 1 }, "Литература": { soc: 1, design: 1 },
  "География": { sci: 1, soc: 1 }, "Экономика": { biz: 2, math: 1 }, "ИЗО/Технология": { design: 2, eng: 1 },
}
const YP_VALUE_W: Record<string, Weights> = {
  "Зарплата": { biz: 2, it: 1 }, "Влияние": { soc: 2 }, "Творчество": { design: 2 }, "Стабильность": { med: 1, eng: 1 },
}

export function analyzeFromYouPath(a: Record<string, string | undefined>, lang: Lang = "ru"): AnalyzeResult {
  const total = ZERO()
  // сильные предметы — двойной вес, слабые — лёгкий минус
  for (const s of (a.strong_sub ?? "").split(",").map((x) => x.trim()).filter(Boolean)) {
    const w = YP_SUBJECT_W[s]
    if (w) { addWeights(total, w); addWeights(total, w) }
  }
  for (const s of (a.weak_sub ?? "").split(",").map((x) => x.trim()).filter(Boolean)) {
    const w = YP_SUBJECT_W[s]
    if (w) for (const k in w) total[k as DirId] -= w[k as DirId]!
  }
  const vw = YP_VALUE_W[(a.values ?? "").trim()]
  if (vw) addWeights(total, vw)
  // свободный текст: интересы, активности, вуз мечты
  const text = [a.interests, a.activities, a.dream_uni].filter(Boolean).join(" ")
  for (const s of TEXT_SIGNALS) if (s.re.test(text)) addWeights(total, s.w)

  const ordered = DIR_LIST.map((d) => ({ d, s: total[d.id] })).sort((x, y) => y.s - x.s)
  const positive = ordered.filter((x) => x.s > 0)
  const chosen = (positive.length >= 2 ? positive : ordered).slice(0, 3)
  const used = new Set<string>()
  const top: DirResult[] = chosen.map(({ d, s }) => ({
    dir: DIRECTIONS[d.id],
    score: s,
    why: localWhy(DIRECTIONS[d.id], [], lang),
    programs: matchPrograms(DIRECTIONS[d.id], used),
  }))
  const names = top.map((t) => dirName(t.dir, lang))
  return { top, summary: localSummary(names, lang), source: "local" }
}

// ─────────────────────────────────────────────────────────────
// AI-путь: Hermes 4 (Nous Research) через прокси на HuggingFace Router.
// Направления и программы остаются детерминированными (локальный движок) —
// модель только пишет тёплое объяснение, поэтому не может выдумать программу.
// Включается, если задан VITE_PROFORI_ENDPOINT (serverless-прокси с HF-токеном).
// При любой ошибке — молча падаем на локальный результат.
// ─────────────────────────────────────────────────────────────

function transcript(answers: Answers): string {
  return QUIZ.map((q) => {
    const a = answers[q.id]
    let val = "—"
    if (q.kind === "text") val = typeof a === "string" ? a : "—"
    else if (q.kind === "single" && typeof a === "number") val = q.options[a]?.label ?? "—"
    else if (q.kind === "multi" && Array.isArray(a)) val = a.map((i) => q.options[i]?.label).filter(Boolean).join(", ")
    return `${q.q}\n→ ${val}`
  }).join("\n\n")
}

export async function analyze(answers: Answers, lang: Lang = "ru"): Promise<AnalyzeResult> {
  const base = analyzeLocal(answers, lang)
  if (!AI_ON) return base

  const sys =
    "Ты — тёплый и точный профориентолог для казахстанского школьника 14–18 лет. " +
    `Пиши ТОЛЬКО на ${LANG_NAME[lang]} языке, на «ты», без воды и штампов. Верни строго JSON.`
  const user =
    `Вот ответы школьника на тест профориентации:\n\n${transcript(answers)}\n\n` +
    `Система уже определила ведущие направления: ${base.top.map((t) => t.dir.title).join(", ")}.\n` +
    `Задача: верни JSON вида {"summary": "2–3 предложения общего вывода", ` +
    `"reasons": {${base.top.map((t) => `"${t.dir.id}": "1 предложение, почему это направление подходит именно ему, ссылаясь на его ответы"`).join(", ")}}}. ` +
    `Только JSON, без пояснений вокруг.`

  const raw = await chat([{ role: "system", content: sys }, { role: "user", content: user }], { max_tokens: 500, task: "assist" })
  const parsed = raw ? extractJson<{ summary?: string; reasons?: Record<string, string> }>(raw) : null
  if (!parsed) return base // graceful fallback

  return {
    ...base,
    source: "hermes",
    summary: typeof parsed.summary === "string" ? parsed.summary : base.summary,
    top: base.top.map((t) => ({ ...t, why: parsed.reasons?.[t.dir.id] ?? t.why })),
  }
}
