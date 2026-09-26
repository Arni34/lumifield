import { type AnalyzeResult } from "@/lib/profori"
import { type Program } from "@/data/programs"
import { type Lang } from "@/lib/i18n"
import { DIR_TR } from "@/data/directions.i18n"

// Персональный план — премиум AI-плюшка (тариф Lumifield+).
// Берёт результат профориентации + класс и раскладывает реальные программы
// каталога по трём горизонтам с задачами и дедлайнами. Детерминированно:
// программы настоящие, ничего не выдумывается. Переведён на EN/KZ/RU.

export type Phase = {
  key: string
  title: string
  horizon: string
  intro: string
  tasks: string[]
  programs: Program[]
}

export type Plan = {
  headline: string
  phases: Phase[]
  essay: { title: string; body: string }
}

export type Grade = "9" | "10" | "11" | "c1" | "c2" // c1/c2 — 1-й и 2-й курс

// Языковые шаблоны. {dir} подставляется названием ведущего направления.
type Tpl = {
  gradeNote: Record<Grade, string>
  fallbackDir: string
  p: { title: string; horizon: string; intro: string; tasks: string[] }[]
  headline: string // с {dir} и {note}
  essayTitle: string
  essayBody: string // с {dir}
}

const TPL: Record<Lang, Tpl> = {
  ru: {
    gradeNote: {
      "9": "У тебя есть запас времени — заложи фундамент и попробуй разное.",
      "10": "Ключевой год: набирай проекты и результаты для сильного портфолио.",
      "11": "Финишный рывок — фокус на дедлайнах поступления и заявках.",
      "c1": "1 курс: укрепляй базу, собирай портфолио и целься в стажировки, обмены и конкурсы.",
      "c2": "2 курс: время серьёзных заявок — обмены, стажировки, гранты и перевод в вуз мечты.",
    },
    fallbackDir: "выбранное направление",
    p: [
      { title: "Сейчас", horizon: "1–2 недели", intro: `Быстрый старт по направлению «{dir}» — заложи базу и почувствуй, твоё ли это.`, tasks: ["Сохрани этот план и подпишись на дедлайны в каталоге", `Начни один бесплатный курс по направлению «{dir}»`, "Заведи документ, куда будешь складывать свои проекты и достижения"] },
      { title: "Этот семестр", horizon: "2–4 месяца", intro: "Первые реальные результаты для портфолио: участие и проекты с понятными сроками.", tasks: ["Выбери 1–2 возможности ниже и отметь их дедлайны", "Собери первый проект или подготовься к олимпиаде", "Найди ментора или команду — так доходят до конца чаще"] },
      { title: "Этот год", horizon: "6–12 месяцев", intro: "Крупные цели: международные программы, гранты и сильная заявка.", tasks: ["Нацелься на 1 крупную международную программу или грант", "Начни черновик мотивационного эссе (шаблон — в помощи с эссе)", "Собери портфолио из 2–3 лучших проектов к сезону подачи"] },
    ],
    headline: `Твой план по направлению «{dir}». {note}`,
    essayTitle: "Помощь с эссе",
    essayBody: `Сильное эссе для «{dir}» строится вокруг одной честной истории: что тебя зацепило, что ты сделал руками и чему научился. Начни с конкретного момента, а не с общих слов «я всегда любил…». В Lumifield+ можно прислать черновик — разберём структуру и усилим.`,
  },
  en: {
    gradeNote: {
      "9": "You have time on your side — lay a foundation and try different things.",
      "10": "A key year: gather projects and results for a strong portfolio.",
      "11": "Final sprint — focus on admission deadlines and applications.",
      "c1": "Year 1: strengthen your base, build a portfolio, and aim for internships, exchanges and contests.",
      "c2": "Year 2: time for serious applications — exchanges, internships, grants and transferring to your dream university.",
    },
    fallbackDir: "your chosen direction",
    p: [
      { title: "Now", horizon: "1–2 weeks", intro: `A quick start in "{dir}" — build a base and feel whether it's yours.`, tasks: ["Save this plan and subscribe to deadlines in the catalog", `Start one free course in "{dir}"`, "Set up a doc to collect your projects and achievements"] },
      { title: "This semester", horizon: "2–4 months", intro: "First real results for your portfolio: participation and projects with clear deadlines.", tasks: ["Pick 1–2 opportunities below and note their deadlines", "Build a first project or prepare for an olympiad", "Find a mentor or team — that's how people finish more often"] },
      { title: "This year", horizon: "6–12 months", intro: "Big goals: international programs, grants and a strong application.", tasks: ["Aim for 1 major international program or grant", "Start a motivation-essay draft (template — in essay help)", "Assemble a portfolio of 2–3 best projects for the application season"] },
    ],
    headline: `Your plan for "{dir}". {note}`,
    essayTitle: "Essay help",
    essayBody: `A strong essay for "{dir}" is built around one honest story: what hooked you, what you did with your hands, and what you learned. Start with a concrete moment, not the generic "I've always loved…". In Lumifield+ you can send a draft — we'll break down the structure and strengthen it.`,
  },
  kz: {
    gradeNote: {
      "9": "Уақытың жеткілікті — іргетас қалап, әртүрлі нәрсені байқап көр.",
      "10": "Маңызды жыл: күшті портфолио үшін жобалар мен нәтижелер жина.",
      "11": "Соңғы серпін — түсу мерзімдері мен өтініштерге назар аудар.",
      "c1": "1 курс: негізіңді нығайт, портфолио жина, тәжірибе, алмасу және байқауларға ұмтыл.",
      "c2": "2 курс: маңызды өтініштер уақыты — алмасулар, тәжірибелер, гранттар және арман университетіне ауысу.",
    },
    fallbackDir: "таңдалған бағыт",
    p: [
      { title: "Қазір", horizon: "1–2 апта", intro: `«{dir}» бағыты бойынша жылдам бастау — негіз қалап, өзіңдікі ме екенін сезін.`, tasks: ["Осы жоспарды сақтап, каталогтағы мерзімдерге жазыл", `«{dir}» бойынша бір тегін курс баста`, "Жобалар мен жетістіктеріңді жинайтын құжат аш"] },
      { title: "Осы семестр", horizon: "2–4 ай", intro: "Портфолиоға алғашқы нақты нәтижелер: нақты мерзімі бар қатысу мен жобалар.", tasks: ["Төменнен 1–2 мүмкіндік таңдап, мерзімдерін белгіле", "Алғашқы жобаны жаса не олимпиадаға дайындал", "Ментор не команда тап — солай көбірек аяғына жетеді"] },
      { title: "Осы жыл", horizon: "6–12 ай", intro: "Ірі мақсаттар: халықаралық бағдарламалар, гранттар және күшті өтініш.", tasks: ["1 ірі халықаралық бағдарлама не грантты мақсат ет", "Мотивациялық эссе жобасын баста (үлгі — эссе көмегінде)", "Тапсыру маусымына 2–3 үздік жобадан портфолио жина"] },
    ],
    headline: `«{dir}» бойынша жоспарың. {note}`,
    essayTitle: "Эссеге көмек",
    essayBody: `«{dir}» үшін күшті эссе бір шынайы тарихқа құрылады: сені не қызықтырды, қолыңмен не істедің, нені үйрендің. Жалпы «мен әрдайым жақсы көретінмін…» емес, нақты сәттен баста. Lumifield+ ішінде жобаны жіберуге болады — құрылымын талдап, күшейтеміз.`,
  },
}

function uniqBy<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>()
  return arr.filter((x) => (seen.has(key(x)) ? false : (seen.add(key(x)), true)))
}

export function buildPlan(result: AnalyzeResult, grade: Grade, lang: Lang = "ru"): Plan {
  const lead = result.top[0]?.dir
  const all = uniqBy(result.top.flatMap((t) => t.programs), (p) => p.id)

  const courses = all.filter((p) => p.cat === "course")
  const kzEvents = all.filter((p) => p.scope === "kz" && p.cat !== "course")
  const intlBig = all.filter(
    (p) => p.scope === "intl" && ["exchange", "summer", "grant", "olympiad"].includes(p.cat)
  )
  const rest = all.filter((p) => !courses.includes(p) && !kzEvents.includes(p) && !intlBig.includes(p))

  const phase1 = uniqBy([...courses, ...rest], (p) => p.id).slice(0, 3)
  const usedIds = new Set(phase1.map((p) => p.id))
  const phase2 = uniqBy([...kzEvents, ...rest], (p) => p.id).filter((p) => !usedIds.has(p.id)).slice(0, 3)
  phase2.forEach((p) => usedIds.add(p.id))
  const phase3 = uniqBy([...intlBig, ...all], (p) => p.id).filter((p) => !usedIds.has(p.id)).slice(0, 3)

  const tpl = TPL[lang]
  const dir = lead
    ? (lang === "ru" ? lead.title : DIR_TR[lead.id]?.[lang]?.title ?? lead.title)
    : tpl.fallbackDir
  const fill = (s: string) => s.replaceAll("{dir}", dir)
  const phasePrograms = [phase1, phase2.length ? phase2 : phase1.slice(0, 2), phase3.length ? phase3 : intlBig.slice(0, 2)]
  const keys = ["now", "term", "year"]

  const phases: Phase[] = tpl.p.map((ph, i) => ({
    key: keys[i],
    title: ph.title,
    horizon: ph.horizon,
    intro: fill(ph.intro),
    tasks: ph.tasks.map(fill),
    programs: phasePrograms[i],
  }))

  return {
    headline: tpl.headline.replace("{dir}", dir).replace("{note}", tpl.gradeNote[grade]),
    phases,
    essay: { title: tpl.essayTitle, body: fill(tpl.essayBody) },
  }
}
