import { useEffect, useRef, useState } from "react"
import { X, ArrowUp } from "lucide-react"
import { askLumifield, disclaimerFor, type ChatMsg } from "@/lib/essay"
import { useI18n } from "@/lib/i18n"
import { LumiMascot } from "@/components/lumi"
import { LumiCompanion } from "@/components/lumi-companion"
import { gsap, useGSAP } from "@/lib/gsap"

// Lumi — плавающий помощник (правый нижний угол): маскот, который отвечает
// про эссе, поступление и сам сервис. Открыть программно из любого экрана:
// openLumifieldAI().
const OPEN_EVENT = "lumifield-ai:open"
export const openLumifieldAI = () => window.dispatchEvent(new Event(OPEN_EVENT))

// Приветственный пузырь показываем один раз за сессию, через несколько секунд
// после загрузки — как будто Lumi заметил гостя, а не кричит с порога.
const HELLO_KEY = "lumi.hello.shown"

// Модель любит **жирный** в маркдауне; звёздочки в чате выглядят мусором,
// поэтому превращаем их в настоящий жирный. Больше ничего не разбираем.
function rich(text: string) {
  const parts = text.split("**")
  return parts.map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : p))
}

export function LumifieldAI() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [hello, setHello] = useState(false)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLSpanElement>(null) // маскот в кнопке — дом спутника

  // Кнопка выпрыгивает при первой загрузке, окно чата — раскрывается из угла.
  useGSAP(() => {
    const el = rootRef.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (open) {
      gsap.fromTo(el, { scale: 0.85, y: 24, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.6)", transformOrigin: "100% 100%", clearProps: "opacity,transform" })
    } else {
      gsap.fromTo(el.querySelector(".lumi-fab"), { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, delay: 0.6, ease: "back.out(2.2)", transformOrigin: "50% 50%", clearProps: "transform" })
    }
  }, { dependencies: [open] })

  useEffect(() => {
    const h = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, h)
    return () => window.removeEventListener(OPEN_EVENT, h)
  }, [])

  useEffect(() => {
    let shown = false
    try { shown = sessionStorage.getItem(HELLO_KEY) === "1" } catch { /* приватный режим — просто покажем */ }
    if (shown) return
    const show = setTimeout(() => {
      setHello(true)
      try { sessionStorage.setItem(HELLO_KEY, "1") } catch { /* ок */ }
    }, 5000)
    const hide = setTimeout(() => setHello(false), 14000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  // приветствие — на текущем языке, один раз при первом открытии
  useEffect(() => {
    if (open) {
      setHello(false)
      if (msgs.length === 0) setMsgs([{ role: "kadam", text: t("la.greet") }])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" })
  }, [msgs, busy])

  // Esc закрывает чат — ожидаемо для любого всплывающего окна.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    setInput("")
    setMsgs((m) => [...m, { role: "user", text: q }])
    setBusy(true)
    const { text: answer } = await askLumifield(q, lang)
    setMsgs((m) => [...m, { role: "kadam", text: answer }])
    setBusy(false)
  }

  const quick = [t("lumi.q1"), t("lumi.q2"), t("lumi.q3")]

  if (!open) {
    return (
      <>
      <LumiCompanion homeRef={homeRef} active={!open} />
      <div ref={rootRef} className="fixed bottom-20 right-4 z-[65] flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
        {hello && (
          <button
            onClick={() => setOpen(true)}
            className="lumi-pop relative max-w-[240px] rounded-[20px] rounded-br-md bg-background px-4 py-3 text-left text-[13.5px] font-medium leading-snug text-foreground shadow-[0_2px_4px_rgba(15,23,42,0.05),0_14px_36px_rgba(15,23,42,0.14)]"
          >
            {t("lumi.hello")}
            <span
              onClick={(e) => { e.stopPropagation(); setHello(false) }}
              role="button"
              aria-label={t("lumi.close")}
              className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow-md hover:text-foreground"
            >
              <X className="size-3" />
            </span>
          </button>
        )}
        <button
          onClick={() => setOpen(true)}
          aria-label="Lumi"
          className="lumi-fab group flex h-16 items-center gap-1 rounded-full bg-background py-1 pl-1.5 pr-5 shadow-[0_2px_4px_rgba(15,23,42,0.05),0_14px_36px_rgba(15,23,42,0.16)] transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
        >
          <span ref={homeRef} className="lumi-float lumi-home block">
            <LumiMascot size={54} />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[16px] font-extrabold tracking-tight">Lumi</span>
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">{t("lumi.role")}</span>
          </span>
        </button>
      </div>
      </>
    )
  }

  return (
    <div ref={rootRef} className="fixed bottom-20 right-4 z-[65] flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] bg-background shadow-[0_2px_4px_rgba(15,23,42,0.05),0_24px_64px_rgba(15,23,42,0.22)] sm:bottom-5 sm:right-5">
      {/* шапка: маскот, имя, статус */}
      <div className="flex items-center gap-3 bg-[linear-gradient(135deg,#fff4ec_0%,#ffe9dc_100%)] px-4 py-3 dark:bg-[linear-gradient(135deg,#2a1a14_0%,#33201a_100%)]">
        <div className="lumi-float">
          <LumiMascot size={46} mood={busy ? "thinking" : "idle"} />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-[16px] font-extrabold tracking-tight">Lumi</div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" /> {busy ? t("es.think") : t("lumi.role")}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label={t("lumi.close")}
          className="ml-auto flex size-9 items-center justify-center rounded-full bg-background/70 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* лента сообщений */}
      <div ref={bodyRef} className="flex h-[22rem] flex-col gap-3 overflow-y-auto px-3.5 py-4">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2"}>
            {m.role !== "user" && (
              <span className="mb-0.5 shrink-0"><LumiMascot size={26} follow={false} /></span>
            )}
            <div
              className={
                "max-w-[84%] whitespace-pre-wrap px-3.5 py-2.5 text-[13.5px] leading-relaxed " +
                (m.role === "user"
                  ? "rounded-[18px] rounded-br-md bg-foreground text-background"
                  : "rounded-[18px] rounded-bl-md bg-[#f4f4f6] text-foreground dark:bg-white/[0.07]")
              }
            >
              {rich(m.text)}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-end gap-2">
            <span className="mb-0.5 shrink-0"><LumiMascot size={26} mood="thinking" follow={false} /></span>
            <div className="flex items-center gap-1 rounded-[18px] rounded-bl-md bg-[#f4f4f6] px-4 py-3.5 dark:bg-white/[0.07]">
              <span className="lumi-dot size-1.5 rounded-full bg-foreground/50" />
              <span className="lumi-dot size-1.5 rounded-full bg-foreground/50" style={{ animationDelay: ".15s" }} />
              <span className="lumi-dot size-1.5 rounded-full bg-foreground/50" style={{ animationDelay: ".3s" }} />
            </div>
          </div>
        )}

        {/* быстрые вопросы — пока разговор не начался */}
        {msgs.length <= 1 && !busy && (
          <div className="mt-1 flex flex-wrap gap-2 pl-8">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => void send(q)}
                className="rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-[12.5px] font-semibold text-foreground/80 transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ввод */}
      <form
        onSubmit={(e) => { e.preventDefault(); void send(input) }}
        className="flex items-center gap-2 border-t border-foreground/[0.06] p-2.5"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("la.ph")}
          className="h-11 flex-1 rounded-full bg-[#f4f4f6] px-4 text-[13.5px] outline-none transition-shadow placeholder:text-muted-foreground focus:shadow-[0_0_0_2px_var(--brand)] dark:bg-white/[0.07]"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label={t("lumi.send")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-35"
        >
          <ArrowUp className="size-4.5" />
        </button>
      </form>
      <p className="px-4 pb-2.5 text-center text-[11px] leading-snug text-muted-foreground/80">{disclaimerFor(lang)}</p>
    </div>
  )
}
