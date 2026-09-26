// Vercel serverless: приватная админка Lumifield.
//
// Пароль проверяется НА СЕРВЕРЕ (env ADMIN_PASSWORD) — в браузер не попадает.
// Доступ к панели — только по секретной ссылке <домен>/#admin плюс пароль.
//
// Действия собраны в карту ACTIONS: чтобы добавить новый раздел админки,
// достаточно дописать сюда одну функцию — фронт подхватит её по имени.
//
// Env:
//   ADMIN_PASSWORD         — пароль панели (обязателен)
//   VITE_SUPABASE_URL      — адрес проекта Supabase
//   VITE_SUPABASE_ANON_KEY — публичный ключ (хватает для заявок и промокодов)
//   SUPABASE_SERVICE_ROLE  — служебный ключ; нужен для сводки и выдачи тарифов
//                            и выдачи тарифов. Без него они вернут пустоту,
//                            остальное работает.

const PASSWORD = process.env.ADMIN_PASSWORD
const SB_URL = process.env.VITE_SUPABASE_URL
const ANON = process.env.VITE_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE

const headers = (key) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
})

/** GET к PostgREST. Со служебным ключом обходит RLS — только на сервере. */
async function get(path, { admin = false } = {}) {
  const key = admin ? SERVICE : ANON
  if (!key) return null
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: headers(key) })
  if (!r.ok) return null
  return r.json()
}

/** Сколько строк в таблице — через Content-Range, без выгрузки данных. */
async function count(table, filter = "", { admin = false } = {}) {
  const key = admin ? SERVICE : ANON
  if (!key) return null
  const q = filter ? `${table}?${filter}&select=*` : `${table}?select=*`
  const r = await fetch(`${SB_URL}/rest/v1/${q}`, {
    headers: { ...headers(key), Prefer: "count=exact", Range: "0-0" },
  })
  if (!r.ok) return null
  const total = (r.headers.get("content-range") || "").split("/")[1]
  return total && total !== "*" ? Number(total) : null
}


const ACTIONS = {
  // Сводка по всему продукту — первый экран админки.
  async stats() {
    const [pending, approved, rejected, promoAll, promoUsed, users] =
      await Promise.all([
        count("submissions", "status=eq.pending"),
        count("submissions", "status=eq.approved"),
        count("submissions", "status=eq.rejected"),
        count("promo_codes"),
        count("promo_codes", "used_by=not.is.null"),
        count("user_data", "", { admin: true }),
      ])
    return {
      catalog: { pending, approved, rejected },
      promo: { total: promoAll, used: promoUsed },
      platform: { users },
      serviceKey: Boolean(SERVICE),
    }
  },

  // Заявки каталога.
  async subs() {
    const rows = await get("submissions?select=*&order=submitted_at.desc&limit=300")
    return { submissions: Array.isArray(rows) ? rows : [] }
  },

  // Промокоды с отметкой об использовании.
  async promos() {
    const rows = await get(
      "promo_codes?select=code,tariff,days,used_by,used_at,expires_at&order=code&limit=300",
    )
    return { promos: Array.isArray(rows) ? rows : [] }
  },

  // Смена статуса заявки — через защищённую функцию, как и раньше.
  async status(body) {
    const { id, status } = body
    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return { error: "bad params", code: 400 }
    }
    const r = await fetch(`${SB_URL}/rest/v1/rpc/set_submission_status`, {
      method: "POST",
      headers: headers(ANON),
      body: JSON.stringify({ p_id: id, p_status: status }),
    })
    return { ok: (await r.json()) === true }
  },

  // Диагностика служебного ключа. Сам ключ НЕ возвращаем — только формат,
  // длину и ответ Supabase, чтобы понять, тот ли ключ скопирован.
  async diag() {
    if (!SERVICE) return { service: "не задан" }
    const kind = SERVICE.startsWith("eyJ")
      ? "JWT (service_role старого формата)"
      : SERVICE.startsWith("sb_secret_")
        ? "sb_secret (новый формат)"
        : SERVICE.startsWith("sb_publishable_")
          ? "sb_publishable — ЭТО ПУБЛИЧНЫЙ КЛЮЧ, нужен секретный"
          : "неизвестный формат"
    const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=1&per_page=1`, { headers: headers(SERVICE) })
    // Тело ответа не возвращаем: при удачной проверке там реальные адреса
    // учётных записей. Для диагностики хватает кода и текста ошибки.
    const detail = r.ok ? "ключ принят" : (await r.text()).slice(0, 160)
    return {
      service: kind,
      length: SERVICE.length,
      trimmed: SERVICE !== SERVICE.trim() ? "в значении есть лишние пробелы или перенос строки" : "пробелов нет",
      authStatus: r.status,
      authSays: detail,
      url: SB_URL,
    }
  },

  // Выдать или снять тариф вручную — например, победителю конкурса.
  async tariff(body) {
    if (!SERVICE) return { error: "SUPABASE_SERVICE_ROLE не задан", code: 400 }
    const { user_id, tariff } = body
    if (!user_id || !["free", "plus", "package"].includes(tariff)) {
      return { error: "bad params", code: 400 }
    }
    const r = await fetch(`${SB_URL}/rest/v1/rpc/set_user_tariff`, {
      method: "POST",
      headers: headers(SERVICE),
      body: JSON.stringify({ p_user: user_id, p_tariff: tariff }),
    })
    return { ok: r.ok }
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })

  // Пароль проверяем прежде конфигурации: иначе посторонний по тексту ошибки
  // узнаёт состояние настроек, ничего не зная о пароле.
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {})
  if (!PASSWORD || body.password !== PASSWORD) {
    return res.status(401).json({ error: "wrong password" })
  }
  if (!SB_URL || !ANON) return res.status(500).json({ error: "Supabase not configured" })

  const run = ACTIONS[body.action]
  if (!run) return res.status(400).json({ error: "unknown action" })

  try {
    const out = await run(body)
    if (out && out.code) return res.status(out.code).json({ error: out.error })
    return res.status(200).json({ ok: true, ...out })
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
