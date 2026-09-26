// Supabase Edge Function: оплата тарифов Qadam через Stripe Checkout (референс).
// Для Казахстана можно заменить тело create/verify на API Kaspi Pay — контракт
// с фронтом (pay.ts) остаётся тот же: create → {url}, verify → {ok,tariff}.
//
// Деплой:  supabase functions deploy qadam-pay --no-verify-jwt
// Секрет:  supabase secrets set STRIPE_SECRET_KEY=sk_test_...
// Фронт:   VITE_PAY_ENDPOINT=https://<ref>.functions.supabase.co/qadam-pay
//
// Тело:  { action:"create", tariff, userId, origin }  → { url }
//        { action:"verify", sessionId }               → { ok, tariff, userId }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } })

// цена в наименьших единицах. ВНИМАНИЕ: проверь для своей валюты у провайдера
// (для тенге в Stripe используется 2 знака → тенге×100). Меняй под свой аккаунт.
const PRICES: Record<string, { name: string; amount: number }> = {
  plus: { name: "Qadam+ (месяц)", amount: 299000 },      // 2 990 ₸
  package: { name: "Qadam Pro (3 месяца)", amount: 2490000 }, // 24 900 ₸
}
const CURRENCY = Deno.env.get("PAY_CURRENCY") ?? "kzt"
const STRIPE = "https://api.stripe.com/v1"

async function stripe(path: string, key: string, body?: Record<string, string>) {
  const res = await fetch(`${STRIPE}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? new URLSearchParams(body).toString() : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? `stripe ${res.status}`)
  return data
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  const key = Deno.env.get("STRIPE_SECRET_KEY")
  if (!key) return json({ error: "STRIPE_SECRET_KEY not set" }, 500)
  try {
    const body = await req.json()

    if (body.action === "create") {
      const price = PRICES[body.tariff]
      if (!price) return json({ error: "unknown tariff" }, 400)
      const origin = String(body.origin ?? "")
      const session = await stripe("/checkout/sessions", key, {
        mode: "payment",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": CURRENCY,
        "line_items[0][price_data][unit_amount]": String(price.amount),
        "line_items[0][price_data][product_data][name]": price.name,
        success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
        client_reference_id: String(body.userId ?? ""),
        "metadata[tariff]": body.tariff,
      })
      return json({ url: session.url })
    }

    if (body.action === "verify") {
      const s = await stripe(`/checkout/sessions/${body.sessionId}`, key)
      const paid = s.payment_status === "paid"
      return json({ ok: paid, tariff: s.metadata?.tariff ?? null, userId: s.client_reference_id ?? null })
    }

    return json({ error: "unknown action" }, 400)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
