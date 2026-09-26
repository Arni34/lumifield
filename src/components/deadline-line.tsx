import { CalendarClock } from "lucide-react"
import { useStore } from "@/lib/store"
import { nearestDeadline } from "@/lib/deadlines"
import { useI18n } from "@/lib/i18n"

// Срочность ТОЛЬКО из реальных дат: заявки пользователя (ISO) и дедлайны вузов
// из каталога. Нет разобранной даты — нет строки (см. правило в lib/deadlines.ts).
// Никаких обратных отсчётов, «осталось N мест» и выдуманных сроков.
export function DeadlineLine() {
  const { t } = useI18n()
  const { savedResult, apps } = useStore()
  const nearest = nearestDeadline(savedResult, apps)
  if (!nearest) return null

  const { name, days } = nearest
  // Цвет по близости: ≤14 дней — сплошной акцент, ≤30 — контур, дальше — спокойно.
  const tone =
    days <= 14 ? "border-foreground bg-brand text-brand-foreground"
    : days <= 30 ? "border-brand bg-brand/10 text-foreground"
    : "border-foreground/30 bg-card text-foreground"

  return (
    <div className={"flex flex-wrap items-center gap-x-2 gap-y-1 border-2 p-3 sm:p-4 " + tone}>
      <CalendarClock className="size-4 shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-widest">{t("ddl.near")}</span>
      <span className="text-[15px] font-black leading-tight">{name}</span>
      <span className="ml-auto whitespace-nowrap text-[13px] font-bold uppercase tracking-wider">
        {days === 0 ? t("ddl.today") : <>{days} {t(days === 1 ? "ddl.day" : "ddl.days")}</>}
      </span>
    </div>
  )
}
