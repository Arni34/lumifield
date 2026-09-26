import { useEffect, useRef, useState } from "react"
import { Sun, Moon, ArrowLeft, Plus, User } from "lucide-react"
import { type Cat } from "@/data/programs"
import { type AnalyzeResult } from "@/lib/profori"
import { useStore, hydrate, saveResult, enforceTariffExpiry } from "@/lib/store"
import { initSync } from "@/lib/sync"
import { onAuth } from "@/lib/auth"
import { verifyReturn } from "@/lib/pay"
import { useI18n } from "@/lib/i18n"
import { LogoMark } from "@/components/logo"
import { LangSwitch } from "@/components/lang-switch"
import { Button } from "@/components/ui/button"
import Catalog from "@/Catalog"
import Pricing from "@/Pricing"
import Submit from "@/Submit"
import Admin from "@/Admin"
import Plan from "@/Plan"
import Assess from "@/Assess"
import Essay from "@/Essay"
import Account from "@/Account"
import YouPath from "@/YouPath"
import Landing from "@/Landing"
import Legal from "@/Legal"
import { TrialStrip } from "@/components/trial-strip"
import { PlusDialog, type PlusDialogMode } from "@/components/plus-dialog"
import { isEndingSoon, daysLeft } from "@/lib/billing"
import { CookieConsent } from "@/components/cookie-consent"
import { LumifieldAI } from "@/components/lumifield-ai"
import { NavBar, NavLinks, type NavKey } from "@/components/nav-bar"
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap"

function useTheme() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  return { dark, toggle: () => setDark((d) => !d) }
}

type View =
  | { name: "home" } | { name: "catalog"; cat: "all" | Cat }
  | { name: "pricing" } | { name: "submit" } | { name: "plan" } | { name: "admin" }
  | { name: "assess" } | { name: "essay" } | { name: "account" } | { name: "youpath" }
  | { name: "offer" } | { name: "privacy" }

export default function App() {
  const { dark, toggle } = useTheme()
  const { t } = useI18n()
  const [view, setView] = useState<View>({ name: "home" })
  // Гейт профориентации: ушли регистрироваться из анкеты — после входа
  // возвращаемся в YouPath и досчитываем отчёт по сохранённому черновику.
  const [resumeGuidance, setResumeGuidance] = useState(false)
  const awaitingAuth = useRef(false)
  const { savedResult, tariffUntil, expiryNotice } = useStore() // результат профориентации хранится в сторе (persist)
  const [plusDlg, setPlusDlg] = useState<PlusDialogMode | null>(null)

  const openCatalog = (cat: "all" | Cat = "all") => setView({ name: "catalog", cat })
  const openNavigator = () => setView({ name: "youpath" }) // единственный поток профориентации — YouPath (20 вопросов)
  const gateToAccount = () => { awaitingAuth.current = true; setView({ name: "account" }) }
  const openPricing = () => setView({ name: "pricing" })
  const openPlan = (r?: AnalyzeResult) => { if (r) saveResult(r); setView({ name: "plan" }) }
  const openAssess = () => setView({ name: "assess" })
  const openEssay = () => setView({ name: "essay" })
  const openAccount = () => setView({ name: "account" })
  const goHome = () => setView({ name: "home" })
  // Навигация: одна точка входа для панели снизу и ссылок в шапке.
  const goNav = (k: NavKey) => {
    if (k === "catalog") return openCatalog()
    if (k === "youpath") return openNavigator()
    if (k === "plan") return openPlan()
    if (k === "account") return openAccount()
    return goHome()
  }
  const navCurrent: NavKey | null =
    (["home", "catalog", "youpath", "plan", "account"] as const).includes(view.name as NavKey)
      ? (view.name as NavKey) : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  useEffect(() => onAuth((s) => {
    if (!s || !awaitingAuth.current) return
    awaitingAuth.current = false
    setResumeGuidance(true)
    setView({ name: "youpath" })
  }), [])

  // Молча не понижаем: истёк тариф — объясняем, что закрылось (разово).
  // Предупреждение «осталось ≤2 дней» — один раз за сессию вкладки, без навязчивости.
  useEffect(() => {
    if (expiryNotice) { setPlusDlg("ended"); return }
    if (!isEndingSoon(tariffUntil)) return
    try {
      if (sessionStorage.getItem("lumifield.trialWarn")) return
      sessionStorage.setItem("lumifield.trialWarn", "1")
    } catch { /* приватный режим — просто покажем */ }
    setPlusDlg("ending")
  }, [expiryNotice, tariffUntil])

  useEffect(() => { enforceTariffExpiry(); hydrate(); initSync(); verifyReturn() }, []) // истёкший тариф → Free; Supabase + синхронизация + возврат с оплаты

  // Шапка: прозрачная у верха страницы, «таблетка» после первых 24px прокрутки.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Смена экрана: новый контент мягко всплывает снизу. Один твин на переход,
  // без задержки — навигация должна ощущаться мгновенной.
  const pageRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (!pageRef.current) return
    gsap.fromTo(pageRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "transform" })
    ScrollTrigger.refresh()
  }, { dependencies: [view.name] })

  // Скрытая админка: только по прямой ссылке <домен>/#admin (не из интерфейса).
  useEffect(() => {
    if (window.location.hash === "#admin") setView({ name: "admin" })
  }, [])


  return (
    <div className="min-h-screen bg-background text-foreground pb-16 sm:pb-0">
      {/* Плавающая «таблетка»-шапка: белая карточка со скруглением и тенью,
          отступ сверху — как у tilu.kz. Прилипает при прокрутке. */}
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        {/* Как у tilu.kz: сверху шапка прозрачная и во всю ширину, при прокрутке
            за 0.4 с сжимается в белую «таблетку» с тенью. Ширину, фон и тень
            ведёт CSS-переход; класс переключает scrolled-состояние. */}
        <div
          className={
            "mx-auto flex h-14 items-center justify-between gap-2 rounded-full border pl-4 pr-2 transition-[max-width,background-color,box-shadow,border-color,backdrop-filter] duration-[400ms] ease-[cubic-bezier(.2,.8,.2,1)] sm:h-16 sm:pl-6 sm:pr-3 " +
            (scrolled
              ? "max-w-[880px] border-foreground/[0.06] bg-background/92 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md"
              : "max-w-6xl border-transparent bg-transparent shadow-none")
          }
        >
          <button onClick={goHome} className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:gap-2.5" aria-label={t("hdr.home")}>
            <LogoMark className="size-7" />
            <span className="hidden text-[19px] font-extrabold tracking-tight sm:inline">Lumifield</span>
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLinks current={navCurrent} go={goNav} />
            <LangSwitch />
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Theme" className="rounded-full">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {view.name !== "home" ? (
              <Button onClick={goHome} className="h-10 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background hover:bg-foreground/85">
                <ArrowLeft className="size-4" /> {t("hdr.home")}
              </Button>
            ) : (
              <Button onClick={openAccount} className="h-10 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background hover:bg-foreground/85">
                <User className="size-4" /> <span className="hidden sm:inline">{t("hdr.account")}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <TrialStrip onOpenDetails={() => setPlusDlg("ending")} />

      <div ref={pageRef} key={view.name}>
      {view.name === "home" && <Landing onOpenCatalog={openCatalog} onOpenNavigator={openNavigator} onOpenPricing={openPricing} />}
      {view.name === "catalog" && <Catalog initialCat={view.cat} />}
      {view.name === "pricing" && <Pricing onDone={() => openPlan()} onNeedAccount={openAccount} />}
      {view.name === "submit" && <Submit onOpenCatalog={() => openCatalog()} />}
      {view.name === "admin" && <Admin />}
      {view.name === "plan" && <Plan result={savedResult} onOpenPricing={openPricing} onOpenNavigator={openNavigator} onOpenAccount={openAccount} />}
      {view.name === "assess" && <Assess result={savedResult} onOpenPricing={openPricing} onBack={openAccount} onOpenAccount={openAccount} />}
      {view.name === "essay" && <Essay onOpenPricing={openPricing} onOpenAccount={openAccount} />}
      {view.name === "account" && <Account result={savedResult} onOpenPricing={openPricing} onOpenNavigator={openNavigator} onOpenAssess={openAssess} onOpenEssay={openEssay} onOpenPlan={() => openPlan()} />}
      {view.name === "youpath" && (
        <YouPath
          onOpenAccount={openAccount}
          onOpenPricing={openPricing}
          onOpenPlan={() => openPlan()}
          onNeedAccount={gateToAccount}
          resume={resumeGuidance}
          onResumed={() => setResumeGuidance(false)}
        />
      )}
      {view.name === "offer" && <Legal doc="offer" />}
      {view.name === "privacy" && <Legal doc="privacy" />}
      </div>

      {/* Тёмный подвал со скруглённым верхом — как у tilu.kz. Общий для всех экранов:
          здесь живут оферта и политика, поэтому у главной своего подвала нет. */}
      <footer className="mt-10 rounded-t-[36px] bg-[#0f172a] text-background/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-7 shrink-0" />
              <span className="text-[20px] font-extrabold tracking-tight text-background">Lumifield AI</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed">{t("b.footer.note")}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-4">
            <Button
              onClick={() => setView({ name: "submit" })}
              className="h-10 rounded-full bg-background px-4 text-[13px] font-semibold text-foreground hover:bg-background/90"
            >
              <Plus className="size-4" /> {t("hdr.addEvent")}
            </Button>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13.5px] font-medium">
              <button onClick={openPricing} className="hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{t("nav.pricing")}</button>
              <button onClick={() => setView({ name: "offer" })} className="hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{t("legal.offer")}</button>
              <button onClick={() => setView({ name: "privacy" })} className="hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{t("legal.privacy")}</button>
            </div>
            <div className="text-[12px]">© 2026 Lumifield AI</div>
          </div>
        </div>
      </footer>

      {plusDlg && (
        <PlusDialog
          mode={plusDlg}
          days={daysLeft(tariffUntil)}
          onClose={() => setPlusDlg(null)}
          onOpenPricing={openPricing}
        />
      )}

      <CookieConsent onOpenPrivacy={() => setView({ name: "privacy" })} />
      {view.name !== "admin" && <LumifieldAI />}
      {view.name !== "admin" && <NavBar current={navCurrent} go={goNav} />}
    </div>
  )
}
