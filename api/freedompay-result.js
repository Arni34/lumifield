// Vercel serverless: серверный колбэк Freedom Pay (pg_result_url).
// Шлюз шлёт сюда результат оплаты; проверяем подпись, активируем тариф и
// отвечаем подписанным XML. Env: FREEDOMPAY_SECRET, VITE_SUPABASE_URL,
// VITE_SUPABASE_ANON_KEY. Тариф меняем через set_user_tariff (stripe_setup.sql).
import crypto from "node:crypto"

const SECRET = process.env.FREEDOMPAY_SECRET
const SB_URL = process.env.VITE_SUPABASE_URL
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SCRIPT = "freedompay-result" // имя скрипта = последний сегмент pg_result_url

function sign(script, params, secret) {
  const values = Object.keys(params).sort().map((k) => params[k])
  return crypto.createHash("md5").update([script, ...values, secret].join(";")).digest("hex")
}

async function setTariff(userId, tariff) {
  if (!SB_URL || !SB_KEY || !userId) return
  await fetch(`${SB_URL}/rest/v1/rpc/set_user_tariff`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: userId, p_tariff: tariff }),
  })
}

function xml(status, secret) {
  const body = { pg_status: status, pg_salt: crypto.randomBytes(8).toString("hex") }
  body.pg_sig = sign(SCRIPT, body, secret)
  return `<?xml version="1.0" encoding="utf-8"?><response><pg_status>${body.pg_status}</pg_status><pg_salt>${body.pg_salt}</pg_salt><pg_sig>${body.pg_sig}</pg_sig></response>`
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("POST only")
  if (!SECRET) return res.status(500).end("FreedomPay not configured")

  const p = typeof req.body === "string" ? Object.fromEntries(new URLSearchParams(req.body)) : (req.body || {})

  // Проверка подписи: пересчитываем без pg_sig.
  const incomingSig = p.pg_sig
  const check = { ...p }
  delete check.pg_sig
  const ok = incomingSig && incomingSig === sign(SCRIPT, check, SECRET)

  res.setHeader("Content-Type", "application/xml")
  if (!ok) return res.status(200).send(xml("error", SECRET))

  // Успешная оплата → активируем тариф (order_id = "tariff.userId.ts").
  if (String(p.pg_result) === "1" || String(p.pg_payment_status || "").toLowerCase() === "success") {
    const [tariff, userId] = String(p.pg_order_id || "").split(".")
    if (userId && (tariff === "plus" || tariff === "package")) await setTariff(userId, tariff)
  }
  return res.status(200).send(xml("ok", SECRET))
}
