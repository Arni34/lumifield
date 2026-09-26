// Координаты стран-направлений + распознавание в тексте отчёта (RU/EN).
export type Geo = { name: string; lat: number; lng: number; aliases: string[] }

export const COUNTRIES: Geo[] = [
  { name: "Казахстан", lat: 48, lng: 68, aliases: ["казахстан", "kazakhstan", "kz"] },
  { name: "США", lat: 39, lng: -98, aliases: ["сша", "usa", "united states", "америк", "u.s."] },
  { name: "Германия", lat: 51, lng: 10, aliases: ["герман", "germany", "deutsch"] },
  { name: "Великобритания", lat: 54, lng: -2, aliases: ["британ", "англи", "uk", "united kingdom", "england"] },
  { name: "Нидерланды", lat: 52, lng: 5, aliases: ["нидерланд", "голланд", "netherlands", "holland"] },
  { name: "Сингапур", lat: 1.3, lng: 103.8, aliases: ["сингапур", "singapore"] },
  { name: "Китай", lat: 35, lng: 104, aliases: ["кита", "china", "китай"] },
  { name: "Корея", lat: 36, lng: 128, aliases: ["коре", "korea"] },
  { name: "Канада", lat: 56, lng: -106, aliases: ["канад", "canada"] },
  { name: "Австралия", lat: -25, lng: 133, aliases: ["австрал", "australia"] },
  { name: "Франция", lat: 46, lng: 2, aliases: ["франц", "france"] },
  { name: "Италия", lat: 42, lng: 12, aliases: ["итали", "italy"] },
  { name: "Испания", lat: 40, lng: -4, aliases: ["испан", "spain"] },
  { name: "Япония", lat: 36, lng: 138, aliases: ["япон", "japan"] },
  { name: "Турция", lat: 39, lng: 35, aliases: ["турци", "turkey", "türkiye"] },
  { name: "ОАЭ", lat: 24, lng: 54, aliases: ["оаэ", "эмират", "uae", "emirates", "dubai", "дубай"] },
  { name: "Швейцария", lat: 47, lng: 8, aliases: ["швейцар", "switzerland"] },
  { name: "Швеция", lat: 62, lng: 15, aliases: ["швеци", "sweden"] },
  { name: "Чехия", lat: 49.8, lng: 15.5, aliases: ["чехи", "czech"] },
  { name: "Польша", lat: 52, lng: 19, aliases: ["польш", "poland"] },
]

/** Находит упомянутые страны в тексте (по псевдонимам), сохраняя порядок появления. */
export function findCountries(text: string): Geo[] {
  const low = text.toLowerCase()
  const out: Geo[] = []
  for (const c of COUNTRIES) {
    if (c.aliases.some((a) => low.includes(a))) out.push(c)
  }
  return out
}

export function findCountry(name: string): Geo | null {
  const low = (name || "").toLowerCase()
  return COUNTRIES.find((c) => c.aliases.some((a) => low.includes(a))) ?? null
}
