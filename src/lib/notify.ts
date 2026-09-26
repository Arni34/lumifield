import { type Program } from "@/data/programs"

// Отправляет заявку модератору в Telegram через серверную функцию /api/notify.
// Токен бота живёт на сервере (env), в браузер не попадает. Best-effort:
// если функция не настроена или недоступна — молча игнорируем.
const ENDPOINT = (import.meta.env.VITE_NOTIFY_ENDPOINT as string | undefined) || "/api/notify"

export async function notifySubmission(program: Program, by: string): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "submission", program: { ...program, by } }),
    })
  } catch {
    /* уведомление — не критично, не мешаем пользователю */
  }
}
