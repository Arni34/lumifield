# AI-модель для профориентации Qadam

## Как сейчас работает MVP

Профориентация работает **из коробки без всякого AI и без ключей**: локальный
детерминированный движок (`src/lib/profori.ts`) считает вектор склонностей по
ответам, выбирает 2–3 направления (`src/data/directions.ts`) и подтягивает
реальные программы из каталога (`src/data/programs.ts`). Это бесплатно,
мгновенно и работает офлайн — то, что нужно для демо и первого запуска.

## AI-слой: Hermes 4 (по твоему выбору)

Когда нужен «живой» AI, включается **Hermes 4** от NousResearch через
HuggingFace Router (OpenAI-совместимый).

**Важно по архитектуре:** направления и список программ остаются
детерминированными — AI **только пишет тёплое объяснение** («почему это
направление» и общий вывод). Поэтому модель физически не может выдумать
несуществующую программу или соврать про каталог. Это и безопасно, и дёшево.

### Модель

| Вариант | HF model id | Когда брать |
|---|---|---|
| Hermes 4 70B | `NousResearch/Hermes-4-70B` | баланс цены и качества — **дефолт** |
| Hermes 4.3 36B | `NousResearch/Hermes-4.3-36B` | новее, дешевле, быстрее |
| Hermes 4 405B | `NousResearch/Hermes-4-405B` | максимум качества, дороже |
| Hermes 4 14B | `NousResearch/Hermes-4-14B` | самый дешёвый, для черновиков |

Эндпоинт: `https://router.huggingface.co/v1/chat/completions`,
Bearer-токен с https://huggingface.co/settings/tokens (есть free-тариф ~$0.10/мес).

### Как включить

1. Токен HF **нельзя** держать в браузере — фронт ходит на свой прокси.
   Разверни маленькую serverless-функцию (пример ниже) и положи в неё `HF_TOKEN`.
2. Укажи её адрес фронту:

```bash
# qadam-app/.env.local
VITE_PROFORI_ENDPOINT=https://<твой-домен>/api/profori
```

3. Пересобери. `AI_ENABLED` станет `true`, и на экране загрузки/результата
   появится метка «Hermes 4 · AI». Если эндпоинт упадёт — фронт молча
   вернётся к локальному результату, UI не сломается.

### Пример прокси (Vercel-style, как в tok-site/api)

```js
// api/profori.js  — принимает { messages }, зовёт Hermes 4, отдаёт { content }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()
  try {
    const r = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "NousResearch/Hermes-4-70B",   // см. таблицу выше
        messages: req.body.messages,
        temperature: 0.6,
        max_tokens: 500,
        response_format: { type: "json_object" }, // просим строгий JSON
      }),
    })
    const data = await r.json()
    res.status(200).json({ content: data.choices?.[0]?.message?.content ?? "" })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
```

## Честная рекомендация

Hermes 4 — хороший открытый дефолт: управляемый, дешёвый, без вендор-лока,
уверенно держит инструкции и формат JSON. **Но:** качество русского/казахского
у открытых моделей плавает. Перед тем как коммититься на Hermes, стоит
**A/B-протестировать** его вывод против Claude Haiku на 10–20 реальных ответах —
если по-русски звучит суше, для prose-слоя можно взять Claude, оставив всю
остальную логику как есть. Прокси модель-агностичен: смена — одна строка
`model` (или другой эндпоинт). Логика подбора направлений от модели не зависит.
