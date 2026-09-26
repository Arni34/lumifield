import { useEffect, useState } from "react"
import { ShieldCheck, Check, X, Clock, ExternalLink, Lock, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Приватная админка модерации. Пароль проверяется на сервере (/api/admin),
// доступ — только по секретной ссылке <домен>/#admin. Через основной сайт не зайти.
const ENDPOINT = "/api/admin"
const SKEY = "lumifield.admin" // пароль в sessionStorage (до закрытия вкладки)

type Sub = {
  id: string; t: string; org: string; cat: string; price: string; scope: string
  loc: string; age: string; dl: string; url: string; d: string
  status: "pending" | "approved" | "rejected"; submitted_by?: string; submitted_at?: string
}

async function call(password: string, action: string, extra: Record<string, unknown> = {}) {
  const r = await fetch(ENDPOINT, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, action, ...extra }),
  })
  return { status: r.status, data: await r.json().catch(() => ({})) }
}

export default function Admin() {
  const { t } = useI18n()
  const [pass, setPass] = useState("")
  const [authed, setAuthed] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [subs, setSubs] = useState<Sub[]>([])
  const [tab, setTab] = useState<Sub["status"]>("pending")
  // Разделы админки. Новый раздел = запись в SECTIONS плюс действие в api/admin.js.
  const [sec, setSec] = useState<"stats" | "subs" | "promos">("stats")
  const [stats, setStats] = useState<Record<string, Record<string, number | null>> | null>(null)
  const [promos, setPromos] = useState<Record<string, unknown>[]>([])
  const [noService, setNoService] = useState(false)

  async function load(password: string) {
    setLoading(true); setErr(null)
    const r = await call(password, "subs")
    setLoading(false)
    if (r.status === 401) { setErr("Неверный пароль"); return false }
    if (!r.data?.ok) { setErr(r.data?.error ?? "Ошибка"); return false }
    setSubs(r.data.submissions ?? []); setAuthed(true)
    return true
  }

  // Автовход, если пароль уже вводили в этой вкладке.
  useEffect(() => {
    const saved = sessionStorage.getItem(SKEY)
    if (saved) load(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login() {
    if (!pass.trim()) return
    if (await load(pass)) { sessionStorage.setItem(SKEY, pass); setPass("") }
  }

  // Каждый раздел тянет свои данные — панель не грузит лишнего.
  useEffect(() => {
    if (!authed) return
    const password = sessionStorage.getItem(SKEY) ?? ""
    let alive = true
    void (async () => {
      if (sec === "stats") {
        const r = await call(password, "stats")
        if (!alive) return
        setStats(r.data?.ok ? r.data : null)
        setNoService(r.data?.serviceKey === false)
      }
      if (sec === "promos") {
        const r = await call(password, "promos")
        if (alive) setPromos(r.data?.promos ?? [])
      }
    })()
    return () => { alive = false }
  }, [sec, authed])

  async function moderate(id: string, status: Sub["status"]) {
    const password = sessionStorage.getItem(SKEY) ?? ""
    setLoading(true)
    await call(password, "status", { id, status })
    await load(password)
  }

  if (!authed) {
    return (
      <section className="mx-auto max-w-md px-6 pt-20 pb-24">
        <div className="border-2 border-foreground bg-card p-8 brutal">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <Lock className="size-3.5" /> Админ-панель
          </div>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">Вход</h1>
          <p className="mt-2 text-sm text-muted-foreground">Приватный доступ. Пароль проверяется на сервере.</p>
          <Input
            type="password" value={pass}
            onChange={(e) => { setPass(e.target.value); setErr(null) }}
            onKeyDown={(e) => e.key === "Enter" && !loading && login()}
            placeholder="Пароль"
            className="mt-5 h-11 rounded-none border-2 border-foreground"
          />
          {err && <p className="mt-2 text-[12px] font-bold uppercase tracking-wider text-brand">{err}</p>}
          <Button onClick={login} disabled={loading} className="brutal-sm brutal-press mt-4 h-11 w-full rounded-none border-2 border-foreground bg-foreground text-[12px] font-bold uppercase tracking-wider text-background hover:bg-brand hover:text-brand-foreground disabled:opacity-50">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null} Войти
          </Button>
        </div>
      </section>
    )
  }

  const list = subs.filter((s) => s.status === tab)
  const count = (k: Sub["status"]) => subs.filter((s) => s.status === k).length
  const TABS: { k: Sub["status"]; label: string }[] = [
    { k: "pending", label: "На проверке" }, { k: "approved", label: "Одобрено" }, { k: "rejected", label: "Отклонено" },
  ]

  return (
    <section className="mx-auto max-w-4xl px-6 pt-12 pb-24">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
          <ShieldCheck className="size-3.5 text-brand" /> Модерация
        </span>
        {loading && <Loader2 className="size-4 animate-spin text-brand" />}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {([["stats", "Сводка"], ["subs", "Заявки"], ["promos", "Промокоды"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setSec(k)}
            className={"border-2 border-foreground px-4 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors " +
              (sec === k ? "bg-foreground text-background" : "bg-card hover:bg-muted")}>
            {label}
          </button>
        ))}
      </div>

      {noService && (
        <p className="mt-4 border-2 border-brand bg-brand/10 px-3 py-2 text-[13px] font-semibold text-brand">
          Счётчик аккаунтов и выдача тарифов недоступны: не задана серверная переменная SUPABASE_SERVICE_ROLE.
        </p>
      )}

      {sec === "stats" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats && ([
            ["Каталог · на проверке", stats.catalog?.pending],
            ["Каталог · одобрено", stats.catalog?.approved],
            ["Промокоды · всего", stats.promo?.total],
            ["Промокоды · активированы", stats.promo?.used],
            ["Платформа · аккаунты", stats.platform?.users],
          ] as const).map(([label, v]) => (
            <div key={label} className="border-2 border-foreground bg-card p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="mt-1 font-mono text-3xl font-bold tabular-nums">{v ?? "—"}</p>
            </div>
          ))}
          {!stats && <p className="text-muted-foreground">Загружаю сводку…</p>}
        </div>
      )}

      {sec === "promos" && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="py-2 pr-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Код</th>
                <th className="py-2 pr-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Тариф</th>
                <th className="py-2 pr-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Дней</th>
                <th className="py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((r, i) => (
                <tr key={i} className="border-b border-foreground/20">
                  <td className="py-2 pr-4 font-mono">{String(r.code)}</td>
                  <td className="py-2 pr-4">{String(r.tariff ?? "")}</td>
                  <td className="py-2 pr-4 font-mono tabular-nums">{String(r.days ?? "")}</td>
                  <td className="py-2">{r.used_by ? "активирован" : "свободен"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {promos.length === 0 && <p className="py-6 text-muted-foreground">Промокодов нет.</p>}
        </div>
      )}

      {sec === "subs" && (<>
      <h1 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-4xl">Заявки на мероприятия</h1>
      <p className="mt-2 text-muted-foreground">Одобренные попадают в каталог. Отклонённые скрыты.</p>

      <div className="mt-8 flex gap-2 border-b-2 border-foreground">
        {TABS.map((tt) => (
          <button key={tt.k} onClick={() => setTab(tt.k)}
            className={"-mb-0.5 border-b-4 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-colors " + (tab === tt.k ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tt.label} <span className="opacity-50">{count(tt.k)}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-8 border border-dashed border-foreground/20 py-16 text-center text-muted-foreground">
          <Clock className="mx-auto size-6 opacity-40" />
          <p className="mt-2 text-sm font-bold uppercase tracking-wide text-foreground">Пусто</p>
          <p className="mt-1 text-sm">Здесь нет заявок в этом статусе.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((s) => (
            <div key={s.id} className="border-2 border-foreground bg-card p-5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1"><span className="size-2 bg-brand" />{t(`cat.${s.cat}`)}</span>
                <span>· {s.org}</span>
                <span className="ml-auto">{s.submitted_by || "аноним"}{s.submitted_at ? ` · ${new Date(s.submitted_at).toLocaleDateString("ru-RU")}` : ""}</span>
              </div>
              <h3 className="mt-2 text-lg font-black leading-tight tracking-tight">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{s.d}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <span>{s.loc}</span><span>{s.age}</span><span>{s.dl}</span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand hover:underline">ссылка <ExternalLink className="size-3" /></a>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-foreground/12 pt-4">
                {s.status !== "approved" && (
                  <Button onClick={() => moderate(s.id, "approved")} disabled={loading} className="brutal-sm brutal-press h-10 rounded-none border-2 border-foreground bg-brand px-4 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-50">
                    <Check className="size-4" /> Одобрить
                  </Button>
                )}
                {s.status !== "rejected" && (
                  <Button onClick={() => moderate(s.id, "rejected")} disabled={loading} variant="outline" className="h-10 rounded-none border-2 border-foreground px-4 text-[12px] font-bold uppercase tracking-wider disabled:opacity-50">
                    <X className="size-4" /> Отклонить
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </>)}
    </section>
  )
}
