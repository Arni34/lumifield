import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

// Баннер согласия на cookie. Показывается при заходе, пока выбор не сделан;
// решение запоминается (localStorage), чтобы не спрашивать повторно.
const KEY = "lumifield.cookies"

// Разрешены ли необязательные cookie (аналитика и т.п.). ЛЮБОЙ необязательный
// скрипт/трекер должен вызывать это перед запуском — иначе «Отклонить все»
// не имеет эффекта. Сейчас таких cookie нет, но гейт готов к подключению.
export function optionalCookiesAllowed(): boolean {
  try { return localStorage.getItem(KEY) === "all" } catch { return false }
}

export function CookieConsent({ onOpenPrivacy }: { onOpenPrivacy?: () => void }) {
  const { t } = useI18n()
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true) } catch { setShow(true) }
  }, [])

  function decide(choice: "all" | "essential") {
    try { localStorage.setItem(KEY, choice) } catch { /* ignore */ }
    setShow(false)
  }

  if (!show) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t-2 border-foreground bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          🍪 {t("cookie.text")}{" "}
          {onOpenPrivacy && (
            <button onClick={onOpenPrivacy} className="font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
              {t("cookie.more")}
            </button>
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            onClick={() => decide("essential")}
            variant="outline"
            className="h-10 rounded-none border-2 border-foreground px-4 text-[12px] font-bold uppercase tracking-wider"
          >
            {t("cookie.reject")}
          </Button>
          <Button
            onClick={() => decide("all")}
            className="brutal-sm brutal-press h-10 rounded-none border-2 border-foreground bg-brand px-4 text-[12px] font-bold uppercase tracking-wider text-brand-foreground hover:bg-foreground hover:text-background"
          >
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  )
}
