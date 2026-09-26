import "./apple.css"
import { useI18n, LANGS } from "@/lib/i18n"

export default function AppleLanding({
  onOpenNavigator, onOpenPricing,
}: {
  onOpenNavigator: () => void
  onOpenPricing: () => void
}) {
  const { t, lang, setLang } = useI18n()
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  return (
    <div className="ap-root">
      {/* nav */}
      <nav className="ap-bar">
        <div className="ap-wrap in">
          <span className="logo">Lumifield AI</span>
          <div className="links">
            <button onClick={onOpenNavigator}>{t("nav.profori")}</button>
            <button onClick={() => scrollTo("ap-features")}>{t("nav.features")}</button>
            <button onClick={() => scrollTo("ap-report")}>{t("nav.report")}</button>
            <button onClick={() => scrollTo("ap-pricing")}>{t("nav.pricing")}</button>
          </div>
          <div className="ap-lang" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button key={l.id} className={lang === l.id ? "on" : ""} onClick={() => setLang(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* hero */}
      <header className="ap-hero">
        <div className="ap-wrap ap-reveal">
          <h1>Lumifield AI</h1>
          <p className="sub"><b>{t("hero.sub1")}</b> {t("hero.sub2")}</p>
          <div className="cta">
            <button onClick={onOpenNavigator}>{t("hero.cta1")} ›</button>
            <button onClick={() => scrollTo("ap-features")}>{t("hero.cta2")} ›</button>
          </div>
          <div className="ap-planet" role="img" aria-label="A stylized planet of opportunities with a glowing atmosphere" />
        </div>
      </header>

      {/* features */}
      <section id="ap-features" className="ap-gray">
        <div className="ap-wrap ap-center">
          <h2 className="ap-h ap-pre ap-reveal">{t("features.heading")}</h2>
          <div className="ap-grid c4">
            {[
              { ic: "ap-ic-blue", g: "✦", k: "feat.1" },
              { ic: "ap-ic-green", g: "◎", k: "feat.2" },
              { ic: "ap-ic-purple", g: "◈", k: "feat.3" },
              { ic: "ap-ic-warm", g: "◍", k: "feat.4" },
            ].map((c) => (
              <article key={c.k} className="ap-card ap-reveal">
                <div className={`ic ${c.ic}`}>{c.g}</div>
                <h3 className="ap-pre">{t(`${c.k}.t`)}</h3>
                <p>{t(`${c.k}.d`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* YouPath */}
      <section id="ap-profori" className="ap-feat">
        <div className="ap-wrap">
          <p className="ap-eyebrow ap-reveal">{t("yp.eyebrow")}</p>
          <h2 className="k ap-reveal">{t("yp.t1")}<br /><span className="ap-gp">{t("yp.t2")}</span></h2>
          <p className="d ap-reveal">{t("yp.d")}</p>

          <div id="ap-report" className="ap-report ap-reveal">
            <div className="part">{t("rep.p1")}</div>
            <div className="row">{t("rep.r1")}</div>
            <div className="row">{t("rep.r2")}</div>
            <div className="part">{t("rep.p2")}</div>
            <div className="row">{t("rep.u1")}</div>
            <div className="row">{t("rep.u2")}</div>
            <div className="row muted">{t("rep.u3")}</div>
            <div className="part">{t("rep.p3")}</div>
            <div className="row muted">{t("rep.l")}</div>
            <div className="part">{t("rep.p4")}</div>
            <div><span className="ap-chip">How to Solve It · Pólya</span><span className="ap-chip">Algorithms · Sedgewick</span></div>
          </div>
        </div>
      </section>

      {/* deadlines */}
      <section className="ap-feat ap-gray">
        <div className="ap-wrap">
          <h2 className="k ap-reveal"><span className="ap-gb">{t("dl.t1")}</span><br />{t("dl.t2")}</h2>
          <p className="d ap-reveal">{t("dl.d")}</p>
          <div style={{ marginTop: 28 }}><button className="ap-link ap-reveal" onClick={onOpenPricing}>{t("dl.link")} ›</button></div>
        </div>
      </section>

      {/* level */}
      <section className="ap-feat">
        <div className="ap-wrap">
          <p className="ap-eyebrow ap-reveal">{t("lv.eyebrow")}</p>
          <h2 className="k ap-reveal">{t("lv.t1")}<br /><span className="ap-gg">{t("lv.t2")}</span></h2>
          <p className="d ap-reveal">{t("lv.d")}</p>
        </div>
      </section>

      {/* pricing */}
      <section id="ap-pricing" className="ap-gray">
        <div className="ap-wrap ap-center">
          <h2 className="ap-h ap-reveal">{t("pr.heading")}</h2>
          <p className="ap-lead ap-reveal" style={{ margin: "14px auto 0" }}>{t("pr.lead")}</p>
          <div className="ap-tiers">
            <div className="ap-tier ap-reveal">
              <div className="name">Free</div>
              <div className="price">0 ₸</div>
              <div className="per">{t("pr.free.per")}</div>
              <ul><li>{t("pr.free.f1")}</li><li>{t("pr.free.f2")}</li><li>{t("pr.free.f3")}</li></ul>
              <button className="ap-btn ap-btn-primary" onClick={onOpenPricing}>{t("pr.free.cta")}</button>
            </div>
            <div className="ap-tier hi ap-reveal">
              <span className="badge">{t("pr.plus.badge")}</span>
              <div className="name">Lumifield+</div>
              <div className="price">2 990 ₸</div>
              <div className="per">{t("pr.plus.per")}</div>
              <ul><li>{t("pr.plus.f1")}</li><li>{t("pr.plus.f2")}</li><li>{t("pr.plus.f3")}</li><li>{t("pr.plus.f4")}</li></ul>
              <button className="ap-btn ap-btn-primary" onClick={onOpenPricing}>{t("pr.plus.cta")}</button>
            </div>
            <div className="ap-tier ap-reveal">
              <div className="name">Lumifield Pro</div>
              <div className="price">24 900 ₸</div>
              <div className="per">{t("pr.pro.per")}</div>
              <ul><li>{t("pr.pro.f1")}</li><li>{t("pr.pro.f2")}</li><li>{t("pr.pro.f3")}</li><li>{t("pr.pro.f4")}</li></ul>
              <button className="ap-btn ap-btn-primary" onClick={onOpenPricing}>{t("pr.pro.cta")}</button>
            </div>
          </div>
        </div>
      </section>

      {/* final */}
      <section className="ap-final">
        <div className="ap-wrap">
          <h2 className="ap-reveal">{t("final.t")}</h2>
          <p className="ap-lead ap-reveal" style={{ color: "#a1a1a6", margin: "16px auto 0" }}>{t("final.lead")}</p>
          <div className="cta">
            <button className="ap-btn ap-btn-light ap-reveal" onClick={onOpenNavigator}>{t("final.cta1")}</button>
            <button className="ap-link ap-reveal" style={{ color: "#2997FF" }} onClick={onOpenPricing}>{t("final.cta2")} ›</button>
          </div>
        </div>
      </section>

      <footer className="ap-foot">
        <div className="ap-wrap">
          <span>{t("footer.note")}</span>
          <span>© 2026 Lumifield AI</span>
        </div>
      </footer>
    </div>
  )
}
