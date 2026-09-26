// Vercel serverless: Stripe Checkout для подписок Lumifield+ / Lumifield Pro.
// Работает и в ТЕСТОВОМ режиме (sk_test_…), и на живых ключах (sk_live_…) — код один.
// Секретный ключ живёт в серверной env STRIPE_SECRET_KEY, в браузер не попадает.
//
// Контракт совпадает с lib/pay.ts:
//   POST { action:"create", tariff, userId, origin }  → { url }      (редирект на оплату)
//   POST { action:"verify", sessionId }               → { ok, tariff }(после возврата)
//
// Env (задаёшь ты): STRIPE_SECRET_KEY, STRIPE_PRICE_PLUS, STRIPE_PRICE_PRO
//   (Price ID подписок из Stripe Dashboard → Products; ежемес. и раз в 6 мес.)
// Чтобы включить реальную оплату на сайте — задай VITE_PAY_ENDPOINT=/api/checkout.

const KEY = process.env.STRIPE_SECRET_KEY
const PRICE = { plus: process.env.STRIPE_PRICE_PLUS, package: process.env.STRIPE_PRICE_PRO }

async function stripe(path, method = "GET", form) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: form,
  })
  return { ok: r.ok, status: r.status, data: await r.json() }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  if (!KEY) return res.status(500).json({ error: "STRIPE_SECRET_KEY not set" })

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {})

  // ── Создать сессию оплаты ──
  if (body.action === "create") {
    const tariff = body.tariff
    const priceId = PRICE[tariff]
    if (!priceId) return res.status(400).json({ error: `price for '${tariff}' not configured` })
    const origin = body.origin || `https://${req.headers.host}`
    const userId = body.userId || ""

    const p = new URLSearchParams()
    p.set("mode", "subscription")
    p.set("line_items[0][price]", priceId)
    p.set("line_items[0][quantity]", "1")
    p.set("success_url", `${origin}/?session_id={CHECKOUT_SESSION_ID}`)
    p.set("cancel_url", `${origin}/?checkout=cancel`)
    if (userId) {
      p.set("client_reference_id", userId)
      p.set("metadata[userId]", userId)
      p.set("subscription_data[metadata][userId]", userId)
    }
    p.set("metadata[tariff]", tariff)
    p.set("subscription_data[metadata][tariff]", tariff)

    const r = await stripe("checkout/sessions", "POST", p.toString())
    if (!r.ok || !r.data?.url) return res.status(502).json({ error: r.data?.error?.message ?? `stripe ${r.status}` })
    return res.status(200).json({ url: r.data.url })
  }

  // ── Проверить сессию после возврата ──
  if (body.action === "verify") {
    if (!body.sessionId) return res.status(400).json({ error: "sessionId required" })
    const r = await stripe(`checkout/sessions/${encodeURIComponent(body.sessionId)}`)
    if (!r.ok) return res.status(502).json({ error: r.data?.error?.message ?? `stripe ${r.status}` })
    const s = r.data
    const paid = s.payment_status === "paid" || s.status === "complete"
    return res.status(200).json({ ok: paid, tariff: s.metadata?.tariff ?? null })
  }

  return res.status(400).json({ error: "unknown action" })
}
