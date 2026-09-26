// Supabase Edge Function: серверный AI-прокси «Kadam AI» для прод-сайта.
// Ключ модели живёт СЕКРЕТОМ на сервере — в браузер не попадает.
// На фронте на него смотрит VITE_PROFORI_ENDPOINT (эссе, профориентация,
// генерация тестов, YouPath-отчёт, подбор вузов).
//
// По умолчанию — Groq (как в приложении). Деплой через дашборд Edge Functions
// (Verify JWT = OFF) или CLI:
//   supabase functions deploy qadam-ai --no-verify-jwt
//   supabase secrets set GROQ_API_KEY=gsk_...          (console.groq.com/keys)
//   (опц.) supabase secrets set AI_MODEL=qwen/qwen3.8-27b
// Фронт (Vercel): VITE_PROFORI_ENDPOINT=https://<ref>.functions.supabase.co/qadam-ai
//
// Тело: { messages: [{role, content}, ...] }  → { content: "..." }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } })

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = Deno.env.get("AI_MODEL") ?? "qwen/qwen3.8-27b"

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  const key = Deno.env.get("GROQ_API_KEY")
  if (!key) return json({ error: "GROQ_API_KEY not set" }, 500)
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages)) return json({ error: "messages[] required" }, 400)
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 3500 }),
    })
    if (!r.ok) return json({ error: `groq ${r.status}`, detail: await r.text() }, 502)
    const data = await r.json()
    return json({ content: data.choices?.[0]?.message?.content ?? "" })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
