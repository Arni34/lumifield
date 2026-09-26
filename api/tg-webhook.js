// Vercel serverless: Telegram webhook для модерации заявок из чата.
// Кнопки ✅/❌ (из /api/notify) шлют callback_data a:<id> / r:<id> →
// обновляем статус в Supabase (submissions) и редактируем сообщение.
//
// РАЗОВАЯ НАСТРОЙКА: после установки TELEGRAM_BOT_TOKEN открой
//   https://<домен>/api/tg-webhook?setup=1
// — функция сама зарегистрирует вебхук в Telegram (с секретом).
//
// Env (уже есть в проекте): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (публичный, RLS разрешает update).

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID
const SB_URL = process.env.VITE_SUPABASE_URL
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY

// Секрет вебхука выводим детерминированно из токена (Telegram шлёт его в заголовке).
// Безопасно к «кривому» токену без ':' — берём часть после ':' либо весь токен.
const secret = () => (TOKEN ? (TOKEN.split(":")[1] || TOKEN).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) : "")

const tg = (method, body) =>
  fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  })

// Смена статуса через защищённую функцию set_submission_status (SECURITY DEFINER):
// прямой update анониму запрещён RLS. Возвращает true, только если строка реально
// обновилась (иначе не выдаём ложное «одобрено»).
async function setStatus(id, status) {
  if (!SB_URL || !SB_KEY) return false
  const r = await fetch(`${SB_URL}/rest/v1/rpc/set_submission_status`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_id: id, p_status: status }),
  })
  if (!r.ok) return false
  return (await r.json()) === true
}

export default async function handler(req, res) {
  if (!TOKEN) return res.status(200).json({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" })

  // Разовая регистрация вебхука
  if (req.method === "GET") {
    if ((req.query?.setup || "") !== "1") return res.status(200).json({ ok: true, hint: "GET ?setup=1 to register webhook" })
    const proto = req.headers["x-forwarded-proto"] || "https"
    const host = req.headers["x-forwarded-host"] || req.headers.host
    const url = `${proto}://${host}/api/tg-webhook`
    const r = await tg("setWebhook", { url, secret_token: secret(), allowed_updates: ["callback_query"] })
    return res.status(200).json({ ok: true, url, telegram: await r.json() })
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })

  // Защита: только запросы Telegram с нашим секретом
  if ((req.headers["x-telegram-bot-api-secret-token"] || "") !== secret()) {
    return res.status(401).json({ ok: false })
  }

  try {
    const update = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {})
    const cq = update.callback_query
    if (!cq) return res.status(200).json({ ok: true }) // игнорируем прочее

    // Нет message (напр. callback по старому сообщению) — не дёргаем editMessageText.
    if (!cq.message) {
      await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Сообщение недоступно" })
      return res.status(200).json({ ok: true })
    }

    // Защита: действуем только из нашего чата
    const fromChat = String(cq.message.chat?.id ?? "")
    if (CHAT_ID && fromChat !== String(CHAT_ID)) {
      await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Нет доступа" })
      return res.status(200).json({ ok: true })
    }

    const [action, id] = String(cq.data || "").split(":")
    const approve = action === "a"
    const status = approve ? "approved" : "rejected"
    const ok = id ? await setStatus(id, status) : false

    const mark = approve ? "✅ ОДОБРЕНО" : "❌ ОТКЛОНЕНО"
    const note = ok ? mark : `${mark} — ⚠️ не удалось (заявка не найдена или база недоступна)`
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: note })
    // Убираем кнопки и дописываем решение к тексту
    const baseText = cq.message.text || ""
    await tg("editMessageText", {
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: `${baseText}\n\n— ${note}`,
      disable_web_page_preview: true,
    })
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(200).json({ ok: false, error: String(e) })
  }
}
