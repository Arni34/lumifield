import { Check } from "lucide-react"
import { useStore } from "@/lib/store"
import { useI18n } from "@/lib/i18n"

// Полоса пути: 1 профориентация → 2 план → 3 подача.
// Состояние берём из стора (реальные данные), а не из пропсов:
// шаг считается пройденным, только если у пользователя действительно есть отчёт,
// отмеченные задачи плана или добавленные заявки.
export type JourneyStep = 1 | 2 | 3

export function useJourneyDone(): [boolean, boolean, boolean] {
  const { reports, savedResult, progress, apps } = useStore()
  return [
    reports.length > 0 || !!savedResult,
    Object.values(progress).some(Boolean),
    apps.length > 0,
  ]
}

export function JourneySteps({ current, onGo }: { current: JourneyStep; onGo?: (s: JourneyStep) => void }) {
  const { t } = useI18n()
  const done = useJourneyDone()
  const steps: JourneyStep[] = [1, 2, 3]

  return (
    <div className="grid grid-cols-3 border-2 border-foreground">
      {steps.map((s, i) => {
        const isDone = done[i]
        const isCur = s === current
        const Tag = onGo ? "button" : "div"
        return (
          <Tag
            key={s}
            {...(onGo ? { onClick: () => onGo(s), type: "button" as const } : {})}
            className={
              "flex items-center gap-2 px-2.5 py-2.5 text-left transition-colors sm:px-4 " +
              (i > 0 ? "border-l-2 border-foreground " : "") +
              (isCur ? "bg-foreground text-background " : "bg-card ") +
              (onGo ? "brutal-press hover:bg-brand hover:text-brand-foreground" : "")
            }
          >
            <span
              className={
                "grid size-5 shrink-0 place-items-center border-2 text-[10px] font-black tabular-nums sm:size-6 sm:text-[11px] " +
                (isCur ? "border-background" : "border-foreground") +
                (isDone && !isCur ? " bg-brand text-brand-foreground border-brand" : "")
              }
            >
              {isDone ? <Check className="size-3 sm:size-3.5" /> : s}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block hyphens-auto break-words text-[10px] font-bold uppercase leading-tight tracking-wider sm:text-[11px]">
                {t(`js.s${s}`)}
              </span>
            </span>
          </Tag>
        )
      })}
    </div>
  )
}
