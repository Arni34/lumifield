import { useState } from "react"
import { Check, Sparkles, ArrowRight, Lock, Ticket, UserPlus, Send, Copy } from "lucide-react"
import { TARIFFS, type Tariff } from "@/data/tariffs"
import { TARIFF_TR } from "@/data/tariffs.i18n"
import { redeemPromo } from "@/lib/promo"
import { useStore, setTariff, type TariffId } from "@/lib/store"
import { PAY_ON, startCheckout } from "@/lib/pay"
import { PAY_MODE, TG_CONTACT, KASPI_NUMBER, priceKzt, tgLink } from "@/lib/payment"
import { AUTH_ON, useSession } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { TrialButton } from "@/components/trial-button"
import { Input } from "@/components/ui/input"

export default function Pricing({ onDone, onNeedAccount }: { onDone?: () => void; onNeedAccount?: () => void }) {
  const { t: tt, lang } = useI18n()
  const { tariff } = useStore()
  const session = useSession()
  const noAccount = AUTH_ON && !session // бэкенд включён, но пользователь не вошёл
  const [checkout, setCheckout] = useState<Tariff | null>(null)
  const [done, setDone] = useState<TariffId | null>(null)
  const [payErr, setPayErr] = useState<string | null>(null)
  const [needAcc, setNeedAcc] = useState(false)
  const [promo, setPromo] = useState("")
  const [promoMsg, setPromoMsg] = useState<string | null>(null)
  const [promoOk, setPromoOk] = useState(false)
  const [promoBusy, setPromoBusy] = useState(false)

  async function choose(t: Tariff) {
    if (t.id === "free") { setTariff("free"); setDone("free"); return }
    // Без аккаунта подписка не сохранится — сразу предлагаем создать его.
    if (noAccount) { setNeedAcc(true); return }
    setPayErr(null)
    // Шлюз — только когда он действительно включён. Иначе (и при любой его ошибке)
    // показываем ручную оплату: иначе кнопка «Купить» вела бы в тупик с ошибкой.
    if (PAY_MODE === "gateway" && PAY_ON) {
      const r = await startCheckout(t.id, session?.user?.id ?? null) // редирект на оплату
      if (r.ok) return
    }
    setCheckout(t) // ручная оплата: перевод + промокод
  }

  async function applyPromo() {
    setPromoMsg(null)
    if (!promo.trim() || promoBusy) return
    // Сначала аккаунт — чтобы одноразовый код не «сгорел» у гостя.
    if (noAccount) { setNeedAcc(true); return }
    setPromoBusy(true)
    const res = await redeemPromo(promo, session?.user?.id ?? null)
    setPromoBusy(false)
    if (res.status === "ok") {
      setTariff(res.tariff, res.until); setDone(res.tariff); setPromo(""); setPromoOk(true)
      const untilNote = res.until ? ` · ${new Date(res.until).toLocaleDateString(lang === "en" ? "en-US" : lang === "kz" ? "kk-KZ" : "ru-RU")}` : ""
      setPromoMsg(tt("pg.promo.ok") + untilNote)
      return
    }
    setPromoOk(false)
    setPromoMsg(res.status === "used" ? tt("pg.promo.used") : res.status === "unavailable" ? tt("pg.promo.unavailable") : tt("pg.promo.bad"))
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-20">
      <div className="mb-6 inline-flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
        <Sparkles className="size-3.5 text-brand" /> {tt("pg.badge")}
      </div>
      <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
        {tt("pg.h1")}<br /><span className="text-brand">{tt("pg.h2")}</span>{tt("pg.h3")}
      </h1>
      <p className="mt-5 max-w-xl text-muted-foreground sm:text-lg">
        {tt("pg.sub")}
      </p>

      {/* Пока оплата ручная, пробный период — главный быстрый путь. */}
      <div className="mt-8 border-2 border-foreground bg-card p-5 brutal sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand">{tt("tr.pg.badge")}</p>
        <h2 className="mt-2 text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">{tt("tr.pg.t")}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/85">{tt("tr.pg.d")}</p>
        <div className="mt-4">
          <TrialButton onNeedAccount={() => setNeedAcc(true)} onStarted={() => setDone("plus")} />
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {TARIFFS.map((t) => {
          const current = tariff === t.id
          const trd = lang === "ru" ? undefined : TARIFF_TR[t.id][lang]
          return (
            <div
              key={t.id}
              className={
                "relative flex flex-col border-2 border-foreground bg-card p-6 " +
                (t.highlight ? "brutal" : "")
              }
            >
              {t.highlight && (
                <span className="absolute -top-3 left-6 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
                  {tt("pr.plus.badge")}
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight">{t.name}</h2>
                {current && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand">
                    <Check className="size-3.5" /> {tt("pg.active")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{trd?.tagline ?? t.tagline}</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground">{trd?.period ?? t.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {(trd?.features ?? t.features).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => choose(t)}
                disabled={current}
                className="brutal-sm brutal-press mt-6 h-12 rounded-none border-2 border-foreground bg-brand text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
              >
                {current ? tt("pg.current") : (trd?.cta ?? t.cta)} {!current && <ArrowRight className="size-4" />}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Промокод */}
      <div className="mt-8 flex flex-col gap-3 border-2 border-foreground bg-card p-5 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-brand">
          <Ticket className="size-4" /> {tt("pg.promo.title")}
        </span>
        <Input
          value={promo}
          onChange={(e) => { setPromo(e.target.value); setPromoMsg(null); setPromoOk(false) }}
          onKeyDown={(e) => e.key === "Enter" && promo.trim() && applyPromo()}
          placeholder={tt("pg.promo.ph")}
          className="h-11 flex-1 rounded-none border-2 border-foreground uppercase"
        />
        <Button
          onClick={applyPromo}
          disabled={!promo.trim() || promoBusy}
          className="brutal-sm brutal-press h-11 rounded-none border-2 border-foreground bg-foreground px-5 text-[12px] font-bold uppercase tracking-wider text-background hover:bg-brand hover:text-brand-foreground disabled:opacity-40"
        >
          {promoBusy ? tt("pg.promo.checking") : tt("pg.promo.apply")}
        </Button>
      </div>
      {promoMsg && <p className={"mt-2 text-sm font-semibold " + (promoOk ? "text-brand" : "text-muted-foreground")}>{promoMsg}</p>}

      {payErr && <p className="mt-4 text-sm font-semibold text-brand">{payErr}</p>}

      {/* Нужен аккаунт (покупка/промокод без входа) */}
      {needAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setNeedAcc(false)}>
          <div className="w-full max-w-md border-2 border-foreground bg-background p-6 brutal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <UserPlus className="size-3.5 text-brand" /> {tt("pg.needAcc.t")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{tt("pg.needAcc.d")}</p>
            <div className="mt-5 flex gap-3">
              <Button
                onClick={() => { setNeedAcc(false); onNeedAccount?.() }}
                className="brutal-sm brutal-press h-11 flex-1 rounded-none border-2 border-foreground bg-brand text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"
              >
                <UserPlus className="size-4" /> {tt("pg.needAcc.create")}
              </Button>
              <Button onClick={() => setNeedAcc(false)} variant="outline" className="h-11 rounded-none border-2 border-foreground px-5 text-[12px] font-bold uppercase tracking-wider">
                {tt("pg.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ручная оплата: перевод + промокод. Работает до подключения шлюза. */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setCheckout(null)}>
          <div className="w-full max-w-md border-2 border-foreground bg-background p-6 brutal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <Lock className="size-3.5" /> {tt("pg.checkout")} · {checkout.name}
            </div>
            <p className="mt-3 flex flex-wrap items-baseline gap-2 text-2xl font-black tabular-nums tracking-tight">
              {priceKzt(checkout.id) ?? checkout.price}
              <span className="text-base font-bold text-muted-foreground">
                {(lang === "ru" ? undefined : TARIFF_TR[checkout.id][lang])?.period ?? checkout.period}
              </span>
              {priceKzt(checkout.id) && <span className="text-[13px] font-semibold text-muted-foreground">· {checkout.price}</span>}
            </p>

            <ol className="mt-4 grid gap-2 text-sm">
              {[tt("pg.man.s1"), tt("pg.man.s2"), tt("pg.man.s3")].map((step, i) => (
                <li key={i} className="grid grid-cols-[22px_1fr] gap-2">
                  <span className="font-black text-brand">{i + 1}</span>
                  <span className="text-foreground/85">{step}</span>
                </li>
              ))}
            </ol>

            {KASPI_NUMBER && (
              <div className="mt-4 flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Kaspi</span>
                <span className="font-black tabular-nums">{KASPI_NUMBER}</span>
                <button onClick={() => navigator.clipboard?.writeText(KASPI_NUMBER)} className="ml-auto text-muted-foreground hover:text-brand" aria-label="Copy">
                  <Copy className="size-4" />
                </button>
              </div>
            )}

            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{tt("pg.man.note")}</p>

            <div className="mt-5 flex gap-3">
              {TG_CONTACT ? (
                <a
                  href={tgLink(`${tt("pg.man.tgText")} ${checkout.name}`)}
                  target="_blank" rel="noopener noreferrer"
                  className="brutal-sm brutal-press inline-flex h-11 flex-1 items-center justify-center gap-2 border-2 border-foreground bg-brand text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"
                >
                  <Send className="size-4" /> {tt("pg.man.write")}
                </a>
              ) : (
                <span className="flex-1 border-2 border-dashed border-foreground/30 p-3 text-[12px] text-muted-foreground">{tt("pg.man.soon")}</span>
              )}
              <Button onClick={() => setCheckout(null)} variant="outline" className="h-11 rounded-none border-2 border-foreground px-5 text-[12px] font-bold uppercase tracking-wider">
                {tt("pg.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Успех */}
      {done && (
        <div className="mt-8 flex flex-col items-start gap-3 border-2 border-foreground bg-brand/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold uppercase tracking-wide">
            {done === "free" ? tt("pg.backFree") : tt("pg.activated")}
          </p>
          {done !== "free" && onDone && (
            <Button
              onClick={onDone}
              className="brutal-sm brutal-press h-11 rounded-none border-2 border-foreground bg-foreground px-6 text-[12px] font-bold uppercase tracking-wider text-background hover:bg-brand hover:text-brand-foreground"
            >
              {tt("pg.toPlan")} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
