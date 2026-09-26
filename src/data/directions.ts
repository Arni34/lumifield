import { type Cat } from "@/data/programs"

// Академические направления, которые выдаёт AI-профориентация.
// Каждое направление знает, из каких категорий каталога и по каким тегам
// подбирать реальные программы (интеграция каталога в результат).

export type DirId =
  | "it" | "eng" | "sci" | "math"
  | "biz" | "soc" | "med" | "design"

export type Direction = {
  id: DirId
  title: string
  tagline: string
  d: string
  // из каких категорий каталога тянуть программы
  cats: Cat[]
  // ключевые слова для точного матча по тегам/названию/описанию
  hints: string[]
}

export const DIRECTIONS: Record<DirId, Direction> = {
  it: {
    id: "it",
    title: "IT и разработка",
    tagline: "Код, приложения, искусственный интеллект",
    d: "Ты создаёшь через код: сайты, приложения, ИИ. Востребованное направление с быстрым входом — проекты можно собирать уже в школе.",
    cats: ["hack", "course", "internship"],
    hints: ["swift", "python", "ios", "app", "cs", "coding", "ai", "azure", "data", "startup"],
  },
  eng: {
    id: "eng",
    title: "Инженерия и робототехника",
    tagline: "Железо, роботы, как устроены вещи",
    d: "Тебе интересно строить и чинить в физическом мире: роботы, электроника, механизмы. Путь через олимпиады по физике и робо-лиги.",
    cats: ["hack", "summer", "olympiad"],
    hints: ["robotics", "iot", "first", "space", "hardware", "ioi"],
  },
  sci: {
    id: "sci",
    title: "Естественные науки",
    tagline: "Физика, химия, биология, космос",
    d: "Ты хочешь понять, как устроен мир, и проверять это опытом. Сильная база для науки и медицины — начинается с олимпиад и летних школ.",
    cats: ["olympiad", "summer", "course"],
    hints: ["space", "data", "stem", "science", "physics", "ipho"],
  },
  math: {
    id: "math",
    title: "Математика и Data",
    tagline: "Логика, задачи, анализ данных",
    d: "Тебе заходят чистая логика и красивые задачи. Математика — ключ к CS, экономике и науке. Твой трамплин — предметные олимпиады.",
    cats: ["olympiad", "course", "hack"],
    hints: ["imo", "ioi", "math", "data", "cs"],
  },
  biz: {
    id: "biz",
    title: "Бизнес и предпринимательство",
    tagline: "Идеи, продукты, стартапы, деньги",
    d: "Ты придумываешь и хочешь превращать идеи в дело. Направление про запуск проектов, питчи и лидерство — прокачивается на конкурсах стартапов.",
    cats: ["hack", "summer", "leadership"],
    hints: ["startup", "entrepreneurship", "pitch", "business", "innovation"],
  },
  soc: {
    id: "soc",
    title: "Общество и международные отношения",
    tagline: "Право, политика, дипломатия, дебаты",
    d: "Тебе важны люди, справедливость и умение убеждать. Путь в юристы, дипломаты и лидеров — через дебаты, MUN и обмены.",
    cats: ["leadership", "exchange", "olympiad"],
    hints: ["mun", "debate", "diplomacy", "team", "award"],
  },
  med: {
    id: "med",
    title: "Медицина и науки о здоровье",
    tagline: "Помогать людям, биология, здоровье",
    d: "Ты хочешь помогать людям напрямую и тебе близка биология. Основа — сильная химия и биология плюс исследовательские летние программы.",
    cats: ["olympiad", "summer", "course"],
    hints: ["science", "stem", "data"],
  },
  design: {
    id: "design",
    title: "Дизайн и творчество",
    tagline: "Визуал, продукт, самовыражение",
    d: "Ты создаёшь через образ и форму: дизайн, медиа, продукт. Хорошо сочетается с IT (продуктовый дизайн) и предпринимательством.",
    cats: ["hack", "course", "summer"],
    hints: ["app", "design", "creative", "girls"],
  },
}

export const DIR_LIST = Object.values(DIRECTIONS)
