import { type TariffId } from "@/lib/store"

// Переводы тарифов (EN / KZ). RU — исходные поля в tariffs.ts. Названия (Free /
// Lumifield+ / Lumifield Pro) и цены не переводим — резолвится в Pricing по языку.
type TT = { period: string; tagline: string; features: string[]; cta: string }

export const TARIFF_TR: Record<TariffId, { en: TT; kz: TT }> = {
  free: {
    en: {
      period: "forever", tagline: "Guidance and a first plan", cta: "Choose",
      features: ["AI report: careers, motivation letter and books", "Shortlist of matched universities — names only", "Admission roadmap: the whole \"Now\" phase", "Full opportunity catalog, search and filters"],
    },
    kz: {
      period: "мәңгі", tagline: "Профбағдар және жоспар бастауы", cta: "Таңдау",
      features: ["AI-есеп: мамандықтар, мотивациялық хат және кітаптар", "Таңдалған университеттер тізімі — тек атаулары", "Оқуға түсу жоспары: «Қазір» кезеңі толық", "Толық мүмкіндіктер каталогы, іздеу және сүзгілер"],
    },
  },
  plus: {
    en: {
      period: "per month", tagline: "AI tools for admission", cta: "Buy",
      features: ["Everything in Free", "Full admission roadmap: all 3 phases + 3D map", "University matching — without deadlines", "IELTS / SAT / HSK level test + admission chance", "AI essay assistant (Lumifield AI)"],
    },
    kz: {
      period: "айына", tagline: "Оқуға түсуге AI-құралдар", cta: "Сатып алу",
      features: ["Free ішіндегінің бәрі", "Толық оқуға түсу жоспары: 3 кезең + 3D-карта", "Университет таңдау — мерзімсіз", "IELTS / SAT / HSK деңгей тесті + түсу мүмкіндігі", "AI эссе көмекшісі (Lumifield AI)"],
    },
  },
  package: {
    en: {
      period: "every 6 months", tagline: "Maximum AI for admission", cta: "Buy",
      features: ["Everything in Lumifield+", "Universities with deadlines and a full breakdown", "Advanced AI review of essays and applications", "Priority support", "Preparation strategy until submission"],
    },
    kz: {
      period: "6 айда бір", tagline: "Оқуға түсуге максимум AI", cta: "Сатып алу",
      features: ["Lumifield+ ішіндегінің бәрі", "Мерзімі мен толық талдауы бар университеттер", "Эссе мен өтініштердің кеңейтілген AI-талдауы", "Басым қолдау", "Тапсыруға дейінгі дайындық стратегиясы"],
    },
  },
}

// Ярлыки тарифов для аккаунта/плана (EN / KZ). RU — TARIFF_LABEL из tariffs.ts.
export const TARIFF_NAME_TR: Record<Exclude<TariffId, never>, { en: string; kz: string }> = {
  free: { en: "Free", kz: "Free" },
  plus: { en: "Lumifield+", kz: "Lumifield+" },
  package: { en: "Lumifield Pro", kz: "Lumifield Pro" },
}
