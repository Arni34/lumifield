// Supabase Edge Function: поиск новых программ и проверка дедлайнов через Tavily.
// Деплой:  supabase functions deploy qadam-discover --no-verify-jwt
// Секрет:  supabase secrets set TAVILY_API_KEY=tvly-...
// URL функции пропиши во фронт:  VITE_TAVILY_ENDPOINT=https://<ref>.functions.supabase.co/qadam-discover
//
// Тело запроса:
//   { mode: "discover", query: string }
//   { mode: "deadlines", programs: [{ id, t, url, dl }] }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const TAVILY = "https://api.tavily.com/search"

// naive-категоризация по ключевым словам названия/описания
function guessCat(text: string): string {
  const t = text.toLowerCase()
  if (/олимпиад|olympiad/.test(t)) return "olympiad"
  if (/хакатон|hack|конкурс|challenge/.test(t)) return "hack"
  if (/грант|стипенд|scholarship|grant/.test(t)) return "grant"
  if (/курс|course|bootcamp|буткемп/.test(t)) return "course"
  if (/лет(няя|них)|summer/.test(t)) return "summer"
  if (/стажир|internship/.test(t)) return "internship"
  if (/обмен|exchange|учёб.*рубеж/.test(t)) return "exchange"
  if (/лидер|волонт|mun|debate/.test(t)) return "leadership"
  return "hack"
}

async function tavily(query: string, apiKey: string, maxResults = 8) {
  const r = await fetch(TAVILY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: maxResults,
      include_answer: false,
    }),
  })
  if (!r.ok) throw new Error(`tavily ${r.status}`)
  return await r.json()
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  const apiKey = Deno.env.get("TAVILY_API_KEY")
  if (!apiKey) return json({ error: "TAVILY_API_KEY not set" }, 500)

  try {
    const body = await req.json()

    if (body.mode === "web") {
      // для YouPath-отчёта: прогоняем набор запросов и возвращаем текст
      const queries: string[] = Array.isArray(body.queries) ? body.queries.slice(0, 4) : [String(body.query ?? "")]
      let text = ""
      for (const q of queries) {
        const res = await tavily(q, apiKey, 3)
        text += (res.results ?? []).map((x: { content?: string }) => x.content ?? "").join("\n") + "\n\n"
      }
      return json({ text })
    }

    if (body.mode === "deadlines") {
      const flags: unknown[] = []
      const now = new Date()
      for (const p of (body.programs ?? []).slice(0, 10)) {
        // спец-запрос (как YouPath): ищем точную дату дедлайна подачи на офиц. сайте
        const q = `"${p.t}" ${p.url ?? ""} application deadline OR due date OR "last day to apply" 2026 2027 site official registration close`
        const res = await tavily(q, apiKey, 4)
        const blob = (res.results ?? []).map((x: { content?: string }) => x.content ?? "").join(" ")
        // ищем упоминание месяца/даты
        const m = blob.match(/\b(\d{1,2}\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|январ|феврал|март|апрел|мая|июн|июл|август|сентябр|октябр|ноябр|декабр)\w*(\s+\d{4})?/i)
        const foundDate = m ? m[0] : null
        const urgent = /deadline|дедлайн|closes|close|last day|до \d/i.test(blob)
        flags.push({
          id: p.id, t: p.t,
          note: foundDate
            ? `Возможный дедлайн: ${foundDate}. Обязательно сверь на официальном сайте.`
            : "Точную дату дедлайна найти не удалось — проверь на сайте программы.",
          soon: urgent || Boolean(foundDate),
        })
      }
      return json({ flags, checkedAt: now.toISOString() })
    }

    // mode: discover
    const q = String(body.query ?? "олимпиады и гранты для школьников Казахстан")
    const res = await tavily(`${q} для школьников 2026 регистрация`, apiKey, 8)
    const candidates = (res.results ?? []).map((x: { title?: string; url?: string; content?: string }, i: number) => {
      const title = (x.title ?? "Возможность").slice(0, 90)
      let org = "—"
      try { org = new URL(x.url ?? "").hostname.replace(/^www\./, "") } catch { /* keep */ }
      return {
        id: `tavily-${Date.now().toString(36)}-${i}`,
        t: title, org, cat: guessCat(`${title} ${x.content ?? ""}`),
        price: "free", format: "online", scope: /kz|казах|kazakh/i.test(x.url ?? "") ? "kz" : "intl",
        loc: "—", age: "—", dl: "Уточните на сайте", url: x.url ?? "",
        d: (x.content ?? "").slice(0, 180), tags: [], ok: false,
        sourceUrl: x.url ?? "",
      }
    })
    return json({ candidates })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, "Content-Type": "application/json" },
  })
}
