import { LANGS, useI18n } from "@/lib/i18n"

// Переключатель языков EN / KZ / RU (приоритет — EN). Брутализм-стиль.
export function LangSwitch() {
  const { lang, setLang } = useI18n()
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-foreground/[0.05] p-0.5" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={
            "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors " +
            (lang === l.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
