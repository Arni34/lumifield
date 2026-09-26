// YouPath AI — анкета из 20 вопросов в 4 блоках (как в оригинальном скрипте).
export type YQ = {
  id: string
  label: string
  placeholder?: string
  type?: "text" | "choice" | "multi" // text по умолчанию; choice — кнопки; multi — чипы
  options?: string[]
  max?: number // для multi — максимум выбранных
}
export type YBlock = { title: string; questions: YQ[] }

export const SUBJECTS = [
  "Математика", "Физика", "Информатика", "Химия", "Биология", "История",
  "Обществознание", "Английский", "Литература", "География", "Экономика", "ИЗО/Технология",
]

export const YOUPATH_BLOCKS: YBlock[] = [
  {
    title: "Блок 1 — Академический профиль",
    questions: [
      { id: "gpa_scale", label: "Шкала GPA", type: "choice", options: ["4.0", "5.0", "100"] },
      { id: "gpa", label: "Ваш GPA", placeholder: "напр. 3.8" },
      { id: "grade", label: "Класс / курс", type: "choice", options: ["9 класс", "10 класс", "11 класс", "1 курс", "2 курс"] },
      { id: "strong_sub", label: "Сильные предметы", type: "multi", options: SUBJECTS, max: 3 },
      { id: "weak_sub", label: "Слабые предметы", type: "multi", options: SUBJECTS, max: 3 },
    ],
  },
  {
    title: "Блок 2 — Языковые сертификаты",
    questions: [
      { id: "ielts", label: "IELTS", placeholder: "балл или «нет»" },
      { id: "toefl", label: "TOEFL", placeholder: "балл или «нет»" },
      { id: "hsk", label: "HSK", placeholder: "уровень или «нет»" },
      { id: "other_lang", label: "Другие языки", placeholder: "немецкий B2 / «нет»" },
    ],
  },
  {
    title: "Блок 3 — Личность и интересы",
    questions: [
      { id: "interests", label: "Чем занимаешься в свободное время", placeholder: "код, спорт, музыка…" },
      { id: "work_style", label: "Стиль работы", type: "choice", options: ["Один", "В команде", "Оба"] },
      { id: "stress", label: "Как справляешься со стрессом", placeholder: "спорт, планирование…" },
      { id: "values", label: "Что важнее", type: "choice", options: ["Зарплата", "Влияние", "Творчество", "Стабильность"] },
    ],
  },
  {
    title: "Блок 4 — Цели и ограничения",
    questions: [
      { id: "activities", label: "Внешкольная активность", placeholder: "олимпиады, волонтёрство, проекты" },
      { id: "country", label: "Желаемая страна", placeholder: "США / Германия / Казахстан…" },
      { id: "budget", label: "Бюджет в год, USD", placeholder: "напр. 15000" },
      { id: "work_after", label: "Цель после учёбы", type: "choice", options: ["Остаться за рубежом", "Вернуться в KZ", "Не важно"] },
      { id: "timeline", label: "Год поступления", placeholder: "напр. 2027" },
      { id: "dream_uni", label: "Университет мечты", placeholder: "«нет» если нет" },
      { id: "weakness", label: "Главная слабость профиля", placeholder: "по твоему мнению" },
    ],
  },
]

export const YOUPATH_QUESTIONS: YQ[] = YOUPATH_BLOCKS.flatMap((b) => b.questions)
export type YAnswers = Record<string, string>
