import { type TariffId } from "@/lib/store"

export type Tariff = {
  id: TariffId
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  cta: string
  highlight?: boolean
  oneTime?: boolean
}

export const TARIFFS: Tariff[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "навсегда",
    tagline: "Профориентация и старт плана",
    features: [
      "AI-отчёт: профессии, мотивационное письмо и книги",
      "Список подобранных вузов — названия без деталей",
      "План поступления: этап «Сейчас» целиком",
      "Полный каталог возможностей, поиск и фильтры",
    ],
    cta: "Выбрать",
  },
  {
    id: "plus",
    name: "Lumifield+",
    price: "$15",
    period: "в месяц",
    tagline: "AI-инструменты для поступления",
    highlight: true,
    features: [
      "Всё из Free",
      "Полный план поступления: все 3 этапа + 3D-карта",
      "Подбор вузов под тебя — без дедлайнов",
      "Тест уровня IELTS / SAT / HSK + шанс поступления",
      "AI-помощник по эссе (Lumifield AI)",
    ],
    cta: "Купить",
  },
  {
    id: "package",
    name: "Lumifield Pro",
    price: "$50",
    period: "раз в 6 месяцев",
    tagline: "Максимум AI для поступления",
    features: [
      "Всё из Lumifield+",
      "Вузы с дедлайнами и полным разбором",
      "Расширенный AI-разбор эссе и заявок",
      "Приоритетная поддержка",
      "Стратегия подготовки до подачи",
    ],
    cta: "Купить",
  },
]

export const TARIFF_LABEL: Record<TariffId, string> = {
  free: "Free",
  plus: "Lumifield+",
  package: "Lumifield Pro",
}
