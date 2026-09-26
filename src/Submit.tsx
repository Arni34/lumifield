import { useState } from "react"
import { Check, Send, Plus } from "lucide-react"
import { CATS, type Program, type Cat } from "@/data/programs"
import { addSubmission } from "@/lib/store"
import { notifySubmission } from "@/lib/notify"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const FIELD =
  "h-11 w-full rounded-none border-2 border-foreground bg-card px-3 text-[15px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
const LABEL = "text-[11px] font-bold uppercase tracking-widest text-muted-foreground"

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40)
}

export default function Submit({ onOpenCatalog }: { onOpenCatalog: () => void }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const [f, setF] = useState({
    t: "", org: "", cat: "hack" as Cat, price: "free" as Program["price"],
    format: "online" as Program["format"], scope: "kz" as Program["scope"],
    loc: "", age: "", dl: "", url: "", d: "", tags: "", by: "",
  })
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))

  const valid = f.t.trim() && f.org.trim() && f.url.trim() && f.d.trim()

  function submit() {
    if (!valid) return
    const p: Program = {
      id: `${slug(f.t)}-${Date.now().toString(36)}`,
      t: f.t.trim(), org: f.org.trim(), cat: f.cat, price: f.price,
      format: f.format, scope: f.scope,
      loc: f.loc.trim() || (f.scope === "kz" ? t("cp.scope.kz") : t("sb.defOnline")),
      age: f.age.trim() || "—",
      dl: f.dl.trim() || t("sb.defDl"),
      url: f.url.trim(),
      d: f.d.trim(),
      tags: f.tags.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4),
      ok: false,
    }
    const by = f.by.trim() || t("sb.anon")
    addSubmission(p, by)
    notifySubmission(p, by) // уведомляем модератора в Telegram (best-effort)
    setDone(true)
  }

  if (done) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center border-2 border-foreground bg-brand text-brand-foreground brutal">
          <Check className="size-8" />
        </div>
        <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">{t("sb.doneH")}</h1>
        <p className="mt-3 text-muted-foreground">
          {t("sb.doneSub")}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={onOpenCatalog} className="brutal-sm brutal-press h-11 rounded-none border-2 border-foreground bg-brand px-6 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">
            {t("sb.toCatalog")}
          </Button>
          <Button onClick={() => { setDone(false); setF((p) => ({ ...p, t: "", org: "", url: "", d: "", tags: "" })) }} variant="outline" className="h-11 rounded-none border-2 border-foreground px-6 text-[12px] font-bold uppercase tracking-wider">
            <Plus className="size-4" /> {t("sb.another")}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-6 pt-12 pb-24">
      <div className="mb-6 inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
        <Plus className="size-3.5 text-brand" /> {t("sb.badge")}
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{t("sb.h")}</h1>
      <p className="mt-3 text-muted-foreground">
        {t("sb.sub")}
      </p>

      <div className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <label className={LABEL}>{t("sb.name")}</label>
          <Input value={f.t} onChange={(e) => set("t", e.target.value)} placeholder={t("sb.namePh")} className={FIELD} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.org")}</label>
            <Input value={f.org} onChange={(e) => set("org", e.target.value)} placeholder={t("sb.orgPh")} className={FIELD} />
          </div>
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.category")}</label>
            <select value={f.cat} onChange={(e) => set("cat", e.target.value)} className={FIELD}>
              {CATS.map((c) => <option key={c.key} value={c.key}>{t(`cat.${c.key}`)}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.price")}</label>
            <select value={f.price} onChange={(e) => set("price", e.target.value)} className={FIELD}>
              <option value="free">{t("pc.price.free")}</option>
              <option value="paid">{t("pc.price.paid")}</option>
              <option value="freemium">{t("pc.price.freemium")}</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.format")}</label>
            <select value={f.format} onChange={(e) => set("format", e.target.value)} className={FIELD}>
              <option value="online">{t("pc.format.online")}</option>
              <option value="offline">{t("pc.format.offline")}</option>
              <option value="hybrid">{t("pc.format.hybrid")}</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.scope")}</label>
            <select value={f.scope} onChange={(e) => set("scope", e.target.value)} className={FIELD}>
              <option value="kz">{t("sb.scope.kz")}</option>
              <option value="intl">{t("sb.scope.intl")}</option>
            </select>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.loc")}</label>
            <Input value={f.loc} onChange={(e) => set("loc", e.target.value)} placeholder={t("sb.locPh")} className={FIELD} />
          </div>
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.age")}</label>
            <Input value={f.age} onChange={(e) => set("age", e.target.value)} placeholder={t("sb.agePh")} className={FIELD} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.deadline")}</label>
            <Input value={f.dl} onChange={(e) => set("dl", e.target.value)} placeholder={t("sb.dlPh")} className={FIELD} />
          </div>
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.link")}</label>
            <Input value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" className={FIELD} />
          </div>
        </div>
        <div className="grid gap-2">
          <label className={LABEL}>{t("sb.desc")}</label>
          <textarea value={f.d} onChange={(e) => set("d", e.target.value)} rows={3} placeholder={t("sb.descPh")} className={FIELD + " h-auto py-2.5 leading-relaxed"} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.tags")}</label>
            <Input value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="AI, Python" className={FIELD} />
          </div>
          <div className="grid gap-2">
            <label className={LABEL}>{t("sb.contact")}</label>
            <Input value={f.by} onChange={(e) => set("by", e.target.value)} placeholder={t("sb.contactPh")} className={FIELD} />
          </div>
        </div>

        <Button
          onClick={submit}
          disabled={!valid}
          className="brutal brutal-press mt-2 h-12 rounded-none border-2 border-foreground bg-brand text-[13px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          <Send className="size-4" /> {t("sb.submit")}
        </Button>
        {!valid && <p className="text-[12px] text-muted-foreground">{t("sb.reqNote")}</p>}
      </div>
    </section>
  )
}
