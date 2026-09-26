import { Lock, GraduationCap, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { TrialButton } from "@/components/trial-button"

// Момент наивысшего намерения: пользователь тянется именно к закрытому.
// Показываем ЕГО результат (реальное число вузов из его отчёта), что именно
// за замком, и два честных пути: пробный период или ручная оплата.
// Закрывается одним касанием — «Не сейчас» всегда на виду.
export type UnlockContext = "unis" | "plan" | "globe" | "assess" | "essay" | "tracker"

export function UnlockSheet({
  context, uniCount = 0, onClose, onOpenPricing, onNeedAccount,
}: {
  context: UnlockContext
  uniCount?: number
  onClose: () => void
  onOpenPricing: () => void
  onNeedAccount: () => void
}) {
  const { t } = useI18n()
  const showUnis = context === "unis" && uniCount > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto border-t-2 border-foreground bg-background p-6 sm:border-2 sm:brutal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <Lock className="size-3.5 text-brand" /> {t("ul.badge")}
          </span>
          <button onClick={onClose} className="ml-auto -mr-1 -mt-1 p-1 text-muted-foreground hover:text-brand" aria-label={t("ul.close")}>
            <X className="size-5" />
          </button>
        </div>

        {showUnis ? (
          <>
            <h2 className="mt-3 flex items-baseline gap-2 text-2xl font-black uppercase leading-tight tracking-tight">
              <GraduationCap className="size-6 shrink-0 text-brand" />
              <span><span className="tabular-nums">{uniCount}</span> {t("ul.unis.t")}</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{t("ul.unis.d")}</p>
            <ul className="mt-4 grid gap-1.5 border-t-2 border-foreground pt-4 sm:grid-cols-2">
              {["1", "2", "3", "4", "5", "6"].map((n) => (
                <li key={n} className="flex items-start gap-2 text-[14px] leading-snug text-foreground/85">
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" /> {t(`yl.f${n}`)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-2xl font-black uppercase leading-tight tracking-tight">{t(`ul.${context}.t`)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{t(`ul.${context}.d`)}</p>
          </>
        )}

        <div className="mt-5 border-t-2 border-foreground pt-5">
          <TrialButton onNeedAccount={() => { onClose(); onNeedAccount() }} onStarted={onClose} />
          <Button
            onClick={() => { onClose(); onOpenPricing() }}
            variant="outline"
            className="mt-3 h-12 w-full rounded-none border-2 border-foreground text-[12px] font-bold uppercase tracking-wider sm:w-auto"
          >
            {t("ul.plans")}
          </Button>
          <button onClick={onClose} className="mt-3 block text-[12px] font-bold uppercase tracking-wider text-muted-foreground underline underline-offset-4 hover:text-brand">
            {t("tr.later")}
          </button>
        </div>
      </div>
    </div>
  )
}
