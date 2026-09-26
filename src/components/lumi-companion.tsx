import { useEffect, useRef, useState } from "react"
import { LumiMascot } from "@/components/lumi"
import { gsap } from "@/lib/gsap"
import { useI18n } from "@/lib/i18n"

// Lumi-спутник: на десктопе маскот выходит из своей кнопки и ходит за курсором
// с небольшим отставанием, а над элементами с data-lumi-hint="<ключ i18n>"
// показывает короткую подсказку. Когда курсор замирает, возвращается домой.
//
// Ничего не перехватывает: у спутника и пузыря pointer-events: none, кликать
// сквозь него можно как обычно. На тач-экранах и при reduced-motion не включается.

const IDLE_MS = 2600            // сколько стоять без движения, прежде чем уйти домой
const OFFSET = { x: 22, y: 26 } // куда вставать относительно курсора
const SIZE = 44

export function LumiCompanion({ homeRef, active }: {
  homeRef: React.RefObject<HTMLElement | null> // маскот в кнопке — «дом»
  active: boolean                               // false, пока открыт чат
}) {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const [out, setOut] = useState(false)   // спутник вышел из кнопки
  const [hint, setHint] = useState<string | null>(null)
  const [flip, setFlip] = useState(false) // пузырь слева или справа от маскота

  useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return

    const toX = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" })
    const toY = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" })
    let idle: number | undefined
    let isOut = false
    let lastHint: string | null = null

    const home = () => {
      const h = homeRef.current?.getBoundingClientRect()
      return h
        ? { x: h.left + h.width / 2 - SIZE / 2, y: h.top + h.height / 2 - SIZE / 2 }
        : { x: innerWidth - 80, y: innerHeight - 80 }
    }

    const goHome = () => {
      if (!isOut) return
      isOut = false
      const p = home()
      gsap.killTweensOf(el)
      gsap.to(el, {
        x: p.x, y: p.y, duration: 0.7, ease: "power3.inOut",
        onComplete: () => { setOut(false); homeRef.current?.classList.remove("lumi-away") },
      })
      setHint(null); lastHint = null
    }

    const leave = () => {
      isOut = true
      const p = home()
      gsap.set(el, { x: p.x, y: p.y })
      setOut(true)
      homeRef.current?.classList.add("lumi-away")
    }

    const onMove = (e: MouseEvent) => {
      if (!isOut) leave()
      const x = Math.min(innerWidth - SIZE - 8, e.clientX + OFFSET.x)
      const y = Math.min(innerHeight - SIZE - 8, e.clientY + OFFSET.y)
      toX(x); toY(y)
      setFlip(x > innerWidth * 0.6)

      // Подсказка — только у элементов, которые её попросили.
      const target = (e.target as Element | null)?.closest?.("[data-lumi-hint]") as HTMLElement | null
      const key = target?.dataset.lumiHint ?? null
      if (key !== lastHint) { lastHint = key; setHint(key) }

      window.clearTimeout(idle)
      idle = window.setTimeout(goHome, IDLE_MS)
    }

    const onLeaveWindow = () => { window.clearTimeout(idle); goHome() }

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeaveWindow)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeaveWindow)
      window.clearTimeout(idle)
      gsap.killTweensOf(el)
      homeRef.current?.classList.remove("lumi-away")
    }
  }, [active, homeRef])

  if (!active) return null

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[64] transition-opacity duration-300"
      style={{ width: SIZE, height: SIZE, opacity: out ? 1 : 0 }}
    >
      <div className="lumi-float">
        <LumiMascot size={SIZE} follow={false} />
      </div>
      {hint && (
        <div
          className={
            // Пузырь сбоку от маскота, а не над ним: над ним он закрывал бы
            // ту самую кнопку, на которую человек навёл курсор.
            "lumi-pop absolute top-1/2 w-max max-w-[220px] -translate-y-1/2 rounded-2xl bg-background px-3.5 py-2 text-[12.5px] font-medium leading-snug text-foreground shadow-[0_2px_4px_rgba(15,23,42,0.05),0_12px_30px_rgba(15,23,42,0.14)] " +
            (flip ? "right-[calc(100%+8px)] rounded-r-md" : "left-[calc(100%+8px)] rounded-l-md")
          }
        >
          {t(hint)}
        </div>
      )}
    </div>
  )
}
