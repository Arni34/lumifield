// Картинка для сторис (1080×1920) в фирменном стиле — рисуем на canvas.
// Instagram не принимает текст по ссылке, поэтому единственный рабочий путь:
// сгенерировать изображение и отдать его в системный «Поделиться» либо скачать.
const W = 1080, H = 1920
const PAPER = "#FAF8F7", INK = "#14100E", BRAND = "#E03A16", MUTED = "#6E635F"

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number): string[] => {
  const out: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    const probe = line ? `${line} ${word}` : word
    if (ctx.measureText(probe).width > max && line) { out.push(line); line = word } else line = probe
  }
  if (line) out.push(line)
  return out
}

/** Эмблема: искра над постаментом — тот же силуэт, что в логотипе. */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 120, s / 120); ctx.fillStyle = BRAND
  const p = new Path2D("M60 2 L69.5 40.5 L108 50 L69.5 59.5 L60 98 L50.5 59.5 L12 50 L50.5 40.5 Z M60 33 L47 50 L60 67 L73 50 Z")
  ctx.fill(p, "evenodd")
  ctx.fill(new Path2D("M60 110 L75 174 L45 174 Z"))
  ctx.fill(new Path2D("M43 132 L18 174 L41 174 Z"))
  ctx.fill(new Path2D("M77 132 L102 174 L79 174 Z"))
  ctx.restore()
}

export async function buildStoryCard(opts: { heading: string; direction?: string; tagline: string }): Promise<Blob | null> {
  try {
    // Шрифты уже подключены на странице — дожидаемся, иначе canvas возьмёт системный.
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready
    const c = document.createElement("canvas")
    c.width = W; c.height = H
    const ctx = c.getContext("2d")
    if (!ctx) return null

    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = BRAND; ctx.fillRect(0, 0, W, 26)              // фирменная полоса
    ctx.strokeStyle = INK; ctx.lineWidth = 10                      // рамка-«брутал»
    ctx.strokeRect(56, 96, W - 112, H - 200)

    let y = 420
    ctx.textBaseline = "alphabetic"
    ctx.font = '900 104px "Inter Tight", system-ui, sans-serif'
    ctx.fillStyle = INK
    for (const l of wrap(ctx, opts.heading.toUpperCase(), W - 240)) { ctx.fillText(l, 120, y); y += 112 }

    if (opts.direction) {
      y += 40
      ctx.font = '600 34px "IBM Plex Mono", ui-monospace, monospace'
      ctx.fillStyle = MUTED
      ctx.fillText("НАПРАВЛЕНИЕ", 120, y); y += 74
      ctx.font = '900 76px "Inter Tight", system-ui, sans-serif'
      ctx.fillStyle = BRAND
      for (const l of wrap(ctx, opts.direction.toUpperCase(), W - 240)) { ctx.fillText(l, 120, y); y += 84 }
    }

    y += 56
    ctx.font = '400 40px "IBM Plex Sans", system-ui, sans-serif'
    ctx.fillStyle = MUTED
    for (const l of wrap(ctx, opts.tagline, W - 240)) { ctx.fillText(l, 120, y); y += 54 }

    drawMark(ctx, 120, H - 320, 120)                               // подпись внизу
    ctx.font = '900 56px "Inter Tight", system-ui, sans-serif'
    ctx.fillStyle = INK; ctx.fillText("LUMIFIELD AI", 280, H - 250)
    ctx.font = '600 34px "IBM Plex Mono", ui-monospace, monospace'
    ctx.fillStyle = BRAND; ctx.fillText("lumifield.app", 280, H - 196)

    return await new Promise((res) => c.toBlob((b) => res(b), "image/png"))
  } catch { return null }
}
