import { type DirId } from "@/data/directions"

// Вузы для подбора (Lumifield+/Pro) и модели вероятности поступления.
// sat — ориентир проходного (из 1600); ielts — минимальный балл;
// sel — селективность 0..1 (выше = труднее поступить); dl — дедлайн подачи.
export type Uni = {
  id: string
  name: string
  country: string
  flag: string
  dirs: DirId[]
  sat: number
  ielts: number
  sel: number
  dl: string
}

export const UNIS: Uni[] = [
  // Казахстан
  { id: "nu", name: "Nazarbayev University", country: "Казахстан", flag: "🇰🇿", dirs: ["it", "eng", "sci", "math", "med"], sat: 1300, ielts: 6.5, sel: 0.72, dl: "до 1 февраля" },
  { id: "kbtu", name: "KBTU", country: "Казахстан", flag: "🇰🇿", dirs: ["it", "eng", "math", "biz"], sat: 1150, ielts: 6.0, sel: 0.5, dl: "до 20 июля" },
  { id: "sdu", name: "SDU University", country: "Казахстан", flag: "🇰🇿", dirs: ["it", "eng", "biz", "soc"], sat: 1050, ielts: 5.5, sel: 0.4, dl: "до 25 августа" },
  { id: "aitu", name: "Astana IT University", country: "Казахстан", flag: "🇰🇿", dirs: ["it", "math", "design"], sat: 1080, ielts: 5.5, sel: 0.42, dl: "до 25 августа" },
  // США
  { id: "mit", name: "MIT", country: "США", flag: "🇺🇸", dirs: ["it", "eng", "sci", "math"], sat: 1550, ielts: 7.0, sel: 0.97, dl: "1 января" },
  { id: "stanford", name: "Stanford", country: "США", flag: "🇺🇸", dirs: ["it", "biz", "eng", "sci"], sat: 1520, ielts: 7.0, sel: 0.96, dl: "5 января" },
  { id: "harvard", name: "Harvard", country: "США", flag: "🇺🇸", dirs: ["soc", "biz", "med", "sci"], sat: 1540, ielts: 7.0, sel: 0.97, dl: "1 января" },
  { id: "berkeley", name: "UC Berkeley", country: "США", flag: "🇺🇸", dirs: ["it", "eng", "sci", "biz"], sat: 1440, ielts: 6.5, sel: 0.88, dl: "30 ноября" },
  // Европа
  { id: "tum", name: "TU Munich", country: "Германия", flag: "🇩🇪", dirs: ["eng", "it", "sci", "math"], sat: 1300, ielts: 6.5, sel: 0.7, dl: "15 января" },
  { id: "imperial", name: "Imperial College", country: "Британия", flag: "🇬🇧", dirs: ["eng", "sci", "med", "it"], sat: 1450, ielts: 7.0, sel: 0.88, dl: "15 октября" },
  { id: "lse", name: "LSE", country: "Британия", flag: "🇬🇧", dirs: ["biz", "soc", "math"], sat: 1470, ielts: 7.0, sel: 0.9, dl: "15 октября" },
  { id: "delft", name: "TU Delft", country: "Нидерланды", flag: "🇳🇱", dirs: ["eng", "it", "design", "sci"], sat: 1320, ielts: 6.5, sel: 0.68, dl: "15 января" },
  // Азия
  { id: "nus", name: "NUS", country: "Сингапур", flag: "🇸🇬", dirs: ["it", "biz", "eng", "med"], sat: 1460, ielts: 6.5, sel: 0.85, dl: "1 марта" },
  { id: "tsinghua", name: "Tsinghua", country: "Китай", flag: "🇨🇳", dirs: ["eng", "it", "sci", "math"], sat: 1480, ielts: 6.5, sel: 0.9, dl: "31 декабря" },
  { id: "kaist", name: "KAIST", country: "Корея", flag: "🇰🇷", dirs: ["it", "eng", "sci", "math"], sat: 1400, ielts: 6.5, sel: 0.82, dl: "октябрь (early)" },
]

export function unisForDir(dir: DirId, limit = 6): Uni[] {
  return UNIS.filter((u) => u.dirs.includes(dir)).sort((a, b) => b.sel - a.sel).slice(0, limit)
}
