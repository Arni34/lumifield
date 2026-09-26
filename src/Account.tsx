import { useMemo, useState } from "react"
import {
  User, Sparkles, ArrowRight, Lock, Plus, Trash2, CalendarClock, GraduationCap,
  PenLine, MapPin, Check, Clock, LogOut, Loader2, Cloud, HardDrive, FileText, ChevronDown,
} from "lucide-react"
import { AUTH_ON, useSession, signIn, signUp, signOut } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { type AnalyzeResult } from "@/lib/profori"
import { DIRECTIONS } from "@/data/directions"
import { DIR_TR } from "@/data/directions.i18n"
import { unisForDir } from "@/data/universities"
import { EXAMS } from "@/data/exams"
import { buildPlan } from "@/lib/plan"
import { admissionChances } from "@/lib/assess"
import {
  useStore, isPaid, setProfile, setProfileFields, addApp, updateApp, removeApp, toggleMaterial, removeReport,
  type AppType, type AppStatus,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { TrialButton } from "@/components/trial-button"
import { UnlockSheet } from "@/components/unlock-sheet"
import { daysLeft as planDaysLeft } from "@/lib/billing"
import { TARIFF_LABEL } from "@/data/tariffs"
import { TARIFF_NAME_TR } from "@/data/tariffs.i18n"
import { Input } from "@/components/ui/input"

const TYPES: AppType[] = ["ED", "EA", "RD", "Rolling"]
const NEXT: Record<AppStatus, AppStatus> = { todo: "progress", progress: "done", done: "todo" }
const DEFAULT_MATERIALS = ["Эссе", "Документы", "Тесты (SAT/IELTS)", "Рекомендации"]

function daysLeft(iso: string): number {
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86_400_000)
}

export default function Account({
  result, onOpenPricing, onOpenNavigator, onOpenAssess, onOpenEssay, onOpenPlan,
}: {
  result: AnalyzeResult | null
  onOpenPricing: () => void
  onOpenNavigator: () => void
  onOpenAssess: () => void
  onOpenEssay: () => void
  onOpenPlan: () => void
}) {
  const { t: tr, lang } = useI18n()
  const dateLoc = lang === "en" ? "en-US" : lang === "kz" ? "kk-KZ" : "ru-RU"
  const dirTitle = (id: keyof typeof DIRECTIONS) => (lang === "ru" ? DIRECTIONS[id].title : DIR_TR[id]?.[lang]?.title ?? DIRECTIONS[id].title)
  const { profile, tariff, tariffUntil, progress, examResults, apps, reports, grade } = useStore()
  const session = useSession()
  const [openReport, setOpenReport] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<"in" | "up">("in")
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [firstName, setFirstName] = useState("")
  const [surname, setSurname] = useState("")
  const [phone, setPhone] = useState("")
  const [authMsg, setAuthMsg] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [name, setName] = useState(profile?.name ?? "")
  // ВАЖНО: все хуки — до любого условного return (форма входа ниже возвращается
  // раньше). Иначе у вошедшего пользователя число хуков меняется между рендерами
  // → React падает с «Rendered more hooks…» → белый экран.
  const [newName, setNewName] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newType, setNewType] = useState<AppType>("RD")
  const [unlock, setUnlock] = useState(false)

  const planPct = useMemo(() => {
    if (!result) return 0
    const plan = buildPlan(result, grade ?? "10", lang)
    let t = 0, d = 0
    plan.phases.forEach((ph, pi) => ph.tasks.forEach((_, ti) => { t++; if (progress[`${pi}-${ti}`]) d++ }))
    return t ? Math.round((d / t) * 100) : 0
  }, [result, progress, grade, lang])

  const F = "h-11 rounded-none border-2 border-foreground"
  const clr = () => setAuthMsg(null)

  async function doSignIn() {
    if (!email || !pass) return
    setAuthBusy(true); clr()
    const r = await signIn(email, pass)
    setAuthBusy(false)
    if (!r.ok) setAuthMsg(r.msg ?? tr("ac.err"))
  }

  async function doSignUp() {
    if (!email || pass.length < 6) { setAuthMsg(tr("ac.errCreds")); return }
    setAuthBusy(true); clr()
    const meta = { name: firstName, surname, phone, full_name: `${firstName} ${surname}`.trim() }
    const r = await signUp(email, pass, meta)
    setAuthBusy(false)
    if (!r.ok) { setAuthMsg(r.msg ?? tr("ac.err")); return }
    setProfileFields({ name: firstName, surname, phone })
    setAuthMsg(r.msg ?? tr("ac.created"))
  }

  // Экран входа/регистрации, если бэкенд подключён и пользователь не вошёл.
  if (AUTH_ON && !session) {
    const signupOk = firstName.trim() && surname.trim() && phone.trim() && email.trim() && pass.length >= 6
    return (
      <section className="mx-auto max-w-md px-6 pt-20 pb-24">
        <div className="border-2 border-foreground bg-card p-8 brutal">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <Cloud className="size-3.5 text-brand" /> {tr("ac.acct")}
          </div>

          {authMode === "in" ? (
            <>
              <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">{tr("ac.signin")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{tr("ac.signinSub")}</p>
              <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clr() }} placeholder={tr("ac.email")} className={`mt-5 ${F}`} />
              <Input type="password" value={pass} onChange={(e) => { setPass(e.target.value); clr() }} onKeyDown={(e) => e.key === "Enter" && !authBusy && doSignIn()} placeholder={tr("ac.pass")} className={`mt-3 ${F}`} />
              {authMsg && <p className="mt-2 text-[12px] font-semibold text-brand">{authMsg}</p>}
              <Button onClick={doSignIn} disabled={authBusy || !email || !pass} className="brutal-sm brutal-press mt-4 h-11 w-full rounded-none border-2 border-foreground bg-brand text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-50">
                {authBusy ? <Loader2 className="size-4 animate-spin" /> : null} {tr("ac.signinBtn")}
              </Button>
              <button onClick={() => { setAuthMode("up"); clr() }} className="mt-4 w-full text-center text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand">
                {tr("ac.noAcct")}
              </button>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">{tr("ac.signup")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{tr("ac.meet")}</p>
              <Input value={firstName} onChange={(e) => { setFirstName(e.target.value); clr() }} placeholder={tr("ac.firstName")} className={`mt-4 ${F}`} />
              <Input value={surname} onChange={(e) => { setSurname(e.target.value); clr() }} placeholder={tr("ac.surname")} className={`mt-3 ${F}`} />
              <Input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clr() }} placeholder={tr("ac.phone")} className={`mt-3 ${F}`} />
              <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clr() }} placeholder={tr("ac.emailF")} className={`mt-3 ${F}`} />
              <Input type="password" value={pass} onChange={(e) => { setPass(e.target.value); clr() }} onKeyDown={(e) => e.key === "Enter" && !authBusy && doSignUp()} placeholder={tr("ac.passHint")} className={`mt-3 ${F}`} />
              {authMsg && <p className="mt-2 text-[12px] font-semibold text-brand">{authMsg}</p>}
              <Button onClick={doSignUp} disabled={authBusy || !signupOk} className="brutal-sm brutal-press mt-4 h-11 w-full rounded-none border-2 border-foreground bg-brand text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-50">
                {authBusy ? <Loader2 className="size-4 animate-spin" /> : null} {tr("ac.createAcct")}
              </Button>
              <button onClick={() => { setAuthMode("in"); clr() }} className="mt-4 w-full text-center text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand">
                {tr("ac.haveAcct")}
              </button>
            </>
          )}
        </div>
      </section>
    )
  }

  const paid = isPaid(tariff)
  const leadDir = result?.top[0]?.dir.id ?? null
  const lastExam = examResults[0] ?? null
  const readiness = lastExam?.readiness ?? 0
  // Профориентация считается пройденной, если есть результат ИЛИ сохранённый отчёт.
  const hasProfori = !!result || reports.length > 0
  // Последний результат по каждому типу теста (IELTS / SAT / HSK) — показываем все сданные.
  const latestByExam = (() => {
    const seen = new Set<string>()
    const out: typeof examResults = []
    for (const r of examResults) if (!seen.has(r.exam)) { seen.add(r.exam); out.push(r) }
    return out
  })()

  function chanceFor(uniId?: string): number | undefined {
    if (!uniId || !lastExam) return undefined
    return admissionChances(readiness, leadDir).find((c) => c.uni.id === uniId)?.chance
  }

  function addManual() {
    if (!newName.trim() || !newDate) return
    addApp({
      id: `app-${Date.now().toString(36)}`, name: newName.trim(), deadline: newDate, type: newType,
      status: "todo", materials: DEFAULT_MATERIALS.map((label) => ({ label, done: false })),
    })
    setNewName(""); setNewDate("")
  }

  function addSuggested() {
    if (!leadDir) return
    unisForDir(leadDir, 4).forEach((u) => addApp({
      id: `app-${u.id}`, name: u.name, country: u.country, deadline: "2027-01-01", type: "RD",
      status: "todo", materials: DEFAULT_MATERIALS.map((label) => ({ label, done: false })),
      chance: chanceFor(u.id),
    }))
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pt-12 pb-24">
      <div className="mb-5 mt-6 inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
        <User className="size-3.5 text-brand" /> {tr("hdr.account")}
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
        {profile?.name ? <>{tr("ac.hi")} <span className="text-brand">{profile.name}</span></> : tr("ac.cabinet")}
      </h1>
      <p className="mt-2 text-muted-foreground">{tr("ac.intro")}</p>

      <div className="mt-3 flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2 text-[11px] font-bold uppercase tracking-widest">
        {session ? (
          <>
            <Cloud className="size-3.5 text-brand" />
            <span className="truncate text-muted-foreground">{tr("ac.sync")} · {session.user.email}</span>
            <button onClick={signOut} className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-brand"><LogOut className="size-3.5" /> {tr("ac.logout")}</button>
          </>
        ) : (
          <><HardDrive className="size-3.5" /> <span className="text-muted-foreground">{tr("ac.localMode")}</span></>
        )}
      </div>

      {/* тариф и срок действия */}
      <div className="mt-4 flex flex-col gap-3 border-2 border-foreground bg-card p-4 sm:flex-row sm:items-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{tr("ac.plan")}</span>
        <span className="text-[13px] font-black uppercase tracking-wide">
          {lang === "ru" ? TARIFF_LABEL[tariff] : TARIFF_NAME_TR[tariff][lang]}
          {planDaysLeft(tariffUntil) !== null && (
            <span className="ml-2 font-bold text-brand">
              · {planDaysLeft(tariffUntil)} {tr(planDaysLeft(tariffUntil) === 1 ? "tr.dayLeft" : "tr.daysLeft")}
            </span>
          )}
        </span>
        <div className="sm:ml-auto">
          <TrialButton onNeedAccount={onOpenPricing} onStarted={() => {}} size="sm" />
        </div>
      </div>

      {/* профиль */}
      <div className="mt-6 flex flex-col gap-3 border-2 border-foreground bg-card p-4 sm:flex-row sm:items-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{tr("ac.nameLabel")}</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("ac.namePh")} className="h-10 flex-1 rounded-none border-2 border-foreground" />
        <Button onClick={() => setProfile(name)} className="brutal-sm brutal-press h-10 rounded-none border-2 border-foreground bg-brand px-4 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">{tr("ac.save")}</Button>
      </div>

      {/* обзор */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="border-2 border-foreground bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{tr("ac.direction")}</p>
          <p className="mt-1 text-lg font-black leading-tight">{leadDir ? dirTitle(leadDir) : hasProfori ? "✓" : "—"}</p>
          {!hasProfori && <button onClick={onOpenNavigator} className="mt-1 text-[12px] font-bold uppercase tracking-wider text-brand hover:underline">{tr("ac.takeProfori")}</button>}
        </div>
        <div className="border-2 border-foreground bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{tr("ac.level")}</p>
          {latestByExam.length ? (
            <div className="mt-1 flex flex-col gap-0.5">
              {latestByExam.map((e) => (
                <p key={e.exam} className="text-sm font-black leading-tight">
                  <span className="text-muted-foreground">{EXAMS[e.exam].name}</span> <span className="text-brand">{e.level}</span>
                </p>
              ))}
            </div>
          ) : <p className="mt-1 text-lg font-black leading-tight text-brand">—</p>}
          <button onClick={onOpenAssess} className="mt-1 text-[12px] font-bold uppercase tracking-wider text-brand hover:underline">{tr("ac.takeTest")}</button>
        </div>
        <div className="border-2 border-foreground bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{tr("ac.planProgress")}</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{planPct}%</p>
          <button onClick={onOpenPlan} className="mt-1 text-[12px] font-bold uppercase tracking-wider text-brand hover:underline">{tr("ac.openMap")}</button>
        </div>
      </div>

      {/* быстрые инструменты */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onOpenAssess} variant="outline" className="h-10 rounded-none border-2 border-foreground px-4 text-[12px] font-bold uppercase tracking-wider"><GraduationCap className="size-4" /> {tr("ac.levelTest")}</Button>
        <Button onClick={onOpenEssay} variant="outline" className="h-10 rounded-none border-2 border-foreground px-4 text-[12px] font-bold uppercase tracking-wider"><PenLine className="size-4" /> {tr("ac.aiEssay")}</Button>
        <Button onClick={onOpenPlan} variant="outline" className="h-10 rounded-none border-2 border-foreground px-4 text-[12px] font-bold uppercase tracking-wider"><MapPin className="size-4" /> {tr("ac.admissionMap")}</Button>
      </div>

      {/* ── Трекер заявок и дедлайнов ── */}
      <div className="mt-10 flex items-center gap-3 border-b-2 border-foreground pb-3">
        <CalendarClock className="size-6 text-brand" />
        <h2 className="text-xl font-black uppercase tracking-tight">{tr("ac.apps")}</h2>
        {!paid && <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand"><Lock className="size-3" /> Lumifield+</span>}
      </div>

      {!paid ? (
        <div className="mt-4 border-2 border-dashed border-foreground/30 p-8 text-center">
          <p className="text-sm font-bold uppercase leading-tight">{tr("ac.trackerLockT")}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{tr("ac.trackerLockD")}</p>
          <Button onClick={() => setUnlock(true)} className="brutal-sm brutal-press mt-4 h-10 rounded-none border-2 border-foreground bg-brand px-5 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"><Sparkles className="size-4" /> {tr("ac.open")}</Button>
          {unlock && <UnlockSheet context="tracker" onClose={() => setUnlock(false)} onOpenPricing={onOpenPricing} onNeedAccount={onOpenPricing} />}
        </div>
      ) : (
        <>
          {/* добавить */}
          <div className="mt-4 grid gap-3 border-2 border-foreground bg-card p-4 sm:grid-cols-[1fr_auto_auto_auto]">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={tr("ac.uniPh")} className="h-10 rounded-none border-2 border-foreground" />
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="h-10 rounded-none border-2 border-foreground bg-background px-2 text-sm" />
            <select value={newType} onChange={(e) => setNewType(e.target.value as AppType)} className="h-10 rounded-none border-2 border-foreground bg-background px-2 text-sm font-bold">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button onClick={addManual} disabled={!newName.trim() || !newDate} className="brutal-sm brutal-press h-10 rounded-none border-2 border-foreground bg-brand px-4 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-40"><Plus className="size-4" /> {tr("ac.add")}</Button>
          </div>
          {leadDir && (
            <button onClick={addSuggested} className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-brand hover:underline">
              <Plus className="size-3.5" /> {tr("ac.addFromDir")}
            </button>
          )}

          {apps.length === 0 ? (
            <div className="mt-4 border border-dashed border-foreground/20 py-12 text-center text-muted-foreground">
              <CalendarClock className="mx-auto size-6 opacity-40" />
              <p className="mt-2 text-sm">{tr("ac.noApps")}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {apps.map((a) => {
                const dl = daysLeft(a.deadline)
                const dlColor = dl < 0 ? "#8895a0" : dl <= 14 ? "var(--brand)" : dl <= 45 ? "#e8912e" : "var(--foreground)"
                const doneCount = a.materials.filter((m) => m.done).length
                return (
                  <div key={a.id} className="border-2 border-foreground bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-foreground/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">{a.type}</span>
                      <h3 className="text-base font-black leading-tight">{a.name}</h3>
                      {a.country && <span className="text-[12px] text-muted-foreground">· {a.country}</span>}
                      {a.chance !== undefined && <span className="text-[12px] font-bold text-brand">· {tr("ac.chance")} {a.chance}%</span>}
                      <button onClick={() => removeApp(a.id)} className="ml-auto text-muted-foreground hover:text-brand"><Trash2 className="size-4" /></button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: dlColor }}>
                        <CalendarClock className="size-3.5" />
                        {dl < 0 ? tr("ac.dlPassed") : `${dl} ${tr("ac.daysShort")}`}
                      </span>
                      <input type="date" value={a.deadline} onChange={(e) => updateApp(a.id, { deadline: e.target.value })} className="h-8 rounded-none border-2 border-foreground bg-background px-2 text-[12px]" />
                      <button onClick={() => updateApp(a.id, { status: NEXT[a.status] })}
                        className={"h-8 border-2 border-foreground px-3 text-[11px] font-bold uppercase tracking-wider transition-colors " + (a.status === "done" ? "bg-brand text-brand-foreground" : a.status === "progress" ? "bg-foreground text-background" : "bg-background")}>
                        {a.status === "done" ? <Check className="mr-1 inline size-3" /> : <Clock className="mr-1 inline size-3" />}
                        {tr(`ac.st.${a.status}`)}
                      </button>
                    </div>

                    <div className="mt-3 border-t border-foreground/12 pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{tr("ac.materials")} {doneCount}/{a.materials.length}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {a.materials.map((m, mi) => (
                          <button key={mi} onClick={() => toggleMaterial(a.id, mi)}
                            className={"flex items-center gap-1.5 border-2 border-foreground px-2.5 py-1 text-[12px] font-semibold transition-colors " + (m.done ? "bg-brand text-brand-foreground" : "bg-background hover:bg-muted")}>
                            <span className={"grid size-3.5 place-items-center border " + (m.done ? "border-brand-foreground" : "border-foreground")}>{m.done && <Check className="size-2.5" />}</span>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* отчёты YouPath */}
      {reports.length > 0 && (
        <>
          <div className="mt-10 flex items-center gap-3 border-b-2 border-foreground pb-3">
            <FileText className="size-6 text-brand" />
            <h2 className="text-xl font-black uppercase tracking-tight">{tr("ac.myReports")}</h2>
            <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{reports.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {reports.map((r) => {
              const open = openReport === r.id
              return (
                <div key={r.id} className="border-2 border-foreground bg-card">
                  <div className="flex items-center gap-2 p-4">
                    <FileText className="size-4 shrink-0 text-brand" />
                    <button onClick={() => setOpenReport(open ? null : r.id)} className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-bold leading-tight">
                        {tr("ac.reportTitle")} · {r.country || tr("ac.admission")}{r.timeline ? ` · ${r.timeline}` : ""}
                      </span>
                      <span className="block text-[12px] text-muted-foreground">{new Date(r.at).toLocaleString(dateLoc)}</span>
                    </button>
                    <button onClick={() => setOpenReport(open ? null : r.id)} className="text-muted-foreground hover:text-brand"><ChevronDown className={"size-4 transition-transform " + (open ? "rotate-180" : "")} /></button>
                    <button onClick={() => { removeReport(r.id); if (open) setOpenReport(null) }} className="text-muted-foreground hover:text-brand"><Trash2 className="size-4" /></button>
                  </div>
                  {open && (
                    <div className="border-t-2 border-foreground p-4">
                      <div className="max-h-[60vh] space-y-1.5 overflow-y-auto leading-relaxed">
                        {r.text.split("\n").map((line, i) => {
                          const t = line.trim()
                          if (!t) return <div key={i} className="h-2" />
                          const head = /^(ЧАСТЬ|БЛОК|PART)\b/i.test(t) || /^#{1,3}\s/.test(t)
                          return head
                            ? <h3 key={i} className="mt-3 border-b border-foreground/20 pb-1 text-sm font-black uppercase tracking-tight">{t.replace(/^#{1,3}\s/, "")}</h3>
                            : <p key={i} className="text-[14px] text-foreground/85">{t}</p>
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* история тестов */}
      {examResults.length > 0 && (
        <>
          <div className="mt-10 flex items-center gap-3 border-b-2 border-foreground pb-3">
            <GraduationCap className="size-6 text-brand" />
            <h2 className="text-xl font-black uppercase tracking-tight">{tr("ac.testHistory")}</h2>
          </div>
          <div className="mt-4 space-y-2">
            {examResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between border-2 border-foreground bg-card p-3">
                <span className="text-sm font-bold">{EXAMS[r.exam].name} · {r.level}</span>
                <span className="text-[12px] text-muted-foreground">{new Date(r.at).toLocaleDateString(dateLoc)} · {tr("ac.readiness")} {Math.round(r.readiness * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasProfori && (
        <div className="mt-10 border-2 border-foreground bg-brand/10 p-5 text-center">
          <p className="font-bold uppercase tracking-wide">{tr("ac.startProfori")}</p>
          <Button onClick={onOpenNavigator} className="brutal-sm brutal-press mt-3 h-10 rounded-none border-2 border-foreground bg-brand px-5 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">{tr("ac.take")} <ArrowRight className="size-4" /></Button>
        </div>
      )}
    </section>
  )
}
