// Vercel serverless: AI-прокси Lumifield AI. Ключи живут в серверной env,
// в браузер не попадают. Фронт зовёт /api/ai (VITE_PROFORI_ENDPOINT=/api/ai).
// Тело: { messages: [{role, content}], max_tokens? } → { content: "..." }
//
// Провайдеры (по приоритету):
// Порядок задаётся env AI_ORDER ("groq,hf" или "hf,groq"). По умолчанию groq
// первый: он отвечает за секунды, тогда как HF на бесплатных кредитах уходит
// в таймаут и заставляет пользователя ждать полминуты впустую.
//   • cerebras — бесплатный тариф даёт ~60k токенов/мин и 1M в сутки, модели
//     крупнее и отвечают быстрее всех; контекст на free урезан до 8192 токенов,
//     чего отчёту (~1.5k вход + 3.5k выход) хватает;
//   • groq — быстрый, но на free-тарифе режет вывод (OTPM = 1000 токенов/мин);
//   • hf   — крупная модель и полный объём, но нужны непустые кредиты HF.
// Обе точки OpenAI-совместимы, поэтому тело запроса одинаковое.

// У каждой задачи своя модель — и, значит, свой независимый лимит токенов в минуту.
const TASK_MODEL = {
  // Четыре части отчёта — на четырёх разных моделях, чтобы каждая расходовала
  // свою квоту. Так полный отчёт собирается в пределах бесплатного тарифа.
  p1: process.env.GROQ_MODEL_P1 || "qwen/qwen3.8-27b",      // профессии
  p2: process.env.GROQ_MODEL_P2 || "openai/gpt-oss-120b",   // вузы — самая крупная модель
  p3: process.env.GROQ_MODEL_P3 || "qwen/qwen3.6-27b",      // мотивационное письмо
  p4: process.env.GROQ_MODEL_P4 || "openai/gpt-oss-20b",    // книги
  report: process.env.GROQ_MODEL_REPORT || "qwen/qwen3.8-27b",   // отчёт одним запросом (запасной путь)
  exam: process.env.GROQ_MODEL_EXAM || "qwen/qwen3.6-27b",       // генератор заданий
  assist: process.env.GROQ_MODEL_ASSIST || "openai/gpt-oss-20b", // помощник, эссе, вузы
}

/** Модель под задачу + остальные как запасные (их квоты не связаны). */
function groqModels(task) {
  const primary = TASK_MODEL[task] || TASK_MODEL.report
  const rest = [...new Set(Object.values(TASK_MODEL))].filter((m) => m !== primary)
  return [primary, ...rest]
}

const SB_URL = process.env.VITE_SUPABASE_URL
const SB_ANON = process.env.VITE_SUPABASE_ANON_KEY

/** Оплачен ли класс ученика. Спрашиваем базу от имени самого пользователя —
 *  подделать нельзя: токен проверяет Supabase, а функция смотрит его класс. */
async function licensed(token) {
  if (!token || !SB_URL || !SB_ANON) return false
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/edu_is_licensed`, {
      method: "POST",
      headers: { apikey: SB_ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    })
    if (!r.ok) return false
    return (await r.json()) === true
  } catch { return false }
}

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions"
const HF_URL = "https://router.huggingface.co/v1/chat/completions"
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

// ВАЖНО: у функции на Vercel жёсткий потолок 60 с (vercel.json → maxDuration).
// Без своего таймаута медленный HF съедал все 60 с, функцию убивали — и до Groq,
// который ответил бы за пару секунд, очередь не доходила. Пользователь видел ошибку
// вместо отчёта. Поэтому каждый вызов ограничен по времени, а остаток бюджета
// достаётся запасному провайдеру.
async function call(url, key, model, messages, maxTokens, timeoutMs, extra = {}) {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: maxTokens, ...extra }),
      signal: ac.signal,
    })
    const text = await r.text()
    if (!r.ok) return { ok: false, status: r.status, detail: text }
    try {
      return { ok: true, content: JSON.parse(text).choices?.[0]?.message?.content ?? "" }
    } catch {
      return { ok: false, status: 502, detail: text.slice(0, 400) }
    }
  } catch (e) {
    const timedOut = e && e.name === "AbortError"
    return { ok: false, status: timedOut ? 504 : 502, detail: timedOut ? `timeout ${timeoutMs}ms` : String(e) }
  } finally {
    clearTimeout(timer)
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })

  const cerebrasKey = process.env.CEREBRAS_API_KEY
  const hfKey = process.env.HF_TOKEN
  const groqKey = process.env.GROQ_API_KEY
  if (!cerebrasKey && !hfKey && !groqKey) {
    return res.status(500).json({ error: "no model key set (CEREBRAS_API_KEY, GROQ_API_KEY or HF_TOKEN)" })
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {})
    const messages = body.messages
    if (!Array.isArray(messages)) return res.status(400).json({ error: "messages[] required" })

    const want = Number(body.max_tokens) || 3500
    const errors = []

    // Раздел про университеты — платный. Решение принимает СЕРВЕР: клиент
    // может прислать какой угодно промпт, но последнее слово за этой вставкой.
    if (body.task === "p2") {
      const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "")
      if (!(await licensed(token))) {
        messages.push({
          role: "system",
          content:
            "ВАЖНО, приоритет выше остальных указаний: у пользователя нет платного доступа. " +
            "В разделе про университеты дай ТОЛЬКО пять строк вида «1. Название — страна, город · одна фраза, почему подходит». " +
            "СТРОГО ЗАПРЕЩЕНО указывать дедлайны, минимальный GPA, языковые требования, стоимость, стипендии, шанс поступления и ссылки.",
        })
      }
    }

    // Делим 60-секундный бюджет Vercel между провайдерами, чтобы последнему
    // гарантированно осталось время на попытку.
    // Рассуждающие модели (Qwen3 и подобные) пишут ход мысли перед ответом и
    // съедают им весь бюджет токенов — JSON приходит оборванным. Просьба в
    // тексте не помогает, отключаем на уровне запроса.
    const extra = body.no_reasoning ? { reasoning_effort: "none" } : {}

    const started = Date.now()
    const TOTAL_BUDGET = 52000
    const left = () => TOTAL_BUDGET - (Date.now() - started)

    // Кандидаты провайдера: список моделей + потолок вывода.
    const plans = {
      cerebras: () => ({
        key: cerebrasKey,
        url: CEREBRAS_URL,
        // Список кандидатов: имена моделей у Cerebras меняются, первый живой победит.
        models: (process.env.CEREBRAS_MODEL || "qwen-3.8-27b,gemma-4-31b")
          .split(",").map((m) => m.trim()).filter(Boolean),
        cap: Number(process.env.CEREBRAS_MAX_TOKENS) || 3500,
      }),
      groq: () => ({
        key: groqKey,
        url: GROQ_URL,
        // Лимит токенов в минуту Groq считает ОТДЕЛЬНО для каждой модели
        // («Rate limit reached for model X in organization Y»). Поэтому разводим
        // задачи по разным моделям: отчёт больше не конкурирует с помощником
        // за одну квоту. Если своя модель упёрлась в лимит — идём на соседнюю,
        // у неё счётчик независимый.
        models: groqModels(body.task),
        cap: Number(process.env.GROQ_MAX_TOKENS) || 900,
      }),
      hf: () => ({
        key: hfKey,
        url: HF_URL,
        // HF_MODEL можно задать списком через запятую: маршруты "модель:провайдер"
        // (cerebras, groq, together…) отвечают заметно быстрее дефолтного.
        models: (process.env.HF_MODEL || "meta-llama/Llama-3.3-70B-Instruct")
          .split(",").map((m) => m.trim()).filter(Boolean),
        cap: Number(process.env.AI_MAX_TOKENS) || 3500,
      }),
    }

    const order = (process.env.AI_ORDER || "cerebras,groq,hf").split(",").map((p) => p.trim())
    const budget = Number(process.env.AI_TRY_MS) || 20000

    for (const name of order) {
      const plan = plans[name]?.()
      if (!plan?.key) continue
      for (const model of plan.models) {
        // Меньше 8 с в запасе — новую попытку не начинаем, иначе Vercel убьёт функцию.
        if (left() <= 8000) break
        let r = await call(plan.url, plan.key, model, messages, Math.min(want, plan.cap), Math.min(budget, left() - 5000), extra)

        // 429 = упёрлись в лимит токенов в минуту. Провайдер сам пишет, через
        // сколько можно повторить («try again in 7.26s») — подождать дешевле,
        // чем отдать пользователю ошибку, если время в бюджете ещё есть.
        if (!r.ok && r.status === 429) {
          const hint = /try again in ([\d.]+)s/.exec(String(r.detail))
          const waitMs = Math.ceil((hint ? parseFloat(hint[1]) : 8) * 1000) + 500
          if (waitMs < left() - 12000) {
            await new Promise((ok) => setTimeout(ok, waitMs))
            r = await call(plan.url, plan.key, model, messages, Math.min(want, plan.cap), Math.min(budget, left() - 5000), extra)
          }
        }

        if (r.ok && r.content) {
          // errors непустой — значит до успеха что-то отвалилось; показываем что.
          return res.status(200).json({ content: r.content, provider: name, model, ...(errors.length ? { fell_back: errors } : {}) })
        }
        errors.push({ provider: name, model, status: r.status, detail: String(r.detail).slice(0, 300) })
      }
    }

    return res.status(502).json({ error: "all providers failed", errors })
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
