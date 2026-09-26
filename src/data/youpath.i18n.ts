import { type Lang } from "@/lib/i18n"

// Переводы анкеты YouPath (EN / KZ). RU — исходные поля в youpath.ts.
// Значения ответов (choice/multi) хранятся как ОРИГИНАЛЬНЫЕ опции — переводим
// только отображение по индексу. blocks — по порядку YOUPATH_BLOCKS.
type YQTr = { label: string; placeholder?: string; options?: string[] }
type Pack = { blocks: string[]; subjects: string[]; q: Record<string, YQTr> }

const SUBJ_EN = ["Math", "Physics", "Computer science", "Chemistry", "Biology", "History", "Social studies", "English", "Literature", "Geography", "Economics", "Art / Technology"]
const SUBJ_KZ = ["Математика", "Физика", "Информатика", "Химия", "Биология", "Тарих", "Қоғамтану", "Ағылшын", "Әдебиет", "География", "Экономика", "Бейнелеу / Технология"]

const EN: Pack = {
  blocks: ["Block 1 — Academic profile", "Block 2 — Language certificates", "Block 3 — Personality & interests", "Block 4 — Goals & constraints"],
  subjects: SUBJ_EN,
  q: {
    gpa_scale: { label: "GPA scale" },
    gpa: { label: "Your GPA", placeholder: "e.g. 3.8" },
    grade: { label: "Grade / year", options: ["Grade 9", "Grade 10", "Grade 11", "Year 1", "Year 2"] },
    strong_sub: { label: "Strong subjects", options: SUBJ_EN },
    weak_sub: { label: "Weak subjects", options: SUBJ_EN },
    ielts: { label: "IELTS", placeholder: "score or 'no'" },
    toefl: { label: "TOEFL", placeholder: "score or 'no'" },
    hsk: { label: "HSK", placeholder: "level or 'no'" },
    other_lang: { label: "Other languages", placeholder: "German B2 / 'no'" },
    interests: { label: "What you do in free time", placeholder: "code, sport, music…" },
    work_style: { label: "Work style", options: ["Solo", "In a team", "Both"] },
    stress: { label: "How you handle stress", placeholder: "sport, planning…" },
    values: { label: "What matters more", options: ["Salary", "Impact", "Creativity", "Stability"] },
    activities: { label: "Extracurriculars", placeholder: "olympiads, volunteering, projects" },
    country: { label: "Preferred country", placeholder: "USA / Germany / Kazakhstan…" },
    budget: { label: "Budget per year, USD", placeholder: "e.g. 15000" },
    work_after: { label: "Goal after studies", options: ["Stay abroad", "Return to KZ", "Doesn't matter"] },
    timeline: { label: "Year of admission", placeholder: "e.g. 2027" },
    dream_uni: { label: "Dream university", placeholder: "'no' if none" },
    weakness: { label: "Main profile weakness", placeholder: "in your opinion" },
  },
}

const KZ: Pack = {
  blocks: ["1-блок — Академиялық профиль", "2-блок — Тіл сертификаттары", "3-блок — Тұлға және қызығушылық", "4-блок — Мақсаттар мен шектеулер"],
  subjects: SUBJ_KZ,
  q: {
    gpa_scale: { label: "GPA шкаласы" },
    gpa: { label: "Сенің GPA", placeholder: "мыс. 3.8" },
    grade: { label: "Сынып / курс", options: ["9 сынып", "10 сынып", "11 сынып", "1 курс", "2 курс"] },
    strong_sub: { label: "Күшті пәндер", options: SUBJ_KZ },
    weak_sub: { label: "Әлсіз пәндер", options: SUBJ_KZ },
    ielts: { label: "IELTS", placeholder: "балл не «жоқ»" },
    toefl: { label: "TOEFL", placeholder: "балл не «жоқ»" },
    hsk: { label: "HSK", placeholder: "деңгей не «жоқ»" },
    other_lang: { label: "Басқа тілдер", placeholder: "неміс B2 / «жоқ»" },
    interests: { label: "Бос уақытта немен айналысасың", placeholder: "код, спорт, музыка…" },
    work_style: { label: "Жұмыс стилі", options: ["Жалғыз", "Командада", "Екеуі де"] },
    stress: { label: "Стреспен қалай күресесің", placeholder: "спорт, жоспарлау…" },
    values: { label: "Не маңыздырақ", options: ["Жалақы", "Ықпал", "Шығармашылық", "Тұрақтылық"] },
    activities: { label: "Мектептен тыс белсенділік", placeholder: "олимпиадалар, волонтёрлік, жобалар" },
    country: { label: "Қалаған ел", placeholder: "АҚШ / Германия / Қазақстан…" },
    budget: { label: "Жылдық бюджет, USD", placeholder: "мыс. 15000" },
    work_after: { label: "Оқудан кейінгі мақсат", options: ["Шетелде қалу", "KZ-ға оралу", "Маңызды емес"] },
    timeline: { label: "Түсу жылы", placeholder: "мыс. 2027" },
    dream_uni: { label: "Арман университеті", placeholder: "жоқ болса «жоқ»" },
    weakness: { label: "Профильдің басты әлсіздігі", placeholder: "сенің ойыңша" },
  },
}

export const YP_TR: Record<Exclude<Lang, "ru">, Pack> = { en: EN, kz: KZ }
