import { Check, Clock, ArrowUpRight, Globe, MapPin, User } from "lucide-react"
import { type Program } from "@/data/programs"
import { PROG_TR } from "@/data/programs.i18n"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 border border-foreground/12 px-2 py-1 text-[11px]">
      <span className="[&>svg]:size-3 opacity-70">{icon}</span>
      {children}
    </span>
  )
}

export function ProgramCard({ p }: { p: Program }) {
  const { t, lang } = useI18n()
  // Контент по языку: EN/KZ из companion-файла, RU (или отсутствие) — исходные поля.
  const tr = lang === "ru" ? undefined : PROG_TR[p.id]?.[lang]
  const d = tr?.d ?? p.d
  const loc = tr?.loc ?? p.loc
  const dl = tr?.dl ?? p.dl
  const age = tr?.age ?? p.age
  return (
    <Card className="brutal brutal-press relative gap-0 border-2 border-foreground bg-card py-0">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <CardHeader className="gap-0 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="size-2 bg-brand" />
            {t(`cat.${p.cat}`)}
          </span>
          <Badge
            className={cn(
              "ml-auto px-2 text-[10px] font-bold uppercase tracking-wider",
              p.price === "free"
                ? "bg-brand text-brand-foreground"
                : "border border-foreground/25 bg-transparent text-foreground"
            )}
          >
            {t(`pc.price.${p.price}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-5 pb-4">
        <CardTitle className="text-lg leading-tight tracking-tight">{p.t}</CardTitle>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {p.org}
        </p>
        <CardDescription className="mt-2.5 leading-relaxed text-foreground/70">
          {d}
        </CardDescription>
        <div className="mt-4 flex flex-wrap gap-1.5 text-muted-foreground">
          <Meta icon={p.format === "online" ? <Globe /> : <MapPin />}>{t(`pc.format.${p.format}`)}</Meta>
          <Meta icon={<MapPin />}>{loc}</Meta>
          <Meta icon={<User />}>{age}</Meta>
        </div>
      </CardContent>
      <Separator className="bg-foreground/12" />
      <CardFooter className="flex items-center justify-between gap-3 px-5 py-3.5">
        <span
          className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"
          title={p.ok ? t("pc.dlOk") : t("pc.dlCheck")}
        >
          {p.ok ? <Check className="size-3.5 shrink-0 text-foreground" /> : <Clock className="size-3.5 shrink-0" />}
          <span className="truncate">{dl}</span>
        </span>
        <a
          href={p.url} target="_blank" rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {t("pc.apply")} <ArrowUpRight className="size-3.5" />
        </a>
      </CardFooter>
    </Card>
  )
}
