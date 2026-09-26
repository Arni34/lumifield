import { useState } from "react"
import { Lock, Sparkles, Send, Loader2, PenLine, TriangleAlert } from "lucide-react"
import { askLumifield, ESSAY_AI_ON, disclaimerFor, type ChatMsg } from "@/lib/essay"
import { useStore, isPaid } from "@/lib/store"
import { UnlockSheet } from "@/components/unlock-sheet"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// режимы в духе collegize: расшифровка промпта → аутлайн → фидбэк на черновик
const CHIP_KEYS = ["es.c1", "es.c2", "es.c3", "es.c4"]

export default function Essay({ onOpenPricing, onOpenAccount }: { onOpenPricing: () => void; onOpenAccount: () => void }) {
  const { t, lang } = useI18n()
  const { tariff } = useStore()
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "kadam", text: t("es.greet") },
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [unlock, setUnlock] = useState(false)

  if (!isPaid(tariff)) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center border-2 border-foreground bg-card brutal">
          <Lock className="size-7 text-brand" />
        </div>
        <h1 className="mt-6 text-3xl font-black uppercase tracking-tight sm:text-4xl">
          {t("es.lockH.a")}<span className="text-brand">{t("es.lockH.b")}</span>
        </h1>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          {t("es.lockSub")}
        </p>
        <Button onClick={() => setUnlock(true)} className="brutal brutal-press mt-8 h-12 rounded-none border-2 border-foreground bg-brand px-6 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background">
          <Sparkles className="size-4" /> {t("es.seePricing")}
        </Button>
        {unlock && <UnlockSheet context="essay" onClose={() => setUnlock(false)} onOpenPricing={onOpenPricing} onNeedAccount={onOpenAccount} />}
      </section>
    )
  }

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

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 pt-10 pb-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
          <PenLine className="size-3.5 text-brand" /> {t("es.badge")}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {ESSAY_AI_ON ? t("es.aiOn") : t("es.aiOff")}
        </span>
      </div>

      {/* постоянное напоминание */}
      <div className="mb-4 flex items-start gap-2 border-2 border-foreground bg-brand/10 p-3 text-[13px] leading-relaxed">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>{t("es.warn.a")}<strong>{t("es.warn.b")}</strong>{t("es.warn.c")}</span>
      </div>

      {/* лента */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={"max-w-[85%] whitespace-pre-wrap border-2 border-foreground p-3 text-[15px] leading-relaxed " + (m.role === "user" ? "bg-foreground text-background" : "bg-card")}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 border-2 border-foreground bg-card p-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-brand" /> {t("es.think")}
            </div>
          </div>
        )}
      </div>

      {/* быстрые вопросы */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIP_KEYS.map((k) => (
          <button key={k} onClick={() => send(t(k))} disabled={busy}
            className="border border-foreground/25 px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40">
            {t(k)}
          </button>
        ))}
      </div>

      {/* ввод */}
      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={t("es.placeholder")}
          className="h-12 flex-1 rounded-none border-2 border-foreground"
        />
        <Button onClick={() => send(input)} disabled={busy || !input.trim()}
          className="brutal-sm brutal-press h-12 rounded-none border-2 border-foreground bg-brand px-5 text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-40">
          <Send className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/80">{disclaimerFor(lang)}</p>
    </section>
  )
}
