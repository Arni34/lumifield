import { useMemo, useState } from "react"
import { Lock, Sparkles, ArrowRight, PenLine, CalendarClock, Check, Trophy, MapPin, GraduationCap } from "lucide-react"
import { type AnalyzeResult } from "@/lib/profori"
import { buildPlan, type Grade } from "@/lib/plan"
import { useStore, isPaid, toggleTask, setGrade } from "@/lib/store"
import { TARIFF_LABEL } from "@/data/tariffs"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ProgramCard } from "@/components/program-card"
import { DeadlineLine } from "@/components/deadline-line"
import { UnlockSheet, type UnlockContext } from "@/components/unlock-sheet"
import { ShareRow } from "@/components/share-row"
import Globe, { type Marker } from "@/components/Globe"
import Assess from "@/Assess"
import { openLumifieldAI } from "@/components/lumifield-ai"

const GRADES: Grade[] = ["9", "10", "11", "c1", "c2"]
// Подписи: школа — числом, вуз — «1 курс»/«2 курс» на языке интерфейса.
const GRADE_LABEL: Record<Grade, Record<"ru" | "en" | "kz", string>> = {
  "9": { ru: "9", en: "9", kz: "9" },
  "10": { ru: "10", en: "10", kz: "10" },
  "11": { ru: "11", en: "11", kz: "11" },
  c1: { ru: "1 курс", en: "Year 1", kz: "1 курс" },
  c2: { ru: "2 курс", en: "Year 2", kz: "2 курс" },
}
const PHASE_COLORS = ["#d8452f", "#e8912e", "#2c8fb0"]

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function Plan({
  result, onOpenPricing, onOpenNavigator, onOpenAccount,
}: {
  result: AnalyzeResult | null
  onOpenPricing: () => void
  onOpenNavigator: () => void
  onOpenAccount: () => void
}) {
  const { t, lang } = useI18n()
  const { tariff, progress, grade: savedGrade } = useStore()
  // Класс берём из профиля (его задаёт анкета профориентации) — не сбрасывается
  // при каждом открытии карты. Ручной выбор тоже запоминается.
  const grade: Grade = savedGrade ?? "10"
  const [showTest, setShowTest] = useState(false) // прогоночный тест прямо в карте
  const [unlock, setUnlock] = useState<UnlockContext | null>(null)
  const plan = useMemo(() => (result ? buildPlan(result, grade, lang) : null), [result, grade, lang])

  // маркеры для глобуса: kz кластерятся над Казахстаном, intl разбросаны детерминированно
  const { markers, labels } = useMemo(() => {
    const markers: Marker[] = []
    const labels: string[] = []
    if (plan) plan.phases.forEach((ph, pi) => ph.programs.forEach((p) => {
      const h = hash(p.id)
      const kz = p.scope === "kz"
      markers.push({
        lat: kz ? 48 + ((h % 7) - 3) : ((h * 13) % 80) - 30,
        lng: kz ? 66 + ((h % 11) - 5) : ((h * 7) % 360) - 180,
        color: PHASE_COLORS[pi] ?? "#d8452f",
      })
      labels.push(p.t)
    }))
    return { markers, labels }
  }, [plan])
  const [selected, setSelected] = useState<number | null>(null)

  // Прогресс считаем только по доступным фазам: у Free открыта фаза «Сейчас»,
  // иначе 100% недостижимы и полоса врёт.
  const { total, done } = useMemo(() => {
    if (!plan) return { total: 0, done: 0 }
    let t = 0, d = 0
    plan.phases.forEach((ph, pi) => {
      if (!isPaid(tariff) && pi > 0) return
      ph.tasks.forEach((_, ti) => { t++; if (progress[`${pi}-${ti}`]) d++ })
    })
    return { total: t, done: d }
  }, [plan, progress, tariff])
  const pct = total ? Math.round((done / total) * 100) : 0

  const paid = isPaid(tariff)

  // 1. Нет результата профориентации
  if (!result || !plan) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center border-2 border-foreground bg-brand text-brand-foreground brutal">
          <Sparkles className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">{t("pl.noResH")}</h1>
        <p className="mt-3 text-muted-foreground">{t("pl.noResSub")}</p>
        <Button onClick={onOpenNavigator} className="brutal brutal-press mt-8 h-12 rounded-none border-2 border-foreground bg-brand px-6 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">
          {t("pl.takeProfori")} <ArrowRight className="size-4" />
        </Button>
      </section>
    )
  }

  // 2. Карта: фаза 1 бесплатно, остальное — по тарифу
  return (
    <section className="mx-auto max-w-5xl px-6 pt-12 pb-24">
      <div className="mt-6 flex items-center gap-2">
        <span className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
          <MapPin className="size-3.5 text-brand" /> {t("pl.badge")}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand">{TARIFF_LABEL[tariff]}</span>
      </div>

      {/* герой: глобус + прогресс */}
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        {paid ? (
          <div data-lumi-hint="lumi.h.pl.globe" className="relative aspect-square w-full overflow-hidden border-2 border-foreground bg-gradient-to-b from-background to-muted/40">
            <Globe markers={markers} onSelect={setSelected} />
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 border border-foreground/20 bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
              <span className="size-2 animate-pulse bg-brand" /> {markers.length} {t("yf.globe.count")}
            </div>
            {selected !== null && labels[selected] && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 border-2 border-foreground bg-background/90 px-3 py-2 text-center text-[13px] font-bold backdrop-blur">
                🎯 {labels[selected]}
              </div>
            )}
          </div>
        ) : (
          <button data-lumi-hint="lumi.h.pl.globeLocked"
            onClick={() => setUnlock("globe")}
            className="brutal-press flex aspect-square w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-foreground/40 bg-muted/30 p-6 text-center"
          >
            <Lock className="size-8 text-brand" />
            <span className="text-sm font-black uppercase leading-tight tracking-tight">{t("pl.lk.globeT")}</span>
            <span className="max-w-xs text-[13px] text-muted-foreground">
              {markers.length} {t("pl.lk.globeD")}
            </span>
            <span className="mt-1 text-[12px] font-bold uppercase tracking-wider text-brand">{t("pl.lk.open")}</span>
          </button>
        )}
        <div>
          <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl">
            {t("pl.h.a")}<br /><span className="text-brand">{t("pl.h.b")}</span>
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{plan.headline}</p>

          <div className="mt-6" data-lumi-hint="lumi.h.pl.deadline"><DeadlineLine /></div>

          {/* прогресс */}
          <div className="mt-4 border-2 border-foreground bg-card p-4" data-lumi-hint="lumi.h.pl.progress">
            <div className="flex items-end justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("pl.progress")}</span>
              <span className="text-3xl font-black tabular-nums leading-none">{pct}%</span>
            </div>
            <div className="mt-2 h-3 w-full border-2 border-foreground">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-[12px] font-semibold text-muted-foreground">{done}/{total} {t("pl.stepsDone")}</p>
          </div>

          {/* класс */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("pl.grade")}</span>
            <div className="inline-flex border border-foreground/20" data-lumi-hint="lumi.h.pl.grade">
              {GRADES.map((g, i) => (
                <button key={g} onClick={() => setGrade(g)}
                  className={"px-3 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors " + (i > 0 ? "border-l border-foreground/20 " : "") + (grade === g ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                  {GRADE_LABEL[g][lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* рекомендации: тест и эссе-чекер — прямо здесь, не сворачивая карту */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button data-lumi-hint="lumi.h.pl.test" onClick={() => (paid ? setShowTest((v) => !v) : setUnlock("assess"))} className={"brutal-press group flex items-center justify-between gap-3 border-2 border-foreground p-4 text-left transition-colors " + (showTest ? "bg-brand text-brand-foreground" : "bg-card hover:bg-brand hover:text-brand-foreground")}>
          <span className="flex items-center gap-3">
            <GraduationCap className={"size-6 " + (showTest ? "text-brand-foreground" : "text-brand group-hover:text-brand-foreground")} />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-black uppercase tracking-tight">
                {t("pl.toolTest.t")} {!paid && <Lock className="size-3.5 shrink-0 text-brand" />}
              </span>
              <span className={"block text-[12px] " + (showTest ? "text-brand-foreground/80" : "text-muted-foreground group-hover:text-brand-foreground/80")}>{t("pl.inline.testHint")}</span>
            </span>
          </span>
          <ArrowRight className={"size-4 transition-transform " + (showTest ? "rotate-90" : "opacity-40 group-hover:translate-x-1 group-hover:opacity-100")} />
        </button>
        <button data-lumi-hint="lumi.h.pl.essay" onClick={() => (paid ? openLumifieldAI() : setUnlock("essay"))} className="brutal-press group flex items-center justify-between gap-3 border-2 border-foreground bg-card p-4 text-left transition-colors hover:bg-brand hover:text-brand-foreground">
          <span className="flex items-center gap-3">
            <PenLine className="size-6 text-brand group-hover:text-brand-foreground" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-black uppercase tracking-tight">
                {t("pl.toolEssay.t")} {!paid && <Lock className="size-3.5 shrink-0 text-brand" />}
              </span>
              <span className="block text-[12px] text-muted-foreground group-hover:text-brand-foreground/80">{t("pl.inline.essayHint")}</span>
            </span>
          </span>
          <ArrowRight className="size-4 opacity-40 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
        </button>
      </div>

      {/* прогоночный тест инлайн — карта остаётся открытой */}
      {showTest && paid && (
        <div className="mt-4 border-2 border-dashed border-foreground/40">
          <Assess result={result} onOpenPricing={onOpenPricing} onOpenAccount={onOpenAccount} onBack={() => setShowTest(false)} />
        </div>
      )}

      {pct === 100 && (
        <div className="mt-8 flex items-center gap-3 border-2 border-foreground bg-brand p-4 text-brand-foreground brutal">
          <Trophy className="size-6 shrink-0" />
          <p className="font-black uppercase tracking-wide">{t("pl.trophy")}</p>
        </div>
      )}

      {/* геймифицированный трек фаз */}
      <div className="relative mt-12 space-y-10">
        {plan.phases.map((ph, pi) => {
          const color = PHASE_COLORS[pi] ?? "#d8452f"
          const phaseDone = ph.tasks.every((_, ti) => progress[`${pi}-${ti}`])
          // Free получает первую фазу целиком (реальные задачи и программы),
          // остальные — с заголовком и честными счётчиками того, что внутри.
          const locked = !paid && pi > 0
          if (locked) {
            return (
              <div key={ph.key} className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-dashed border-foreground/40 bg-muted text-muted-foreground">
                    <Lock className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">{ph.title}</h2>
                    <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                      <CalendarClock className="size-3.5" /> {ph.horizon}
                    </p>
                  </div>
                </div>
                <div className="ml-3 border-l-4 border-dashed border-foreground/25 pl-4 pt-4 sm:ml-7 sm:pl-9">
                  <p className="max-w-2xl leading-relaxed text-foreground/80">{ph.intro}</p>
                  <div className="mt-4 border-2 border-dashed border-foreground/40 bg-muted/30 p-4">
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Check className="size-4 text-brand" /> {ph.tasks.length} {t("pl.lk.tasks")}</span>
                      {ph.programs.length > 0 && (
                        <span className="flex items-center gap-1.5"><MapPin className="size-4 text-brand" /> {ph.programs.length} {t("pl.lk.progs")}</span>
                      )}
                    </p>
                    <Button
                      onClick={() => setUnlock("plan")}
                      className="brutal-sm brutal-press mt-4 h-12 w-full rounded-none border-2 border-foreground bg-brand px-5 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background sm:h-11 sm:w-auto"
                    >
                      <Lock className="size-4" /> {t("pl.lk.openPhase")} <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div key={ph.key} className="relative">
              {/* нода фазы */}
              <div className="flex items-center gap-4">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-foreground text-xl font-black text-white transition-transform"
                  style={{ background: color }}
                >
                  {phaseDone ? <Check className="size-7" /> : pi + 1}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">{ph.title}</h2>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                    <CalendarClock className="size-3.5" /> {ph.horizon}
                  </p>
                </div>
              </div>

              <div className="ml-3 border-l-4 border-dashed border-foreground/25 pl-4 pt-4 sm:ml-7 sm:pl-9">
                <p className="max-w-2xl leading-relaxed text-foreground/80">{ph.intro}</p>

                {/* задачи-чекбоксы (геймификация) */}
                <div className="mt-4 space-y-2">
                  {ph.tasks.map((task, ti) => {
                    const id = `${pi}-${ti}`
                    const on = !!progress[id]
                    return (
                      <button
                        key={id}
                        onClick={() => toggleTask(id)}
                        aria-pressed={on}
                        data-lumi-hint="lumi.h.pl.task"
                        className={"brutal-press flex w-full items-center gap-3 border-2 border-foreground p-3 text-left text-[15px] font-semibold leading-tight transition-colors " + (on ? "bg-brand text-brand-foreground" : "bg-card hover:bg-muted")}
                      >
                        <span className={"grid size-6 shrink-0 place-items-center rounded-full border-2 " + (on ? "border-brand-foreground" : "border-foreground")}>
                          {on && <Check className="size-4" />}
                        </span>
                        <span className={on ? "line-through/50" : ""}>{task}</span>
                      </button>
                    )
                  })}
                </div>

                {ph.programs.length > 0 && (
                  <>
                    <p className="mt-6 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                      <MapPin className="size-3.5" style={{ color }} /> {t("pl.oppsWithDl")}
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      {ph.programs.map((p) => <ProgramCard key={p.id} p={p} />)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ShareRow direction={result?.top?.[0]?.dir?.title} />

      {unlock && (
        <UnlockSheet
          context={unlock}
          onClose={() => setUnlock(null)}
          onOpenPricing={onOpenPricing}
          onNeedAccount={onOpenAccount}
        />
      )}

      {/* эссе */}
      <div className="mt-12 border-2 border-foreground bg-brand/10 p-6">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-brand">
          <PenLine className="size-4" /> {plan.essay.title}
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-foreground/85">{plan.essay.body}</p>
      </div>
    </section>
  )
}
