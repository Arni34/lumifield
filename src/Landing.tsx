import { useRef } from "react"
import { ArrowRight, ArrowUpRight, Search, CheckCircle2, Send, Sparkles, Check } from "lucide-react"
import { gsap, useGSAP, SplitText, ScrollTrigger } from "@/lib/gsap"
import { PROGRAMS, CATS, type Cat } from "@/data/programs"
import { TARIFFS } from "@/data/tariffs"
import { TARIFF_TR } from "@/data/tariffs.i18n"
import { ProgramCard } from "@/components/program-card"
import { ReportPreview } from "@/components/report-preview"
import { useI18n } from "@/lib/i18n"
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion"

// Главная в духе tilu.kz: белый фон, небесный hero, карточки со скруглением,
// тёмные круглые кнопки и маленькие «чипы» над заголовками секций.

const STATS = {
  total: PROGRAMS.length,
  free: PROGRAMS.filter((p) => p.price === "free").length,
  intl: PROGRAMS.filter((p) => p.scope === "intl").length,
  cats: CATS.length,
}

// Вузы, куда целятся наши ученики, — текстовые «логотипы», как полоса
// университетов у tilu. Без картинок: чужие логотипы без разрешения не берём.
const UNIS = ["MIT", "Harvard", "Nazarbayev University", "KBTU", "Stanford", "KAIST", "NUS", "ETH Zürich", "KIMEP", "Bocconi"]

const FEATURED = ["nasa-space-apps", "flex-exchange", "bolashak", "swift-student-challenge", "uwc-scholarship", "diamond-challenge"]
  .map((id) => PROGRAMS.find((p) => p.id === id)!)
  .filter(Boolean)

const STEPS = [
  { icon: Search, k: "step1" },
  { icon: CheckCircle2, k: "step2" },
  { icon: Send, k: "step3" },
] as const

const FAQ = ["1", "2", "3", "4", "5", "6"] as const

// Цветные плитки направлений — как у курсов tilu: у каждой свой градиент.
const TILES: Record<Cat, string> = {
  olympiad: "linear-gradient(135deg,#ff5f8f 0%,#d92a5c 100%)",
  hack: "linear-gradient(135deg,#4f7dff 0%,#2d47d6 100%)",
  summer: "linear-gradient(135deg,#ff8a3d 0%,#e0451f 100%)",
  course: "linear-gradient(135deg,#31b3ff 0%,#1d6fe8 100%)",
  internship: "linear-gradient(135deg,#7c5cff 0%,#4b2fd6 100%)",
  exchange: "linear-gradient(135deg,#19c3a6 0%,#0b8f8a 100%)",
  grant: "linear-gradient(135deg,#ffb830 0%,#f0761a 100%)",
  leadership: "linear-gradient(135deg,#f45d9a 0%,#9b2fd6 100%)",
}

const BTN_DARK = "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-semibold text-background transition-all hover:bg-foreground/85 active:scale-[0.98]"
const BTN_LIGHT = "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/12 bg-background px-6 text-[15px] font-semibold text-foreground transition-all hover:bg-foreground/[0.04] active:scale-[0.98]"

export default function Landing({ onOpenCatalog, onOpenNavigator, onOpenPricing }: { onOpenCatalog: (cat?: Cat) => void; onOpenNavigator: () => void; onOpenPricing: () => void }) {
  const { t, lang } = useI18n()
  const scope = useRef<HTMLDivElement>(null)

  // Анимации главной. Всё внутри одного scope — при уходе с главной GSAP
  // сам убирает твины и ScrollTrigger'ы. При reduced-motion ничего не двигаем.
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Hero: заголовок появляется по словам, затем текст, кнопки и карточка.
      const h1 = scope.current!.querySelector("h1")!
      const split = SplitText.create(h1, { type: "words", wordsClass: "hero-word" })
      // fromTo с явным конечным состоянием: если эффект перезапустится, когда
      // элемент уже «спрятан» предыдущим from(), обычный from() запомнил бы
      // opacity 0 как цель — и кнопки остались бы невидимыми.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      const hidden = { y: 18, opacity: 0 }
      const shown = { y: 0, opacity: 1, clearProps: "opacity,transform" }
      tl.fromTo("[data-hero-badge]", hidden, { ...shown, duration: 0.5 })
        .fromTo(split.words, { y: 42, opacity: 0, rotateX: -40, transformOrigin: "50% 100%" }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.05 }, "-=0.25")
        .fromTo("[data-hero-sub]", hidden, { ...shown, duration: 0.6 }, "-=0.45")
        .fromTo("[data-hero-cta] > *", hidden, { ...shown, duration: 0.5, stagger: 0.08 }, "-=0.35")
        .fromTo("[data-hero-card]", { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, clearProps: "opacity,transform" }, "-=0.7")
        .fromTo("[data-hero-tag]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }, "-=0.4")

      // 2. Секции: всё с data-reveal всплывает при прокрутке; группы — с шагом.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "opacity,transform", scrollTrigger: { trigger: el, start: "top 88%", once: true } })
      })
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((g) => {
        gsap.fromTo(g.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.08, ease: "power3.out", clearProps: "opacity,transform", scrollTrigger: { trigger: g, start: "top 85%", once: true } })
      })

      // 3. Цифры считаются от нуля, когда доезжают до экрана.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: to, duration: 1.4, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => { el.textContent = String(Math.round(obj.v)) },
        })
      })

      return () => split.revert()
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
    // При смене языка React перепишет текст заголовка — снимаем SplitText и
    // собираем заново, иначе слова разъедутся.
  }, { scope, dependencies: [lang], revertOnUpdate: true })

  return (
    <div ref={scope}>
      {/* Hero на небесном фоне: облака нарисованы градиентами, картинок нет. */}
      <section className="sky relative -mt-[76px] overflow-hidden pt-[76px]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24">
          <div className="relative z-10">
            <div data-hero-badge className="mb-5 inline-flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-background/80 px-3.5 py-1.5 text-[12px] font-semibold text-foreground/80 shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-brand" />
              {t("b.hero2.badge")}
            </div>
            <h1 className="max-w-2xl text-[2.4rem] font-extrabold leading-[1.02] tracking-tight text-[#0f172a] sm:text-6xl sm:leading-[0.98]">
              {t("b.hero2.a")}<span className="text-brand">{t("b.hero2.b")}</span>{t("b.hero2.c")}
            </h1>
            <p data-hero-sub className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#334155] sm:text-lg">
              {t("b.hero2.sub")}
            </p>

            <div data-hero-cta className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={onOpenNavigator} data-lumi-hint="lumi.h.start" className={BTN_DARK}>
                <Sparkles className="size-4" /> {t("b.hero2.cta")}
              </button>
              <button onClick={() => onOpenCatalog()} data-lumi-hint="lumi.h.catalog" className={BTN_LIGHT}>
                {t("hdr.catalog")} · {STATS.total} <ArrowRight className="size-4" />
              </button>
            </div>
            <p data-hero-sub className="mt-4 text-[13px] font-medium text-[#475569]">{t("b.hero2.note")}</p>
          </div>

          {/* Образец отчёта — «продукт в руках», как коллаж у tilu. */}
          <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-none">
            <div data-hero-tag className="pointer-events-none absolute -left-4 -top-5 z-20 rotate-[-6deg] rounded-2xl bg-background px-3.5 py-2 text-[13px] font-semibold shadow-[0_10px_30px_rgba(15,23,42,0.12)] sm:-left-8">🎓 {t("tl.tag.uni")}</div>
            <div data-hero-tag className="pointer-events-none absolute -right-3 top-10 z-20 rotate-[5deg] rounded-2xl bg-background px-3.5 py-2 text-[13px] font-semibold shadow-[0_10px_30px_rgba(15,23,42,0.12)] sm:-right-6">📅 {t("tl.tag.deadline")}</div>
            <div data-hero-tag className="pointer-events-none absolute -bottom-4 left-8 z-20 rotate-[3deg] rounded-2xl bg-background px-3.5 py-2 text-[13px] font-semibold shadow-[0_10px_30px_rgba(15,23,42,0.12)]">✍️ {t("tl.tag.essay")}</div>
            <div data-hero-card data-lumi-hint="lumi.h.report" className="overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
              <ReportPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Полоса вузов */}
      <section className="mx-auto max-w-6xl px-6 pt-14 text-center">
        <p data-reveal className="text-[15px] font-medium text-muted-foreground">{t("tl.unis")}</p>
        <div data-reveal-group className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {UNIS.map((u) => (
            <span key={u} className="text-[15px] font-bold tracking-tight text-foreground/45 sm:text-[17px]">{u}</span>
          ))}
        </div>
      </section>

      {/* Цифры */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div data-reveal><Chip>🎯 {t("tl.chip.stats")}</Chip></div>
        <div data-reveal-group className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-4">
          <Stat n={STATS.total} suffix="+" label={t("b.stat.programs")} />
          <Stat n={STATS.free} label={t("b.stat.free")} />
          <Stat n={STATS.intl} label={t("b.stat.intl")} />
          <Stat n={STATS.cats} label={t("b.stat.dirs")} />
        </div>
      </section>

      {/* Направления — карточки с цветной плиткой, как курсы у tilu */}
      <section className="bg-[#f7f8fa] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div data-reveal className="text-center">
            <Chip>⭐️ {t("b.cat.label")}</Chip>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
              {STATS.cats} {t("b.cat.h")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground sm:text-base">{t("tl.cats.sub")}</p>
          </div>
          <div data-reveal-group className="mt-10 grid gap-5 sm:grid-cols-2">
            {CATS.map((c) => {
              const n = PROGRAMS.filter((p) => p.cat === c.key).length
              return (
                <article key={c.key} data-lumi-hint="lumi.h.cat" className="grid overflow-hidden rounded-[26px] bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.06)] sm:grid-cols-[168px_1fr]">
                  <div className="flex min-h-[120px] items-end p-5 text-background sm:min-h-full" style={{ background: TILES[c.key] }}>
                    <span className="text-4xl font-extrabold tabular-nums leading-none drop-shadow-sm">{n}</span>
                  </div>
                  <div className="flex flex-col p-5 sm:p-6">
                    <h3 className="text-[20px] font-bold leading-tight tracking-tight">{t(`cat.${c.key}`)}</h3>
                    <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">{n} {t("b.stat.programs")}</p>
                    <button onClick={() => onOpenCatalog(c.key)} className="mt-5 inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background transition-all hover:bg-foreground/85 active:scale-[0.98]">
                      {t("tl.open")} <ArrowUpRight className="size-4" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Как работает — большой центрированный текст, потом три шага */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div data-reveal className="text-center">
          <Chip>💻 {t("b.how.label")}</Chip>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{t("b.how.h")}</h2>
        </div>
        <div data-reveal-group className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={i} className="rounded-[26px] bg-[#f7f8fa] p-7">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-background shadow-sm">
                <s.icon className="size-5 text-brand" />
              </div>
              <div className="mt-5 text-[12px] font-bold text-muted-foreground">0{i + 1}</div>
              <h3 className="mt-1 text-[19px] font-bold tracking-tight">{t(`b.${s.k}.t`)}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{t(`b.${s.k}.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* В фокусе */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div data-reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Chip>🔥 {t("b.feat.label")}</Chip>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("b.feat.h")}</h2>
          </div>
          <button onClick={() => onOpenCatalog()} className={BTN_LIGHT + " h-10 px-5 text-[13px]"}>
            {t("b.feat.all")} {STATS.total} <ArrowRight className="size-4" />
          </button>
        </div>
        <div data-reveal-group className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((p) => <ProgramCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Тарифы */}
      <section className="bg-[#f7f8fa] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div data-reveal className="text-center">
            <Chip>💳 {t("pg.badge")}</Chip>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
              {t("pg.h1")} <span className="text-brand">{t("pg.h2")}</span>{t("pg.h3")}
            </h2>
          </div>
          <div data-reveal-group className="mt-10 grid gap-5 lg:grid-cols-3">
            {TARIFFS.map((tf) => {
              const trd = lang === "ru" ? undefined : TARIFF_TR[tf.id][lang]
              const hi = !!tf.highlight
              return (
                <div key={tf.id} data-lumi-hint={hi ? "lumi.h.plus" : tf.id === "free" ? "lumi.h.free" : "lumi.h.pro"} className={"relative flex flex-col rounded-[28px] p-7 " + (hi ? "bg-foreground text-background shadow-[0_24px_60px_rgba(15,23,42,0.18)]" : "bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.06)]")}>
                  {hi && (
                    <span className="absolute right-6 top-6 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-brand-foreground">{t("pr.plus.badge")}</span>
                  )}
                  <h3 className="text-[22px] font-extrabold tracking-tight">{tf.name}</h3>
                  <p className={"mt-1 text-[13px] font-medium " + (hi ? "text-background/70" : "text-muted-foreground")}>{trd?.tagline ?? tf.tagline}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tabular-nums tracking-tight">{tf.price}</span>
                    <span className={"text-sm " + (hi ? "text-background/70" : "text-muted-foreground")}>{trd?.period ?? tf.period}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {(trd?.features ?? tf.features).slice(0, 4).map((f) => (
                      <li key={f} className={"flex items-start gap-2 text-[14px] " + (hi ? "text-background/85" : "text-foreground/80")}>
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onOpenPricing} className={"mt-7 inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-[14px] font-semibold transition-all active:scale-[0.98] " + (hi ? "bg-background text-foreground hover:bg-background/90" : "bg-foreground text-background hover:bg-foreground/85")}>
                    {trd?.cta ?? tf.cta} <ArrowRight className="size-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div data-reveal className="text-center">
          <Chip>💬 {t("b.faq.label")}</Chip>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("b.faq.h")}</h2>
        </div>
        <Accordion type="single" collapsible className="mt-8 space-y-3" data-reveal-group data-lumi-hint="lumi.h.faq">
          {FAQ.map((n) => (
            <AccordionItem key={n} value={`i${n}`} className="rounded-[20px] border border-foreground/[0.08] bg-background px-5 last:border-b">
              <AccordionTrigger className="py-4 text-left text-[15.5px] font-semibold hover:no-underline">
                {t(`b.faq.q${n}`)}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[14.5px] leading-relaxed text-muted-foreground">
                {t(`b.faq.a${n}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Финальный призыв; подвал общий, в App.tsx */}
      <section data-reveal className="mx-auto max-w-6xl px-6 pb-16 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {t("b.final.a")} <span className="text-brand">{t("b.final.b")}</span>{t("b.final.c")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground sm:text-base">{t("tl.final.sub")}</p>
        <button onClick={onOpenNavigator} className={BTN_DARK + " mt-8"}>
          <Sparkles className="size-4" /> {t("b.hero2.cta")}
        </button>
      </section>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/[0.08] bg-background px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground/80 shadow-sm">
      {children}
    </span>
  )
}

function Stat({ n, suffix = "", label }: { n: number; suffix?: string; label: string }) {
  return (
    <div>
      <div className="text-[40px] font-extrabold tabular-nums leading-none tracking-tight sm:text-5xl">
        <span data-count={n}>{n}</span>{suffix}
      </div>
      <div className="mt-2 text-[14px] font-medium text-muted-foreground">{label}</div>
    </div>
  )
}
