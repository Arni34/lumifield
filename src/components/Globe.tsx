import { useEffect, useRef } from "react"
import * as THREE from "three"

export type Marker = { lat: number; lng: number; color: string; active?: boolean }

function toVec(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

// ── процедурная текстура планеты (океан + суша + ледники), без внешних ассетов ──
function hash(x: number, y: number) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n) }
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  const tl = hash(xi, yi), tr = hash(xi + 1, yi), bl = hash(xi, yi + 1), br = hash(xi + 1, yi + 1)
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  return tl * (1 - u) * (1 - v) + tr * u * (1 - v) + bl * (1 - u) * v + br * u * v
}
function fbm(x: number, y: number) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 6; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= 0.5 } return s }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function makeEarthTexture(dark: boolean): THREE.CanvasTexture {
  const W = 1024, H = 512
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H
  const ctx = cv.getContext("2d")!
  const img = ctx.createImageData(W, H)
  const oD = dark ? 12 : 20, oS = dark ? 70 : 120 // яркость океана deep/shallow
  for (let y = 0; y < H; y++) {
    const lat = (y / H - 0.5) * 2 // -1..1
    const ice = Math.max(0, (Math.abs(lat) - 0.82) / 0.18) // шапки у полюсов
    for (let x = 0; x < W; x++) {
      // бесшовно по долготе: сэмплим шум по окружности
      const th = (x / W) * Math.PI * 2
      const nx = Math.cos(th) * 2.2 + 4, nz = Math.sin(th) * 2.2 + 4
      const e = fbm(nx * 1.6, (y / H) * 6 + nz * 0.15) // «высота»
      let r: number, g: number, b: number
      if (e > 0.52) { // суша
        const t = Math.min(1, (e - 0.52) / 0.33)
        r = lerp(46, 120, t); g = lerp(110, 96, t); b = lerp(58, 60, t) // зелень→охра
        if (e > 0.8) { r = lerp(120, 150, (e - 0.8) / 0.2); g = lerp(96, 140, (e - 0.8) / 0.2); b = lerp(60, 150, (e - 0.8) / 0.2) } // горы/снег
      } else { // океан
        const t = e / 0.52
        r = lerp(oD * 0.6, oS * 0.5, t); g = lerp(oD * 1.6, oS * 1.4, t); b = lerp(oD * 3.2, oS * 2.0, t)
      }
      // ледники
      r = lerp(r, 235, ice); g = lerp(g, 240, ice); b = lerp(b, 245, ice)
      const i = (y * W + x) * 4
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function Globe({ markers, onSelect }: { markers: Marker[]; onSelect?: (i: number | null) => void }) {
  const mount = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect

  useEffect(() => {
    const el = mount.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dark = document.documentElement.classList.contains("dark")

    const R = 1.6
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.3, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none" })

    // свет — планета выглядит объёмной
    scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.5 : 0.75))
    const sun = new THREE.DirectionalLight(0xffffff, 1.15)
    sun.position.set(-3, 2, 4)
    scene.add(sun)

    const world = new THREE.Group()
    world.rotation.z = 0.32
    world.rotation.x = 0.15
    scene.add(world)

    // планета: сразу процедурная текстура, затем подменяем на фото Земли, когда загрузится
    const mat = new THREE.MeshStandardMaterial({ map: makeEarthTexture(dark), roughness: 0.75, metalness: 0.03 })
    const planet = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), mat)
    world.add(planet)
    new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}earth.jpg`,
      (tex) => { tex.colorSpace = THREE.SRGBColorSpace; const old = mat.map; mat.map = tex; mat.needsUpdate = true; old?.dispose() },
      undefined,
      () => { /* фото недоступно — остаётся процедурная */ },
    )

    // атмосфера
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.16, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x4bb8e0, transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
    )
    world.add(atmo)

    // маркеры целей
    const pins: THREE.Mesh[] = []
    for (const m of markers) {
      const p = toVec(m.lat, m.lng, R * 1.03)
      const col = new THREE.Color(m.color)
      const pin = new THREE.Mesh(new THREE.SphereGeometry(m.active ? 0.055 : 0.04, 12, 12), new THREE.MeshBasicMaterial({ color: col }))
      pin.position.copy(p); world.add(pin); pins.push(pin)
      const halo = new THREE.Mesh(new THREE.SphereGeometry((m.active ? 0.055 : 0.04) * 2.6, 12, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending }))
      halo.position.copy(p); world.add(halo)
    }

    function resize() {
      const w = el!.clientWidth, h = el!.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // ── drag-to-rotate + инерция + клик по маркеру ──
    let dragging = false
    let lastX = 0, lastY = 0, downX = 0, downY = 0
    let velY = reduce ? 0 : 0.0022
    let velX = 0
    const dom = renderer.domElement
    const ray = new THREE.Raycaster()
    ray.params.Points = { threshold: 0.05 }
    const down = (e: PointerEvent) => { dragging = true; lastX = downX = e.clientX; lastY = downY = e.clientY; velY = 0; velX = 0; dom.style.cursor = "grabbing"; dom.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX, dy = e.clientY - lastY
      lastX = e.clientX; lastY = e.clientY
      velY = dx * 0.005; velX = dy * 0.005
      world.rotation.y += velY; world.rotation.x = Math.max(-1.1, Math.min(1.1, world.rotation.x + velX))
    }
    const up = (e: PointerEvent) => {
      dragging = false; dom.style.cursor = "grab"
      // почти без движения → трактуем как клик и ищем маркер под курсором
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6 && selectRef.current) {
        const r = dom.getBoundingClientRect()
        const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
        ray.setFromCamera(ndc, camera)
        const hit = ray.intersectObjects(pins, false)[0]
        selectRef.current(hit ? pins.indexOf(hit.object as THREE.Mesh) : null)
      }
    }
    const leave = () => { dragging = false; dom.style.cursor = "grab" }
    dom.addEventListener("pointerdown", down)
    dom.addEventListener("pointermove", move)
    dom.addEventListener("pointerup", up)
    dom.addEventListener("pointerleave", leave)

    let raf = 0, t = 0
    const tick = () => {
      t += 0.016
      if (!dragging) {
        world.rotation.y += velY
        world.rotation.x = Math.max(-1.1, Math.min(1.1, world.rotation.x + velX))
        velX *= 0.94
        if (Math.abs(velY) > (reduce ? 0 : 0.0022)) velY *= 0.96          // затухание броска
        else velY = reduce ? 0 : 0.0022                                    // база авто-вращения
      }
      const s = 1 + Math.sin(t * 2) * 0.06
      pins.forEach((p) => p.scale.setScalar(s))
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      dom.removeEventListener("pointerdown", down)
      dom.removeEventListener("pointermove", move)
      dom.removeEventListener("pointerup", up)
      dom.removeEventListener("pointerleave", leave)
      renderer.dispose()
      mat.map?.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [markers])

  return <div ref={mount} className="h-full w-full" />
}
