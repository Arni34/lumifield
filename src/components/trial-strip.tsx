import { Clock } from "lucide-react"
import { useStore } from "@/lib/store"
import { TARIFF_LABEL } from "@/data/tariffs"
import { TARIFF_NAME_TR } from "@/data/tariffs.i18n"
import { daysLeft, isEndingSoon } from "@/lib/billing"
import { useI18n } from "@/lib/i18n"

// Постоянная полоса состояния под шапкой: «PLUS · 5 ДНЕЙ ОСТАЛОСЬ».
// Отдельной полосой, а не бейджем в шапке: на 375px шапка уже занята
// (лого, EN/KZ/RU, тема, аккаунт, «домой»).
export function TrialStrip({ onOpenDetails }: { onOpenDetails: () => void }) {
  const { t, lang } = useI18n()
  const { tariff, tariffUntil } = useStore()
  const d = daysLeft(tariffUntil)
  if (tariff === "free" || d === null) return null // бессрочный тариф — полоса не нужна

  const name = lang === "ru" ? TARIFF_LABEL[tariff] : TARIFF_NAME_TR[tariff][lang]
  const soon = isEndingSoon(tariffUntil)

  return (
    <div className={"border-b-2 border-foreground " + (soon ? "bg-brand text-brand-foreground" : "bg-card")}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <Clock className="size-3.5" /> {name} ·{" "}
          {d === 0 ? t("tr.endsToday") : <>{d} {t(d === 1 ? "tr.dayLeft" : "tr.daysLeft")}</>}
        </span>
        <button
          onClick={onOpenDetails}
          className={"ml-auto text-[11px] font-bold uppercase tracking-widest underline underline-offset-4 " + (soon ? "hover:opacity-80" : "text-brand hover:opacity-80")}
        >
          {t("tr.what")}
        </button>
      </div>
    </div>
  )
}
