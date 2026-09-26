// Vercel serverless: вебхук Stripe — надёжная активация подписки.
// Stripe шлёт события сюда; мы проверяем подпись и меняем тариф пользователя
// в Supabase через защищённую функцию set_user_tariff (см. stripe_setup.sql).
//
// Env: STRIPE_WEBHOOK_SECRET (из Stripe Dashboard → Developers → Webhooks),
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (уже в проекте).
// Endpoint в Stripe: https://<домен>/api/stripe-webhook
// События: checkout.session.completed, customer.subscription.deleted.
import crypto from "node:crypto"

export const config = { api: { bodyParser: false } } // нужен сырой body для подписи

const WH_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const SB_URL = process.env.VITE_SUPABASE_URL
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY

function rawBody(req) {
  return new Promise((resolve) => {
    let d = ""
    req.on("data", (c) => (d += c))
    req.on("end", () => resolve(d))
  })
}

function verify(raw, sigHeader) {
  if (!sigHeader || !WH_SECRET) return false
  const parts = Object.fromEntries(String(sigHeader).split(",").map((kv) => kv.split("=")))
  const expected = crypto.createHmac("sha256", WH_SECRET).update(`${parts.t}.${raw}`).digest("hex")
  try {
    return parts.v1 && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))
  } catch {
    return false
  }
}

async function setTariff(userId, tariff) {
  if (!SB_URL || !SB_KEY || !userId) return
  await fetch(`${SB_URL}/rest/v1/rpc/set_user_tariff`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: userId, p_tariff: tariff }),
  })
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  const raw = await rawBody(req)
  if (!verify(raw, req.headers["stripe-signature"])) return res.status(400).json({ error: "bad signature" })

  let event
  try { event = JSON.parse(raw) } catch { return res.status(400).json({ error: "bad json" }) }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object
      const userId = s.metadata?.userId || s.client_reference_id
      const tariff = s.metadata?.tariff
      if (userId && tariff) await setTariff(userId, tariff)
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (userId) await setTariff(userId, "free") // подписка закончилась → на Free
    }
  } catch (e) {
    return res.status(200).json({ received: true, warn: String(e) }) // 200, чтобы Stripe не ретраил бесконечно
  }
  return res.status(200).json({ received: true })
}
