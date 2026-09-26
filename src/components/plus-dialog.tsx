import { Check, Lock, ArrowRight, Clock } from "lucide-react"
import { useStore, dismissExpiryNotice } from "@/lib/store"
import { usageDuringPlus, LOCKED_ON_FREE } from "@/lib/billing"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

// Честный разговор об окончании Plus. Два состояния:
// "ending" — осталось ≤2 дней; "ended" — тариф уже вернулся на Free.
// Показываем ровно то, чем человек пользовался (реальные счётчики), и что закроется.
// Закрыть можно всегда одним касанием — никаких ловушек.
export type PlusDialogMode = "ending" | "ended"

export function PlusDialog({
  mode, days, onClose, onOpenPricing,
}: {
  mode: PlusDialogMode
  days: number | null
  onClose: () => void
  onOpenPricing: () => void
}) {
  const { t } = useI18n()
  const state = useStore()
  const usage = usageDuringPlus(state)

  function close() {
    if (mode === "ended") dismissExpiryNotice()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4" onClick={close}>
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto border-t-2 border-foreground bg-background p-6 sm:border-2 sm:brutal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Clock className="size-3.5 text-brand" /> {t(mode === "ending" ? "tr.end.badge" : "tr.over.badge")}
        </div>

        <h2 className="mt-3 text-2xl font-black uppercase leading-tight tracking-tight">
          {t(mode === "ending" ? "tr.end.t" : "tr.over.t")}
        </h2>
        {mode === "ending" && days !== null && (
          <p className="mt-1 text-[13px] font-bold uppercase tracking-wider text-brand">
            {days === 0 ? t("tr.endsToday") : <>{days} {t(days === 1 ? "tr.dayLeft" : "tr.daysLeft")}</>}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">
          {t(mode === "ending" ? "tr.end.d" : "tr.over.d")}
        </p>

        {usage.length > 0 && (
          <div className="mt-5 border-t-2 border-foreground pt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("tr.usedT")}</p>
            <ul className="mt-2 space-y-1.5">
              {usage.map((u) => (
                <li key={u.key} className="flex items-start gap-2 text-[15px] text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span><span className="font-black tabular-nums">{u.n}</span> {t(u.key)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 border-t-2 border-foreground pt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {t(mode === "ending" ? "tr.loseT" : "tr.lostT")}
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {LOCKED_ON_FREE.map((k) => (
              <li key={k} className="flex items-start gap-2 text-[14px] leading-snug text-foreground/85">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" /> {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">{t("tr.keepFree")}</p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => { close(); onOpenPricing() }}
            className="brutal-sm brutal-press h-12 flex-1 rounded-none border-2 border-foreground bg-brand text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"
          >
            {t("tr.keep")} <ArrowRight className="size-4" />
          </Button>
          <Button onClick={close} variant="outline" className="h-12 rounded-none border-2 border-foreground px-5 text-[12px] font-bold uppercase tracking-wider">
            {t("tr.later")}
          </Button>
        </div>
      </div>
    </div>
  )
}
