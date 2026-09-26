import { useSyncExternalStore } from "react"
import { PROGRAMS, type Program } from "@/data/programs"
import { type AnalyzeResult } from "@/lib/profori"
import { type Grade } from "@/lib/plan"
import { type ExamId } from "@/data/exams"
import { remoteList, remotePush, remoteSetStatus, remoteDelete } from "@/lib/supabase"

// Клиентский стор на localStorage. Для MVP этого достаточно: модерация и
// тарифы реально работают и переживают перезагрузку. Прод-версия заменит это
// на бэкенд (БД + auth + платежи) — точки подключения помечены в UI и MODEL.md.

export type SubStatus = "pending" | "approved" | "rejected"
export type Submission = Program & {
  status: SubStatus
  submittedBy: string
  submittedAt: number
}

export type TariffId = "free" | "plus" | "package"

// Аккаунт: запоминаем результаты и трекер заявок (в духе collegize).
export type ExamResult = { exam: ExamId; readiness: number; level: string; at: number }
export type AppType = "EA" | "ED" | "RD" | "Rolling"
export type AppStatus = "todo" | "progress" | "done"
export type Material = { label: string; done: boolean }
export type AppItem = {
  id: string
  name: string
  country?: string
  deadline: string // ISO yyyy-mm-dd
  type: AppType
  status: AppStatus
  materials: Material[]
  chance?: number
}

// Сохранённый отчёт YouPath
export type YReport = { id: string; at: number; text: string; country?: string; timeline?: string   /** Ответы анкеты: нужны, чтобы отчёт можно было разобрать позже. */
  answers?: Record<string, string>
}

// Черновик анкеты YouPath: гость проходит блоки без аккаунта, ответы не теряются
// при уходе на регистрацию и при перезагрузке. Локальный (в Snapshot НЕ входит).
export type YDraft = { answers: Record<string, string>; bi: number; at: number }

export type Profile = { name: string; surname?: string; phone?: string; username?: string }

// Тариф упал на Free (истёк пробный период или промокод) — показываем разовое
// честное уведомление о том, что закрылось. Локальное: в Snapshot не входит.
export type ExpiryNotice = { from: TariffId; at: number }

export type State = {
  submissions: Submission[]
  tariff: TariffId
  tariffUntil: number | null         // срок действия тарифа (epoch ms); null = бессрочно
  progress: Record<string, boolean> // выполненные задачи плана (геймификация)
  profile: Profile | null
  savedResult: AnalyzeResult | null  // сохранённая профориентация
  grade: Grade | null                // класс/курс из анкеты (для карты поступления)
  examResults: ExamResult[]          // история тестов уровня
  apps: AppItem[]                    // отслеживаемые заявки (дедлайны)
  reports: YReport[]                 // сохранённые отчёты YouPath
  ypDraft: YDraft | null             // незавершённая анкета (гость) — только локально
  trialUsed: boolean                 // пробный период уже брали (синхронизируется)
  expiryNotice: ExpiryNotice | null  // тариф истёк, уведомление не показано — локально
}

const KEY = "qadam.v1"
const DEFAULT: State = {
  submissions: [], tariff: "free", tariffUntil: null, progress: {},
  profile: null, savedResult: null, grade: null, examResults: [], apps: [], reports: [],
  ypDraft: null, trialUsed: false, expiryNotice: null,
}

// Истёк ли временный тариф (промокод на 2 недели и т.п.) — откат на Free.
function expireIfNeeded(s: State): State {
  if (s.tariff !== "free" && s.tariffUntil && Date.now() > s.tariffUntil) {
    // Запоминаем, с какого тарифа упали: пользователь увидит, что именно закрылось.
    return { ...s, tariff: "free", tariffUntil: null, expiryNotice: { from: s.tariff, at: Date.now() } }
  }
  return s
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return expireIfNeeded({ ...DEFAULT, ...JSON.parse(raw) })
  } catch { /* ignore */ }
  return { ...DEFAULT }
}

let state: State = load()
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
  listeners.forEach((l) => l())
}

// ── actions ────────────────────────────────────────────
export function addSubmission(p: Program, submittedBy: string) {
  const sub: Submission = { ...p, status: "pending", submittedBy, submittedAt: Date.now() }
  commit({ ...state, submissions: [sub, ...state.submissions] })
  remotePush(sub) // best-effort зеркало в БД
}
export function setStatus(id: string, status: SubStatus) {
  commit({ ...state, submissions: state.submissions.map((s) => (s.id === id ? { ...s, status } : s)) })
  remoteSetStatus(id, status)
}
export function removeSubmission(id: string) {
  commit({ ...state, submissions: state.submissions.filter((s) => s.id !== id) })
  remoteDelete(id)
}
export function setTariff(tariff: TariffId, until: number | null = null) {
  commit({ ...state, tariff, tariffUntil: tariff === "free" ? null : until })
}
/** Длительность пробного периода Lumifield+ (дней). */
export const TRIAL_DAYS = 7

/**
 * Включает 7-дневный Lumifield+. Один раз на аккаунт: флаг trialUsed
 * синхронизируется и при merge только «залипает» (см. sync.ts).
 * Карта не нужна и отменять нечего — тариф сам вернётся на Free.
 */
export function startTrial(): boolean {
  if (state.trialUsed || isPaid(state.tariff)) return false
  commit({
    ...state,
    tariff: "plus",
    tariffUntil: Date.now() + TRIAL_DAYS * 86_400_000,
    trialUsed: true,
  })
  return true
}
export function dismissExpiryNotice() {
  if (!state.expiryNotice) return
  commit({ ...state, expiryNotice: null })
}

/** Откатывает истёкший временный тариф на Free. Вызывается на старте и после синка. */
export function enforceTariffExpiry() {
  const next = expireIfNeeded(state)
  if (next !== state) commit(next)
}
export function toggleTask(id: string) {
  commit({ ...state, progress: { ...state.progress, [id]: !state.progress[id] } })
}

// ── аккаунт / память результатов ───────────────────────
export function setProfile(name: string) {
  commit({ ...state, profile: name.trim() ? { ...(state.profile ?? {}), name: name.trim() } : null })
}
export function setProfileFields(p: Partial<Profile>) {
  commit({ ...state, profile: { name: "", ...(state.profile ?? {}), ...p } })
}
export function saveResult(r: AnalyzeResult) {
  commit({ ...state, savedResult: r })
}
export function setGrade(g: Grade) {
  commit({ ...state, grade: g })
}
export function addExamResult(r: ExamResult) {
  commit({ ...state, examResults: [r, ...state.examResults].slice(0, 20) })
}
export function saveReport(r: YReport) {
  commit({ ...state, reports: [r, ...state.reports].slice(0, 20) })
}
/** Черновик анкеты: пишем на каждом шаге, чтобы ответы гостя пережили регистрацию. */
export function saveDraft(answers: Record<string, string>, bi: number) {
  commit({ ...state, ypDraft: { answers, bi, at: Date.now() } })
}
export function clearDraft() {
  if (!state.ypDraft) return
  commit({ ...state, ypDraft: null })
}
export function removeReport(id: string) {
  commit({ ...state, reports: state.reports.filter((r) => r.id !== id) })
}
export function addApp(app: AppItem) {
  if (state.apps.some((a) => a.id === app.id)) return
  commit({ ...state, apps: [...state.apps, app].sort((a, b) => a.deadline.localeCompare(b.deadline)) })
}
export function updateApp(id: string, patch: Partial<AppItem>) {
  commit({ ...state, apps: state.apps.map((a) => (a.id === id ? { ...a, ...patch } : a)).sort((a, b) => a.deadline.localeCompare(b.deadline)) })
}
export function removeApp(id: string) {
  commit({ ...state, apps: state.apps.filter((a) => a.id !== id) })
}
export function toggleMaterial(appId: string, idx: number) {
  commit({
    ...state,
    apps: state.apps.map((a) =>
      a.id === appId ? { ...a, materials: a.materials.map((m, i) => (i === idx ? { ...m, done: !m.done } : m)) } : a
    ),
  })
}

/** Подтягивает заявки из Supabase, если бэкенд включён. Вызывается на старте. */
export async function hydrate() {
  const rows = await remoteList()
  if (rows) commit({ ...state, submissions: rows })
}

// ── selectors ──────────────────────────────────────────
export function approvedPrograms(): Program[] {
  return state.submissions.filter((s) => s.status === "approved")
}
/** Каталог = курируемые программы + одобренные пользовательские заявки. */
export function allPrograms(): Program[] {
  return [...PROGRAMS, ...approvedPrograms()]
}
export function pendingCount(): number {
  return state.submissions.filter((s) => s.status === "pending").length
}
export const isPaid = (t: TariffId) => t !== "free"   // Lumifield+ или Lumifield Pro
export const isPro = (t: TariffId) => t === "package"  // только Lumifield Pro

// ── синхронизация аккаунта (Supabase) ──────────────────
// Пользовательский срез данных (без глобальных submissions).
export type Snapshot = Pick<State, "tariff" | "tariffUntil" | "progress" | "profile" | "savedResult" | "grade" | "examResults" | "apps" | "reports" | "trialUsed">
export function snapshot(): Snapshot {
  const { tariff, tariffUntil, progress, profile, savedResult, grade, examResults, apps, reports, trialUsed } = state
  return { tariff, tariffUntil, progress, profile, savedResult, grade, examResults, apps, reports, trialUsed }
}
export function loadSnapshot(s: Partial<Snapshot>) {
  commit({ ...state, ...s })
}

// ── react hook ─────────────────────────────────────────
export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state, () => state)
}
