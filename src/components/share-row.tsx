import { useState } from "react"
import { Share2, Send, Copy, Check, MessageCircle, Camera, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { buildStoryCard } from "@/lib/story-card"

// Поделиться результатом. Ничего не отслеживаем: голая ссылка без меток и
// идентификаторов — ни utm, ни реферальных кодов. Каналы — те, которыми
// эта аудитория реально пользуется (WhatsApp и Telegram).
const URL = "https://lumifield.app"
const URL_API = window.URL

export function ShareRow({ direction }: { direction?: string } = {}) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [igBusy, setIgBusy] = useState(false)
  const [igDone, setIgDone] = useState(false)
  const text = t("sh.text")
  const full = `${text} ${URL}`

  const native = typeof navigator !== "undefined" && typeof navigator.share === "function"

  async function shareNative() {
    try { await navigator.share({ text, url: URL }) } catch { /* пользователь отменил */ }
  }

  // Instagram не принимает текст по ссылке — отдаём картинку для сторис:
  // на телефоне через системный «Поделиться», на десктопе просто скачиваем.
  async function shareStory() {
    if (igBusy) return
    setIgBusy(true)
    const blob = await buildStoryCard({ heading: t("sh.card.h"), direction, tagline: t("sh.card.sub") })
    setIgBusy(false)
    if (!blob) return
    const file = new File([blob], "lumifield-story.png", { type: "image/png" })
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    if (nav.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text }) ; return } catch { /* отменил — скачаем */ }
    }
    const url = URL_API.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "lumifield-story.png"; a.click()
    URL_API.revokeObjectURL(url)
    setIgDone(true); setTimeout(() => setIgDone(false), 2500)
  }

  return (
    <div className="mt-8 border-2 border-foreground bg-card p-5">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <Share2 className="size-3.5 text-brand" /> {t("sh.title")}
      </p>
      <p className="mt-2 text-[15px] leading-snug text-foreground/85">“{text}”</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {native && (
          <button
            onClick={shareNative}
            className="brutal-sm brutal-press inline-flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-brand px-5 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"
          >
            <Share2 className="size-4" /> {t("sh.share")}
          </button>
        )}
        <button
          onClick={shareStory}
          disabled={igBusy}
          className="brutal-press inline-flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-card px-5 text-[12px] font-bold uppercase tracking-wider hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {igBusy ? <Loader2 className="size-4 animate-spin" /> : igDone ? <Check className="size-4" /> : <Camera className="size-4" />}
          {igDone ? t("sh.saved") : "Instagram"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(full)}`}
          target="_blank" rel="noopener noreferrer"
          className="brutal-press inline-flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-card px-5 text-[12px] font-bold uppercase tracking-wider hover:bg-foreground hover:text-background"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(URL)}&text=${encodeURIComponent(text)}`}
          target="_blank" rel="noopener noreferrer"
          className="brutal-press inline-flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-card px-5 text-[12px] font-bold uppercase tracking-wider hover:bg-foreground hover:text-background"
        >
          <Send className="size-4" /> Telegram
        </a>
        <button
          onClick={() => { navigator.clipboard?.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="brutal-press inline-flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-card px-5 text-[12px] font-bold uppercase tracking-wider hover:bg-foreground hover:text-background"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? t("sh.copied") : t("sh.copy")}
        </button>
      </div>
    </div>
  )
}
