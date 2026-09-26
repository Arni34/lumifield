import { Sparkles, Check } from "lucide-react"
import { useStore, startTrial } from "@/lib/store"
import { canStartTrial } from "@/lib/billing"
import { AUTH_ON, useSession } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

// «Попробовать Plus 7 дней бесплатно» — главный путь, пока оплата ручная.
// Без карты, отменять нечего: тариф сам вернётся на Free (см. enforceTariffExpiry).
// Кнопка не рендерится, если пробный уже использован или тариф платный.
export function TrialButton({
  onNeedAccount, onStarted, size = "lg",
}: {
  onNeedAccount: () => void
  onStarted?: () => void
  size?: "lg" | "sm"
}) {
  const { t } = useI18n()
  const state = useStore()
  const session = useSession()
  // Без бэкенда (AUTH_ON=false) аккаунт не нужен — тариф живёт локально.
  const hasSession = !AUTH_ON || !!session

  if (state.trialUsed || state.tariff !== "free") return null

  const eligible = canStartTrial(state, hasSession)

  return (
    <div>
      <Button
        onClick={() => {
          if (!eligible) { onNeedAccount(); return } // нет аккаунта — сначала вход
          if (startTrial()) onStarted?.()
        }}
        className={
          "brutal brutal-press w-full whitespace-normal rounded-none border-2 border-foreground bg-brand font-bold uppercase leading-tight tracking-wider text-brand-foreground hover:bg-foreground hover:text-background sm:w-auto " +
          (size === "lg" ? "h-auto min-h-14 px-6 py-3 text-base sm:min-h-12 sm:text-sm" : "h-auto min-h-12 px-5 py-2.5 text-[13px]")
        }
      >
        <Sparkles className="size-4 shrink-0" /> {t("tr.cta")}
      </Button>
      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-muted-foreground">
        <Check className="mt-0.5 size-3.5 shrink-0 text-brand" /> {t("tr.ctaNote")}
      </p>
    </div>
  )
}
