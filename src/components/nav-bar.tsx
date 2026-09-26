import { Home, Compass, Sparkles, Map, User } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export type NavKey = "home" | "catalog" | "youpath" | "plan" | "account"

const ITEMS: { key: NavKey; icon: typeof Home; labelKey: string }[] = [
  { key: "home", icon: Home, labelKey: "hdr.home" },
  { key: "catalog", icon: Compass, labelKey: "hdr.catalog" },
  { key: "youpath", icon: Sparkles, labelKey: "nb.guidance" },
  { key: "plan", icon: Map, labelKey: "nb.plan" },
  { key: "account", icon: User, labelKey: "nb.profile" },
]

/**
 * Нижняя панель вкладок — только на мобильном (на десктопе те же разделы
 * лежат в шапке). Пять постоянных точек входа: до профориентации, тарифов и
 * профиля теперь один тап с любого экрана.
 */
export function NavBar({ current, go }: { current: NavKey | null; go: (k: NavKey) => void }) {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t("nb.aria")}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-foreground/10 bg-background/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ key, icon: Icon, labelKey }) => {
          const active = current === key
          return (
            <li key={key} className="flex-1">
              <button
                onClick={() => go(key)}
                aria-current={active ? "page" : undefined}
                className={
                  "flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand " +
                  (active ? "text-brand" : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="size-5" />
                <span className="w-full truncate text-center leading-none">{t(labelKey)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Те же разделы для шапки на десктопе. */
export function NavLinks({ current, go }: { current: NavKey | null; go: (k: NavKey) => void }) {
  const { t } = useI18n()
  return (
    <div className="hidden items-center gap-0.5 sm:flex">
      {ITEMS.filter((i) => i.key !== "account" && i.key !== "home").map((it) => {
        const active = current === it.key
        return (
          <button
            key={it.key}
            onClick={() => go(it.key)}
            aria-current={active ? "page" : undefined}
            data-lumi-hint={`lumi.h.nav.${it.key}`}
            className={
              "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
              (active ? "bg-foreground/[0.06] text-foreground" : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground")
            }
          >
            {t(it.labelKey)}
          </button>
        )
      })}
    </div>
  )
}
