import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, ArrowLeft, Sparkles, Cpu, RotateCcw, FileText, Copy, Check, GraduationCap, Lock, UserPlus, MapPin } from "lucide-react"
import { YOUPATH_BLOCKS, type YAnswers } from "@/data/youpath"
import { YP_TR } from "@/data/youpath.i18n"
import { generateReport, YOUPATH_AI_ON, splitReport, stripMarkers, countUniversities, universityTeasers } from "@/lib/youpath"
import { analyzeFromYouPath } from "@/lib/profori"
import { saveReport, saveResult, setGrade, useStore, isPaid, saveDraft, clearDraft } from "@/lib/store"
import { type Grade } from "@/lib/plan"
import { AUTH_ON, useSession } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { findCountries, findCountry } from "@/data/geo"
import Globe, { type Marker } from "@/components/Globe"
import { Button } from "@/components/ui/button"
import { DeadlineLine } from "@/components/deadline-line"
import { UnlockSheet } from "@/components/unlock-sheet"
import { ShareRow } from "@/components/share-row"

type Stage = "intro" | "form" | "gate" | "loading" | "report"

// Ответ на вопрос «Класс / курс» хранится оригинальной строкой (перевод — только
// отображение), поэтому маппим её в Grade для карты поступления.
const GRADE_FROM_ANSWER: Record<string, Grade> = {
  "9 класс": "9", "10 класс": "10", "11 класс": "11", "1 курс": "c1", "2 курс": "c2",
}

// лёгкий рендер отчёта: заголовки ЧАСТЬ/блоки — жирным, остальное — как есть
function ReportView({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 leading-relaxed">
      {text.split("\n").map((line, i) => {
        const t = line.trim()
        if (!t) return <div key={i} className="h-2" />
        const isHead = /^(ЧАСТЬ|БЛОК|PART)\b/i.test(t) || /^#{1,3}\s/.test(t)
        if (isHead) return <h3 key={i} className="mt-4 border-b-2 border-foreground pb-1 text-base font-black uppercase tracking-tight">{t.replace(/^#{1,3}\s/, "")}</h3>
        return <p key={i} className="text-[15px] text-foreground/85">{t}</p>
      })}
    </div>
  )
}

// ВАЖНО: на уровне модуля (не внутри компонента!), иначе React ремонтирует
// поддерево на каждый ввод и инпут теряет фокус (баг «один символ»).
function Shell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-3xl px-6 pt-12 pb-24">{children}</section>
}

export default function YouPath({
  onOpenAccount, onOpenPricing, onOpenPlan, onNeedAccount, resume, onResumed,
}: {
  onOpenAccount: () => void
  onOpenPricing: () => void
  onOpenPlan: () => void
  onNeedAccount: () => void   // уход на регистрацию с гейта — App вернёт сюда после входа
  resume?: boolean            // вернулись после регистрации: досчитать отчёт
  onResumed?: () => void
}) {
  const { t, lang } = useI18n()
  const yp = lang === "ru" ? undefined : YP_TR[lang] // переводы анкеты (EN/KZ)
  const { tariff, ypDraft, savedResult } = useStore()
  const paid = isPaid(tariff) // детали по вузам в отчёте — только платным
  const session = useSession()
  const noAccount = AUTH_ON && !session // бэкенд включён, но пользователь не вошёл
  // Черновик: гость проходит анкету без аккаунта, ответы переживают регистрацию.
  const draft = useRef(ypDraft).current
  const [stage, setStage] = useState<Stage>(() => (draft && Object.keys(draft.answers).length ? "form" : "intro"))
  const [showErrors, setShowErrors] = useState(false)
  const [bi, setBi] = useState(() => draft?.bi ?? 0)
  const [answers, setAnswers] = useState<YAnswers>(() => draft?.answers ?? {})
  const [report, setReport] = useState("")
  const [aiUsed, setAiUsed] = useState(false)
  const [failed, setFailed] = useState(false) // генерация сорвалась — предложим повтор
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const [selected, setSelected] = useState<number | null>(null)
  const [unlock, setUnlock] = useState(false) // лист разблокировки вузов

  function doSave() {
    // Нет аккаунта на момент прохождения → ведём на вход/регистрацию.
    // Сохранит отчёт уже после входа, вернувшись сюда.
    if (noAccount) { onOpenAccount(); return }
    if (saved) { onOpenAccount(); return }
    saveReport({ id: `rep-${Date.now().toString(36)}`, at: Date.now(), text: report, country: answers.country, timeline: answers.timeline, answers })
    setSaved(true)
  }

  // страны-цели для глобуса: страна мечты (акцент) + страны, упомянутые в отчёте
  const { markers, labels } = useMemo(() => {
    const seen = new Map<string, { name: string; lat: number; lng: number; primary: boolean }>()
    const target = findCountry(answers.country ?? "")
    if (target) seen.set(target.name, { ...target, primary: true })
    findCountries(report).forEach((c) => { if (!seen.has(c.name)) seen.set(c.name, { ...c, primary: false }) })
    const list = [...seen.values()]
    return {
      markers: list.map((g) => ({ lat: g.lat, lng: g.lng, color: g.primary ? "#d8452f" : "#2c8fb0" } as Marker)),
      labels: list.map((g) => g.name),
    }
  }, [report, answers.country])

  // Разбор отчёта на части: ЧАСТЬ 2 (вузы) показываем отдельно и закрываем для Free.
  const rp = useMemo(() => splitReport(report), [report])
  const uniCount = useMemo(() => countUniversities(rp.parts[1]), [rp])
  const uniTeasers = useMemo(() => universityTeasers(rp.parts[1]), [rp])

  // ВАЖНО: пишем черновик ВНЕ updater'а setState — React может вызвать updater
  // во время рендера, и запись в стор дёргала setState в App («setState in render»).
  const set = (id: string, v: string) => {
    const next = { ...answers, [id]: v }
    setAnswers(next)
    saveDraft(next, bi) // черновик — на каждый ответ, чтобы ничего не терялось
  }
  // Валидация полей: год поступления должен быть 2027 или позже.
  const fieldError = (id: string, val: string): string | null => {
    if (id === "timeline" && val.trim()) {
      const y = parseInt(val.trim(), 10)
      if (!/^\d{4}$/.test(val.trim()) || y < 2027) return t("yf.yearMin")
    }
    return null
  }
  // Анкета целиком заполнена и валидна — можно генерировать отчёт.
  const allValid = YOUPATH_BLOCKS.every((b) =>
    b.questions.every((q) => (answers[q.id] ?? "").trim() && !fieldError(q.id, answers[q.id] ?? ""))
  )

  // Гейт: анкету проходим гостем, аккаунт просим ровно в момент выдачи отчёта.
  function requestReport() {
    if (noAccount) { setStage("gate"); return }
    finish()
  }

  // Вернулись после регистрации — досчитываем отчёт по сохранённому черновику.
  const resumed = useRef(false)
  useEffect(() => {
    if (!resume || resumed.current) return
    resumed.current = true
    onResumed?.()
    if (!noAccount && allValid) finish()
  }, [resume, noAccount, allValid, onResumed])

  async function finish() {
    setStage("loading")
    const r = await generateReport(answers, lang, paid)
    setFailed(r.reason === "failed")
    setReport(r.text); setAiUsed(r.ai); setStage("report")
    // Направление из анкеты → в профиль и карту поступления (синхронизация).
    saveResult(analyzeFromYouPath(answers, lang))
    // Класс/курс из анкеты запоминаем — карта поступления откроется именно с ним.
    const g = GRADE_FROM_ANSWER[(answers.grade ?? "").trim()]
    if (g) setGrade(g)
    // Авто-сохраняем реальный отчёт сразу — чтобы не проходить анкету заново.
    // Локально + синхронизируется в аккаунт при входе (см. sync.ts merge).
    if (r.ai) {
      saveReport({ id: `rep-${Date.now().toString(36)}`, at: Date.now(), text: r.text, country: answers.country, timeline: answers.timeline, answers })
      setSaved(true)
      clearDraft() // анкета доведена до отчёта — черновик больше не нужен
    }
  }

  function restart() { setAnswers({}); setBi(0); setReport(""); clearDraft(); setStage("intro") }

  if (stage === "intro") {
    return (
      <Shell>
        <div className="mb-6 mt-6 inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="size-3.5 text-brand" /> {t("yf.badge")}
        </div>
        <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
          {t("yf.h.a")}<span className="text-brand">{t("yf.h.b")}</span>{t("yf.h.c")}
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground sm:text-lg">
          {t("yf.sub")}
        </p>
        <Button data-lumi-hint="lumi.h.yp.start" onClick={() => setStage("form")} className="brutal brutal-press mt-8 h-14 w-full rounded-none border-2 border-foreground bg-brand px-6 text-base font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background sm:h-12 sm:w-auto sm:text-sm">
          {t("yf.start")} <ArrowRight className="size-5 sm:size-4" />
        </Button>
        <p className="mt-3 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{t("yg.noAccNote")}</p>
        {!YOUPATH_AI_ON && <p className="mt-4 max-w-xl text-[12px] text-muted-foreground">{t("yf.aioff")}</p>}
      </Shell>
    )
  }

  // Гейт: анкета пройдена целиком, отчёт «на руках» — просим аккаунт здесь,
  // когда пользователь уже вложился. Ответы лежат в черновике и не теряются.
  if (stage === "gate") {
    return (
      <Shell>
        <div className="mt-6 border-2 border-foreground bg-card p-6 brutal sm:p-8">
          <div className="flex size-14 items-center justify-center border-2 border-foreground bg-brand text-brand-foreground">
            <FileText className="size-7" />
          </div>
          <h1 className="mt-5 text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl">{t("yg.t")}</h1>
          <p className="mt-3 text-muted-foreground">{t("yg.d")}</p>

          <ul className="mt-5 space-y-2 border-t-2 border-foreground pt-5">
            {["1", "2", "3", "4"].map((n) => (
              <li key={n} className="flex items-start gap-2 text-[15px] text-foreground/85">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {t(`yg.i${n}`)}
              </li>
            ))}
          </ul>

          <Button onClick={onNeedAccount} className="brutal brutal-press mt-6 h-auto min-h-14 w-full whitespace-normal rounded-none border-2 border-foreground bg-brand px-6 py-3 text-base font-bold uppercase leading-tight tracking-wider text-brand-foreground hover:bg-foreground hover:text-background sm:min-h-12 sm:w-auto sm:text-sm">
            <UserPlus className="size-5 sm:size-4" /> {t("yg.cta")}
          </Button>
          <p className="mt-3 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{t("yg.saved")}</p>

          <button onClick={() => setStage("form")} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground underline underline-offset-4 hover:text-brand">
            <ArrowLeft className="size-3.5" /> {t("yg.back")}
          </button>
        </div>
      </Shell>
    )
  }

  if (stage === "loading") {
    return (
      <Shell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <Cpu className="size-10 animate-pulse text-brand" />
          <p className="mt-5 text-lg font-black uppercase tracking-tight">{t("yf.load.t")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("yf.load.sub")}</p>
        </div>
      </Shell>
    )
  }

  // Генерация сорвалась (таймаут/сеть) — не показываем техническую заглушку,
  // а честно объясняем и даём повтор: ответы уже в черновике, ничего не потеряно.
  if (stage === "report" && failed) {
    return (
      <Shell>
        <div className="mx-auto max-w-md pt-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center border-2 border-foreground bg-card brutal">
            <RotateCcw className="size-7 text-brand" />
          </div>
          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">{t("yf.fail.t")}</h1>
          <p className="mt-3 text-muted-foreground">{t("yf.fail.d")}</p>
          <Button onClick={finish} className="brutal brutal-press mt-6 h-12 rounded-none border-2 border-foreground bg-brand px-6 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">
            <RotateCcw className="size-4" /> {t("yf.fail.retry")}
          </Button>
        </div>
      </Shell>
    )
  }

  if (stage === "report") {
    return (
      <Shell>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest"><FileText className="size-3.5 text-brand" /> {t("yf.rep.badge")}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{aiUsed ? t("yf.rep.ai") : t("yf.rep.aioff")}</span>
        </div>

        <div className="mt-4"><DeadlineLine /></div>
        {markers.length > 0 && (
          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden border-2 border-foreground bg-gradient-to-b from-background to-muted/40">
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
        )}

        {rp.hasMarkers ? (
          <>
            {/* ЧАСТЬ 1 — профессии (бесплатно и полностью) */}
            {rp.intro && (
              <div className="mt-5 border-2 border-foreground bg-card p-6 brutal">
                <ReportView text={rp.intro} />
              </div>
            )}
            <div className="mt-4 border-2 border-foreground bg-card p-6 brutal">
              <ReportView text={rp.parts[0]} />
            </div>

            {/* ЧАСТЬ 2 — вузы: платным целиком, Free — что именно закрыто */}
            {rp.parts[1] && (paid ? (
              <div className="mt-4 border-2 border-foreground bg-card p-6 brutal">
                <ReportView text={rp.parts[1]} />
              </div>
            ) : (
              <div className="mt-4 border-2 border-foreground bg-card brutal">
                <button
                  onClick={() => setUnlock(true)}
                  className="brutal-press flex w-full items-center gap-2 border-b-2 border-foreground bg-foreground px-4 py-2.5 text-left text-background"
                >
                  <GraduationCap className="size-4 shrink-0 text-brand" />
                  <span className="text-[11px] font-bold uppercase leading-tight tracking-widest">
                    {uniCount > 0 ? `${uniCount} ${t("yl.count")}` : t("yl.countFallback")}
                  </span>
                  <Lock className="ml-auto size-3.5 shrink-0 text-brand" />
                </button>

                {/* имена вузов — размыто: видно, что подбор реальный */}
                {uniTeasers.length > 0 && (
                  <div onClick={() => setUnlock(true)} className="cursor-pointer space-y-2 border-b-2 border-dashed border-foreground/30 p-4 sm:p-5">
                    {uniTeasers.map((u, i) => (
                      <p key={i} className="select-none truncate text-[15px] text-foreground/85 blur-[5px]" aria-hidden="true">
                        {u}
                      </p>
                    ))}
                  </div>
                )}

                {/* что именно за замком — конкретно, без размытия */}
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("yl.behind")}</p>
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {["1", "2", "3", "4", "5", "6"].map((n) => (
                      <li key={n} className="flex items-start gap-2 text-[14px] leading-snug text-foreground/85">
                        <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" /> {t(`yl.f${n}`)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 border-t-2 border-foreground pt-4">
                    <p className="text-[13px] font-bold uppercase leading-snug tracking-wide">{t("yl.price")}</p>
                    <Button
                      onClick={() => setUnlock(true)}
                      className="brutal brutal-press mt-3 h-14 w-full rounded-none border-2 border-foreground bg-brand px-6 text-base font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background sm:h-12 sm:w-auto sm:text-sm"
                    >
                      <Lock className="size-4" /> {t("yl.cta")} <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* ЧАСТИ 3–4 — письмо и книги: бесплатно и полностью */}
            {[rp.parts[2], rp.parts[3]].filter(Boolean).map((part, i) => (
              <div key={i} className="mt-4 border-2 border-foreground bg-card p-6 brutal">
                <ReportView text={part} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="mt-5 border-2 border-foreground bg-card p-6 brutal">
              <ReportView text={stripMarkers(report)} />
            </div>
            {!paid && aiUsed && (
              <button onClick={onOpenPricing} className="brutal-press mt-4 flex w-full items-center justify-between gap-3 border-2 border-dashed border-foreground/40 bg-brand/5 p-5 text-left">
                <span className="flex items-center gap-3">
                  <GraduationCap className="size-6 shrink-0 text-brand" />
                  <span className="text-sm font-bold uppercase leading-tight">{t("nv.res.lockT")}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-brand">
                  <Lock className="size-3.5" /> {t("nv.res.open")}
                </span>
              </button>
            )}
          </>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => { navigator.clipboard?.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="brutal-sm brutal-press h-11 rounded-none border-2 border-foreground bg-brand px-5 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? t("yf.copied") : t("yf.copy")}
          </Button>
          <Button data-lumi-hint="lumi.h.yp.save" onClick={doSave} variant="outline" className="h-11 rounded-none border-2 border-foreground px-5 text-[12px] font-bold uppercase tracking-wider">
            {noAccount ? <>{t("yf.saveLogin")}</> : saved ? <><Check className="size-4" /> {t("yf.saved")}</> : <>{t("yf.save")}</>}
          </Button>
          <Button onClick={restart} variant="outline" className="h-11 rounded-none border-2 border-foreground px-5 text-[12px] font-bold uppercase tracking-wider"><RotateCcw className="size-4" /> {t("yf.restart")}</Button>
        </div>

        {/* дальше по пути: шаг 2 — карта поступления (не тупик) */}
        <button
          onClick={onOpenPlan}
          className="brutal brutal-press group mt-8 flex w-full flex-col items-start gap-3 border-2 border-foreground bg-foreground p-5 text-left text-background sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
        >
          <span className="flex items-start gap-4">
            <MapPin className="mt-0.5 size-6 shrink-0 text-brand" />
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-brand">{t("yn.step")}</span>
              <span className="mt-1 block text-lg font-black uppercase leading-tight tracking-tight">{t("yn.t")}</span>
              <span className="mt-1 block text-sm text-background/70">{t("yn.d")}</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-brand">
            {t("yn.cta")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        <ShareRow direction={savedResult?.top?.[0]?.dir?.title} />

        {unlock && (
          <UnlockSheet
            context="unis"
            uniCount={uniCount}
            onClose={() => setUnlock(false)}
            onOpenPricing={onOpenPricing}
            onNeedAccount={onOpenAccount}
          />
        )}
      </Shell>
    )
  }

  // форма — блок за блоком
  // ── Анкета одним списком, как в Google Формах ─────────────────────────
  // Раньше — четыре блока с «Далее». Теперь все вопросы на одном экране:
  // человек сразу видит объём, а незаполненное подсвечивается и к нему
  // прокручивает. Логика не менялась: те же ответы, черновик и requestReport.
  const all = YOUPATH_BLOCKS.flatMap((b) => b.questions)
  const missingAll = all.filter((q) => !(answers[q.id] ?? "").trim())
  const filledAll = all.length - missingAll.length

  function submitAll() {
    if (!allValid) {
      setShowErrors(true)
      const first = missingAll[0] ?? all.find((q) => fieldError(q.id, answers[q.id] ?? ""))
      if (first) document.getElementById(`yq-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    requestReport()
  }

  const gCard =
    "rounded-2xl border border-black/[0.08] bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] " +
    "transition-shadow focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.10)] dark:border-white/10"
  const accent = { accentColor: "var(--brand)" } as React.CSSProperties

  return (
    <Shell>

      <div className="mx-auto mt-6 grid max-w-[720px] gap-4 pb-28">
        {/* Шапка формы с цветной полосой — узнаваемая деталь Google Форм. */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-white/10">
          <div className="h-2.5 bg-brand" />
          <div className="p-5 sm:p-6">
            <h1 className="text-[24px] font-black uppercase tracking-tight sm:text-[28px]">
              {t("yf.h.a")}{t("yf.h.b")}{t("yf.h.c")}
            </h1>
            <p className="mt-2 text-[14.5px] text-muted-foreground">{t("yf.sub")}</p>
            <p className="mt-3 text-[13px] font-semibold text-brand">{filledAll} / {all.length}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10">
              <div className="h-full rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${(filledAll / all.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {YOUPATH_BLOCKS.map((b, bIdx) => (
          <div key={b.title} className="grid gap-4">
            {/* Название блока — как заголовок раздела в длинной форме. */}
            <div className="mt-2 flex items-center gap-3 px-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{bIdx + 1}</span>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {yp?.blocks[bIdx] ?? b.title}
              </h2>
            </div>

            {b.questions.map((q) => {
              const val = answers[q.id] ?? ""
              const sel = val.split(",").map((x) => x.trim()).filter(Boolean)
              const atMax = q.type === "multi" && q.max ? sel.length >= q.max : false
              const yq = yp?.q[q.id]
              const err = fieldError(q.id, val)
              const bad = showErrors && (!val.trim() || !!err)

              return (
                <section key={q.id} id={`yq-${q.id}`} data-lumi-hint={q.type === "multi" ? "lumi.h.yp.multi" : q.type === "choice" ? "lumi.h.yp.choice" : "lumi.h.yp.text"} className={gCard + (bad ? " border-brand/70" : "")}>
                  <div className="flex items-start gap-1.5">
                    <h3 className="text-[16px] font-semibold leading-snug">{yq?.label ?? q.label}</h3>
                    <span aria-hidden className="text-brand">*</span>
                    {q.type === "multi" && q.max && (
                      <span className="ml-auto shrink-0 text-[12px] text-muted-foreground">{sel.length}/{q.max}</span>
                    )}
                  </div>

                  {q.type === "choice" ? (
                    <div className="mt-3 grid gap-1">
                      {q.options!.map((o, oi) => (
                        <label key={o}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
                          <input type="radio" name={q.id} checked={val === o} onChange={() => set(q.id, o)}
                            className="size-4" style={accent} />
                          <span className="text-[15px]">{yq?.options?.[oi] ?? o}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === "multi" ? (
                    <div className="mt-3 grid gap-1">
                      {q.options!.map((o, oi) => {
                        const on = sel.includes(o)
                        return (
                          <label key={o}
                            className={
                              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors " +
                              (!on && atMax ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.05]")
                            }>
                            <input type="checkbox" checked={on} disabled={!on && atMax}
                              onChange={() => set(q.id, (on ? sel.filter((x) => x !== o) : [...sel, o]).join(", "))}
                              className="size-4" style={accent} />
                            <span className="text-[15px]">{yq?.options?.[oi] ?? o}</span>
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <input
                      value={val}
                      onChange={(e) => set(q.id, e.target.value)}
                      placeholder={yq?.placeholder ?? q.placeholder}
                      className="mt-3 w-full border-0 border-b border-black/20 bg-transparent px-1 py-2 text-[15px] outline-none transition-colors focus:border-b-2 focus:border-brand dark:border-white/25"
                    />
                  )}

                  {err && <p className="mt-2 text-[12px] font-semibold text-brand">{err}</p>}
                </section>
              )
            })}
          </div>
        ))}

        {/* Кнопка закреплена внизу: форма длинная, возвращаться к ней прокруткой утомительно. */}
        <div className="sticky bottom-4 mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-black/[0.08] bg-card p-4 shadow-[0_4px_18px_rgba(0,0,0,0.12)] dark:border-white/10">
          <Button onClick={submitAll} data-lumi-hint="lumi.h.yp.submit"
            className="h-11 rounded-xl border-0 bg-brand px-6 text-[13px] font-bold uppercase tracking-wider text-brand-foreground hover:brightness-110">
            <Sparkles className="size-4" /> {t("yf.get")}
          </Button>
          <Button onClick={() => setStage("intro")} variant="outline"
            className="h-11 rounded-xl border border-black/15 px-4 text-[12px] font-bold uppercase tracking-wider dark:border-white/20">
            <ArrowLeft className="size-4" /> {t("yf.cancel")}
          </Button>
          {missingAll.length > 0 && (
            <span className="text-[13px] text-muted-foreground">
              {t("yf.left")}: {missingAll.length}
            </span>
          )}
        </div>
      </div>
    </Shell>
  )
}
