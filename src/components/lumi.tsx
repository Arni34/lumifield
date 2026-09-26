import { useEffect, useRef, useState } from "react"

// Lumi — маскот и помощник Lumifield. Маленький тёплый огонёк (от искры в
// логотипе): круглое тело с язычком пламени, большие глаза и улыбка.
// Живёт в двух состояниях: idle (моргает, покачивается, следит за курсором)
// и thinking (смотрит вверх, губы «о» — думает над ответом).

export type LumiMood = "idle" | "thinking"

const MAX_SHIFT = 2.6 // насколько зрачки уходят за курсором, px в системе viewBox

export function LumiMascot({ size = 56, mood = "idle", className = "", follow = true }: {
  size?: number
  mood?: LumiMood
  className?: string
  follow?: boolean
}) {
  const ref = useRef<SVGSVGElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })

  // Зрачки тянутся к курсору — маскот «замечает» пользователя. Без rAF-спама:
  // одно обновление на кадр, и ничего, если движение отключено в системе.
  useEffect(() => {
    if (!follow || mood === "thinking") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    let last = { x: 0, y: 0 }
    const onMove = (e: MouseEvent) => {
      last = { x: e.clientX, y: e.clientY }
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const dx = last.x - (r.left + r.width / 2)
        const dy = last.y - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const k = Math.min(1, d / 240) * MAX_SHIFT
        setLook({ x: (dx / d) * k, y: (dy / d) * k })
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => { window.removeEventListener("mousemove", onMove); if (raf) cancelAnimationFrame(raf) }
  }, [follow, mood])

  const thinking = mood === "thinking"
  const px = thinking ? 1.6 : look.x
  const py = thinking ? -2.4 : look.y

  return (
    <svg ref={ref} viewBox="0 0 120 120" width={size} height={size} className={"lumi " + className} aria-hidden>
      <defs>
        <radialGradient id="lumi-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FFB36B" stopOpacity=".55" />
          <stop offset="100%" stopColor="#FFB36B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lumi-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB86B" />
          <stop offset="55%" stopColor="#FF6A3D" />
          <stop offset="100%" stopColor="#E03A16" />
        </linearGradient>
        <linearGradient id="lumi-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF6A3D" />
          <stop offset="100%" stopColor="#FFD06B" />
        </linearGradient>
      </defs>

      {/* сияние вокруг */}
      <circle cx="60" cy="66" r="54" fill="url(#lumi-glow)" />

      {/* язычок пламени — слегка колышется */}
      <g className="lumi-flame" style={{ transformOrigin: "60px 34px" }}>
        <path d="M60 8 C66 18 74 22 72 33 C71 39 66 42 60 42 C54 42 49 39 48 33 C46 22 54 18 60 8 Z" fill="url(#lumi-flame)" />
        <path d="M60 22 C63 27 66 29 65 34 C64 37 62 38 60 38 C58 38 56 37 55 34 C54 29 57 27 60 22 Z" fill="#FFF1C2" opacity=".9" />
      </g>

      {/* тело */}
      <g className="lumi-body">
        <circle cx="60" cy="70" r="40" fill="url(#lumi-body)" />
        <ellipse cx="46" cy="52" rx="12" ry="7" fill="#fff" opacity=".22" transform="rotate(-25 46 52)" />

        {/* щёчки */}
        <circle cx="40" cy="78" r="5" fill="#FF8FA3" opacity=".55" />
        <circle cx="80" cy="78" r="5" fill="#FF8FA3" opacity=".55" />

        {/* глаза: белки + зрачки, группа моргает по scaleY */}
        <g className="lumi-eyes" style={{ transformOrigin: "60px 66px" }}>
          <ellipse cx="47" cy="66" rx="8.5" ry="9.5" fill="#fff" />
          <ellipse cx="73" cy="66" rx="8.5" ry="9.5" fill="#fff" />
          <g style={{ transform: `translate(${px}px, ${py}px)`, transition: "transform .18s ease-out" }}>
            <circle cx="47" cy="67" r="4.4" fill="#1a1a1a" />
            <circle cx="73" cy="67" r="4.4" fill="#1a1a1a" />
            <circle cx="48.6" cy="65.2" r="1.5" fill="#fff" />
            <circle cx="74.6" cy="65.2" r="1.5" fill="#fff" />
          </g>
        </g>

        {/* рот: улыбка или «о», когда думает */}
        {thinking ? (
          <ellipse cx="60" cy="86" rx="4" ry="4.6" fill="#7A1F0B" />
        ) : (
          <path d="M50 83 Q60 93 70 83" stroke="#7A1F0B" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        )}
      </g>
    </svg>
  )
}
