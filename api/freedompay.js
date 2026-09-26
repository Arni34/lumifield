// Vercel serverless: Freedom Pay (freedompay.kz) — запасной провайдер для РК
// (карты + Kaspi, тенге). Тот же контракт, что у Stripe: POST {action:"create"} → {url}.
// Активация — в серверном колбэке api/freedompay-result (как вебхук).
//
// Env (задаёшь ты, из кабинета мерчанта Freedom Pay):
//   FREEDOMPAY_MERCHANT_ID, FREEDOMPAY_SECRET,
//   FREEDOMPAY_AMOUNT_PLUS (в тенге, напр. 7490), FREEDOMPAY_AMOUNT_PRO (напр. 24900),
//   FREEDOMPAY_TEST=1 (тест) | 0 (боевой).
// Включить на сайте: VITE_PAY_ENDPOINT=/api/freedompay.
//
// ⚠️ Точные имена полей/endpoint сверь с актуальной докой Freedom Pay в песочнице —
// у шлюза бывают версии. Архитектура и подпись — по стандартной схеме PayBox/FreedomPay.
import crypto from "node:crypto"

const MERCHANT = process.env.FREEDOMPAY_MERCHANT_ID
const SECRET = process.env.FREEDOMPAY_SECRET
const AMOUNT = { plus: process.env.FREEDOMPAY_AMOUNT_PLUS, package: process.env.FREEDOMPAY_AMOUNT_PRO }
const INIT_URL = "https://api.freedompay.money/init_payment.php"

// Подпись Freedom Pay: md5( script ; значения-параметров-по-алфавиту-ключей ; secret ).
function sign(script, params, secret) {
  const values = Object.keys(params).sort().map((k) => params[k])
  return crypto.createHash("md5").update([script, ...values, secret].join(";")).digest("hex")
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  if (!MERCHANT || !SECRET) return res.status(500).json({ error: "FreedomPay not configured" })

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {})
  if (body.action !== "create") return res.status(400).json({ error: "unknown action" })

  const tariff = body.tariff
  const amount = AMOUNT[tariff]
  if (!amount) return res.status(400).json({ error: `amount for '${tariff}' not set` })

  const origin = body.origin || `https://${req.headers.host}`
  const userId = body.userId || ""
  // tariff и userId кодируем в order_id — вытащим в колбэке (в них нет точки).
  const orderId = `${tariff}.${userId}.${Date.now().toString(36)}`

  const params = {
    pg_merchant_id: MERCHANT,
    pg_amount: String(amount),
    pg_currency: "KZT",
    pg_order_id: orderId,
    pg_description: `Lumifield ${tariff}`,
    pg_result_url: `${origin}/api/freedompay-result`,
    pg_success_url: `${origin}/?paid=1`,
    pg_failure_url: `${origin}/?paid=0`,
    pg_salt: crypto.randomBytes(8).toString("hex"),
    pg_testing_mode: process.env.FREEDOMPAY_TEST === "0" ? "0" : "1",
  }
  params.pg_sig = sign("init_payment.php", params, SECRET)

  const r = await fetch(INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  })
  const xml = await r.text()
  const url = (xml.match(/<pg_redirect_url>(.*?)<\/pg_redirect_url>/) || [])[1]
  if (!url) return res.status(502).json({ error: "freedompay init failed", detail: xml.slice(0, 300) })
  return res.status(200).json({ url })
}
