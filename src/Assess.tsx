import { useEffect, useState } from "react"
import { Lock, Sparkles, ArrowRight, ArrowLeft, GraduationCap, Target, RefreshCw, TriangleAlert, Loader2 } from "lucide-react"
import { type AnalyzeResult } from "@/lib/profori"
import { EXAMS, EXAM_LIST, type ExamId, type ExamQ } from "@/data/exams"
import { generateQuestions, EXAMGEN_ON } from "@/lib/examgen"
import { readinessFromQuestions, levelLabel, admissionChances, chanceTone } from "@/lib/assess"
import { useStore, isPaid, addExamResult } from "@/lib/store"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { UnlockSheet } from "@/components/unlock-sheet"

const TONE: Record<string, string> = { high: "var(--brand)", mid: "#e8912e", low: "#8895a0" }

export default function Assess({
  result, onOpenPricing, onBack, onOpenAccount,
}: {
  result: AnalyzeResult | null
  onOpenPricing: () => void
  onOpenAccount: () => void
  onBack: () => void
}) {
  const { t, lang } = useI18n()
  const { tariff } = useStore()
  const [exam, setExam] = useState<ExamId>("sat")
  const [questions, setQuestions] = useState<ExamQ[]>(EXAMS.sat.questions)
  const [aiGen, setAiGen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [done, setDone] = useState(false)
  const [nonce, setNonce] = useState(0)
  const [unlock, setUnlock] = useState(false)

  const dir = result?.top[0]?.dir.id ?? null
  const paid = isPaid(tariff)

  // генерируем новый тест при смене экзамена / «новый тест»
  useEffect(() => {
    if (!paid) return
    let alive = true
    setLoading(true); setAnswers({}); setDone(false)
    generateQuestions(exam, lang).then(({ questions: qs, ai }) => {
      if (!alive) return
      setQuestions(qs); setAiGen(ai); setLoading(false)
    })
    return () => { alive = false }
  }, [exam, nonce, paid])

  if (!paid) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center border-2 border-foreground bg-card brutal"><Lock className="size-7 text-brand" /></div>
        <h1 className="mt-6 text-3xl font-black uppercase tracking-tight sm:text-4xl">{t("as.lockH.a")}<span className="text-brand">{t("as.lockH.b")}</span></h1>
        <p className="mt-4 text-muted-foreground sm:text-lg">{t("as.lockSub")}</p>
        <Button onClick={() => setUnlock(true)} className="brutal brutal-press mt-8 h-12 rounded-none border-2 border-foreground bg-brand px-6 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"><Sparkles className="size-4" /> {t("es.seePricing")}</Button>
        {unlock && <UnlockSheet context="assess" onClose={() => setUnlock(false)} onOpenPricing={onOpenPricing} onNeedAccount={onOpenAccount} />}
      </section>
    )
  }

  const readiness = readinessFromQuestions(questions, answers)
  const chances = admissionChances(readiness, dir)
  const answeredAll = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined)

  function finish() {
    setDone(true)
    addExamResult({ exam, readiness, level: levelLabel(exam, readiness), at: Date.now() })
  }

  return (
    <section className="mx-auto max-w-3xl px-6 pt-10 pb-24">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand">
        <ArrowLeft className="size-4" /> {t("as.back")}
      </button>
      <div className="mb-4 inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
        <GraduationCap className="size-3.5 text-brand" /> {t("as.badge")}
      </div>
      <h1 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">{t("as.h")}</h1>

      {/* предупреждение */}
      <div className="mt-4 flex items-start gap-2 border-2 border-foreground bg-brand/10 p-3 text-[13px] leading-relaxed">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" />
        <span><strong>{t("as.warn.a")}</strong>{t("as.warn.b")}</span>
      </div>

      {/* выбор экзамена */}
      <div className="mt-6 flex flex-wrap gap-2">
        {EXAM_LIST.map((e) => (
          <button key={e.id} onClick={() => setExam(e.id)}
            className={"brutal-press border-2 border-foreground px-4 py-2.5 text-left transition-colors " + (exam === e.id ? "bg-brand text-brand-foreground" : "bg-card hover:bg-muted")}>
            <span className="block text-sm font-black uppercase tracking-tight">{e.name}</span>
            <span className="block text-[11px] opacity-70">{t(`ex.${e.id}`)}</span>
          </button>
        ))}
        <span className="ml-auto self-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {EXAMGEN_ON ? (aiGen ? t("as.qAi") : t("as.qAiOff")) : t("as.qBase")}
        </span>
      </div>

      {loading ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-brand" />
          <p className="text-sm font-bold uppercase tracking-wide">{EXAMGEN_ON ? t("as.genLoad") : t("as.prep")}</p>
        </div>
      ) : !done ? (
        <>
          {/* Тест в духе Google Форм: карточка на вопрос, радиокнопки, счётчик
              и закреплённая кнопка. Тот же вид, что у анкеты. */}
          <div className="mx-auto mt-6 grid max-w-[720px] gap-4 pb-28">
            <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-white/10">
              <div className="h-2.5 bg-brand" />
              <div className="p-5 sm:p-6">
                <h2 className="text-[22px] font-black uppercase tracking-tight">{EXAMS[exam].name}</h2>
                <p className="mt-1 text-[14px] text-muted-foreground">{t(`ex.${exam}`)}</p>
                <p className="mt-3 text-[13px] font-semibold text-brand">
                  {Object.keys(answers).length} / {questions.length}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10">
                  <div className="h-full rounded-full bg-brand transition-[width] duration-300"
                    style={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            {questions.map((qq, qi) => (
              <section key={qi}
                className="rounded-2xl border border-black/[0.08] bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.10)] dark:border-white/10">
                <div className="flex items-start gap-1.5">
                  <h3 className="text-[16px] font-semibold leading-snug">{qi + 1}. {qq.q}</h3>
                  <span aria-hidden className="text-brand">*</span>
                </div>
                <div className="mt-3 grid gap-1">
                  {qq.options.map((o, oi) => (
                    <label key={oi}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
                      <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi}
                        onChange={() => setAnswers({ ...answers, [qi]: oi })}
                        className="size-4" style={{ accentColor: "var(--brand)" }} />
                      <span className="text-[15px]">{o}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            <div className="sticky bottom-4 mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-black/[0.08] bg-card p-4 shadow-[0_4px_18px_rgba(0,0,0,0.12)] dark:border-white/10">
              <Button onClick={finish} disabled={!answeredAll}
                className="h-11 rounded-xl border-0 bg-brand px-6 text-[13px] font-bold uppercase tracking-wider text-brand-foreground hover:brightness-110 disabled:opacity-40">
                {t("as.show")} <ArrowRight className="size-4" />
              </Button>
              <Button onClick={() => setNonce((n) => n + 1)} variant="outline"
                className="h-11 rounded-xl border border-black/15 px-4 text-[12px] font-bold uppercase tracking-wider dark:border-white/20">
                <RefreshCw className="size-4" /> {t("as.newTest")}
              </Button>
              {!answeredAll && <span className="text-[13px] text-muted-foreground">{t("as.answerAll")}</span>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-2 border-foreground bg-card p-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("as.yourLevel")}</p>
              <p className="mt-1 text-4xl font-black tracking-tight text-brand">{levelLabel(exam, readiness)}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{t("as.readiness")} {Math.round(readiness * 100)}%{dir ? t("as.withDir") : ""}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setNonce((n) => n + 1)} variant="outline" className="h-10 rounded-none border-2 border-foreground px-4 text-[12px] font-bold uppercase tracking-wider"><RefreshCw className="size-4" /> {t("as.newTest")}</Button>
              <Button onClick={onBack} className="brutal-sm brutal-press h-10 rounded-none border-2 border-foreground bg-foreground px-4 text-[12px] font-bold uppercase tracking-wider text-background hover:bg-brand hover:text-brand-foreground"><ArrowLeft className="size-4" /> {t("as.back")}</Button>
            </div>
          </div>

          <p className="mt-8 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground"><Target className="size-4 text-brand" /> {t("as.chanceLabel")}</p>
          <div className="mt-3 space-y-2">
            {chances.map(({ uni, chance }) => {
              const tone = chanceTone(chance)
              return (
                <div key={uni.id} className="flex items-center gap-3 border-2 border-foreground bg-card p-3">
                  <span className="text-lg">{uni.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-bold">{uni.name}</span>
                      <span className="shrink-0 text-lg font-black tabular-nums" style={{ color: TONE[tone] }}>{chance}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full bg-muted"><div className="h-full transition-all" style={{ width: `${chance}%`, background: TONE[tone] }} /></div>
                    <span className="mt-1 block text-[11px] text-muted-foreground">{uni.country} · SAT ~{uni.sat} · IELTS {uni.ielts}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">{t("as.chanceNote")}</p>
        </>
      )}
    </section>
  )
}
