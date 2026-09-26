import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { CATS, type Cat } from "@/data/programs"
import { useStore, allPrograms } from "@/lib/store"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ProgramCard } from "@/components/program-card"

type Price = "all" | "free" | "paid"
type Format = "all" | "online" | "offline"
type Scope = "all" | "kz" | "intl"

function Segmented<T extends string>({
  value, onChange, options,
}: {
  value: T; onChange: (v: T) => void; options: { v: T; label: string }[]
}) {
  return (
    <div className="inline-flex border border-foreground/15">
      {options.map((o, i) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
            i > 0 && "border-l border-foreground/15",
            value === o.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function CatChip({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        active
          ? "brutal-sm border-2 border-foreground bg-brand text-brand-foreground"
          : "border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export default function Catalog({ initialCat = "all" }: { initialCat?: "all" | Cat }) {
  const { t } = useI18n()
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<"all" | Cat>(initialCat)
  const [price, setPrice] = useState<Price>("all")
  const [format, setFormat] = useState<Format>("all")
  const [scope, setScope] = useState<Scope>("all")

  const { submissions } = useStore()
  const all = useMemo(() => allPrograms(), [submissions])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    return all.filter((p) => {
      if (cat !== "all" && p.cat !== cat) return false
      if (price !== "all" && p.price !== price) return false
      if (format !== "all" && p.format !== format) return false
      if (scope !== "all" && p.scope !== scope) return false
      if (query) {
        const hay = `${p.t} ${p.org} ${p.d} ${p.tags.join(" ")} ${t(`cat.${p.cat}`)}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [q, cat, price, format, scope, all])

  const active = q || cat !== "all" || price !== "all" || format !== "all" || scope !== "all"
  const reset = () => { setQ(""); setCat("all"); setPrice("all"); setFormat("all"); setScope("all") }

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-2">
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{t("cp.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {all.length} {t("cp.sub")}
        </p>
      </section>

      <div className="sticky top-16 z-40 border-y border-foreground/15 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("cp.search")}
              className="h-11 rounded-none border-foreground/20 pl-9"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CatChip active={cat === "all"} onClick={() => setCat("all")}>
              {t("cp.all")} <span className="opacity-50">{all.length}</span>
            </CatChip>
            {CATS.map((c) => {
              const n = all.filter((p) => p.cat === c.key).length
              return (
                <CatChip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
                  {t(`cat.${c.key}`)} <span className="opacity-50">{n}</span>
                </CatChip>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Segmented<Price> value={price} onChange={setPrice}
              options={[{ v: "all", label: t("cp.price.all") }, { v: "free", label: t("cp.price.free") }, { v: "paid", label: t("cp.price.paid") }]} />
            <Segmented<Format> value={format} onChange={setFormat}
              options={[{ v: "all", label: t("cp.fmt.all") }, { v: "online", label: t("cp.fmt.online") }, { v: "offline", label: t("cp.fmt.offline") }]} />
            <Segmented<Scope> value={scope} onChange={setScope}
              options={[{ v: "all", label: t("cp.scope.all") }, { v: "kz", label: t("cp.scope.kz") }, { v: "intl", label: t("cp.scope.intl") }]} />
            {active && (
              <button onClick={reset} className="ml-auto flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <X className="size-3.5" /> {t("cp.reset")}
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="text-brand">{results.length}</span> {t("cp.count")}
        </p>
        {results.length === 0 ? (
          <div className="border border-dashed border-foreground/20 py-20 text-center text-muted-foreground">
            <p className="font-bold uppercase tracking-wide text-foreground">{t("cp.empty.t")}</p>
            <p className="mt-1 text-sm">{t("cp.empty.d")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => <ProgramCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
    </>
  )
}
