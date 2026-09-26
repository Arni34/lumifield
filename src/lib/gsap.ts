// Единая точка подключения GSAP: плагины регистрируются один раз здесь,
// а компоненты импортируют { gsap, useGSAP } отсюда. С версии 3.13 все
// плагины (SplitText, MorphSVG, DrawSVG…) бесплатны и лежат в самом пакете.
//
// Импортируем ESM-пути ("gsap/ScrollTrigger"), а не "gsap/dist/…": во Vite
// ESM корректно тришейкается, dist — UMD-сборки для Next/CommonJS.
//
// Не подключаем намеренно: GSDevTools и MotionPathHelper (отладочные панели),
// PixiPlugin и EaselPlugin (для canvas-движков, у нас их нет), ScrollSmoother
// (перехватывает нативный скролл — ломает sticky-шапку и нижнее меню).

import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

import { CustomEase } from "gsap/CustomEase"
import { CustomBounce } from "gsap/CustomBounce"   // требует CustomEase
import { CustomWiggle } from "gsap/CustomWiggle"   // требует CustomEase
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack"

import { Draggable } from "gsap/Draggable"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { Flip } from "gsap/Flip"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { Observer } from "gsap/Observer"
import { Physics2DPlugin } from "gsap/Physics2DPlugin"
import { PhysicsPropsPlugin } from "gsap/PhysicsPropsPlugin"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { SplitText } from "gsap/SplitText"
import { TextPlugin } from "gsap/TextPlugin"

gsap.registerPlugin(
  useGSAP,
  CustomEase, CustomBounce, CustomWiggle, RoughEase, ExpoScaleEase, SlowMo,
  Draggable, DrawSVGPlugin, Flip, InertiaPlugin, MotionPathPlugin, MorphSVGPlugin,
  Observer, Physics2DPlugin, PhysicsPropsPlugin, ScrambleTextPlugin,
  ScrollTrigger, ScrollToPlugin, SplitText, TextPlugin,
)

export {
  gsap, useGSAP,
  CustomEase, CustomBounce, CustomWiggle,
  Draggable, DrawSVGPlugin, Flip, InertiaPlugin, MotionPathPlugin, MorphSVGPlugin,
  Observer, Physics2DPlugin, PhysicsPropsPlugin, ScrambleTextPlugin,
  ScrollTrigger, ScrollToPlugin, SplitText, TextPlugin,
}

// В dev выставляем gsap в window — удобно смотреть таймлайны из консоли.
if (import.meta.env.DEV) (window as unknown as { gsap: typeof gsap }).gsap = gsap
