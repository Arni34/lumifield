import { Briefcase, GraduationCap, MapPin, PenLine } from "lucide-react"
import { useI18n } from "@/lib/i18n"

// Превью отчёта на главной: показываем, ЧТО именно получит пользователь,
// на образце — а не списком обещаний. Каждый блок соответствует реальной части
// отчёта YouPath (профессии / вузы / письмо) и карте поступления (план).
// Помечено как ОБРАЗЕЦ, чтобы не путать с личным результатом.
export function ReportPreview() {
  const { t } = useI18n()
  return (
    <div className="border-2 border-foreground bg-card brutal">
      {/* шапка «образец» */}
      <div className="flex items-center gap-2 border-b-2 border-foreground bg-foreground px-4 py-2.5 text-background">
        <span className="size-2 bg-brand" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{t("rpv.label")}</span>
      </div>

      <div className="divide-y-2 divide-foreground">
        {/* часть 1 — профессии */}
        <Row icon={Briefcase} title={t("rep.p1")}>
          <Line>{t("rep.r1")}</Line>
          <Line>{t("rep.r2")}</Line>
        </Row>

        {/* часть 2 — вузы с дедлайном */}
        <Row icon={GraduationCap} title={t("rep.p2")}>
          <Line>{t("rep.u1")}</Line>
          <Line>{t("rep.u2")}</Line>
          <p className="mt-1 text-[12px] font-bold uppercase tracking-wider text-brand">{t("rep.u3")}</p>
        </Row>

        {/* карта поступления — план по шагам */}
        <Row icon={MapPin} title={t("rpv.rm.t")}>
          {["1", "2", "3"].map((n) => (
            <p key={n} className="flex items-start gap-2 text-[14px] leading-snug text-foreground/85">
              <span className="mt-1 size-3 shrink-0 border-2 border-foreground" />
              {t(`rpv.rm.${n}`)}
            </p>
          ))}
        </Row>

        {/* часть 3 — мотивационное письмо */}
        <Row icon={PenLine} title={t("rep.p3")}>
          <p className="border-l-4 border-brand pl-3 text-[14px] italic leading-snug text-foreground/85">{t("rep.l")}</p>
        </Row>
      </div>
    </div>
  )
}

function Row({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-5">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-4 text-brand" /> {title}
      </p>
      <div className="mt-2.5 space-y-1.5">{children}</div>
    </div>
  )
}

function Line({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] leading-snug text-foreground/85">{children}</p>
}
