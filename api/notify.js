// Vercel serverless-функция: уведомления модерации в Telegram.
// Токен и chat_id живут ТОЛЬКО в серверной env — в браузер НЕ попадают:
//   TELEGRAM_BOT_TOKEN=<токен бота от @BotFather>        (секрет бота)
//   TELEGRAM_CHAT_ID=<твой chat id>          (куда слать)
// Фронт зовёт POST /api/notify с телом { type, program }.
//
// GET /api/notify?debug=chatid — вернёт последние чаты бота (getUpdates),
// чтобы узнать свой chat_id: напиши боту в Telegram, потом открой этот URL.

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return res.status(200).json({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" })

  // Помощник: узнать chat_id
  if (req.method === "GET") {
    if ((req.query?.debug || "") !== "chatid") return res.status(200).json({ ok: true, hint: "POST to notify; GET ?debug=chatid to find chat id" })
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`)
      const d = await r.json()
      const chats = (d.result || []).map((u) => u.message?.chat || u.channel_post?.chat).filter(Boolean)
      return res.status(200).json({ ok: true, chats })
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) })
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return res.status(200).json({ ok: false, error: "TELEGRAM_CHAT_ID not set" })

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {})
    const p = body.program || {}
    const text =
      `🆕 <b>Новая заявка на мероприятие</b>\n\n` +
      `<b>${esc(p.t)}</b>\n` +
      `${esc(p.org)} · ${esc(p.cat)} · ${esc(p.price)} · ${esc(p.scope)}\n` +
      `${esc(p.loc)} · ${esc(p.age)} · ${esc(p.dl)}\n\n` +
      `${esc(p.d)}\n\n` +
      (p.by ? `👤 ${esc(p.by)}\n` : "")

    const rows = []
    if (p.id) rows.push([
      { text: "✅ Одобрить", callback_data: `a:${p.id}` },
      { text: "❌ Отклонить", callback_data: `r:${p.id}` },
    ])
    if (p.url) rows.push([{ text: "🔗 Открыть сайт заявки", url: p.url }])

    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: rows.length ? { inline_keyboard: rows } : undefined,
      }),
    })
    const d = await r.json()
    return res.status(r.ok ? 200 : 502).json(d)
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
