import { EXAMS, type ExamId, type ExamQ } from "@/data/exams"
import { UNIS, type Uni } from "@/data/universities"
import { type DirId } from "@/data/directions"

export type Answers = Record<number, number>

/** Готовность 0..1 по набору вопросов (учитывает вес сложности). */
export function readinessFromQuestions(questions: ExamQ[], answers: Answers): number {
  let got = 0, total = 0
  questions.forEach((q, i) => { total += q.w; if (answers[i] === q.correct) got += q.w })
  return total ? got / total : 0
}

/** То же для встроенного набора экзамена. */
export function readinessOf(examId: ExamId, answers: Answers): number {
  return readinessFromQuestions(EXAMS[examId].questions, answers)
}

export function levelLabel(examId: ExamId, readiness: number): string {
  const ex = EXAMS[examId]
  return `${ex.name} ≈ ${ex.toLevel(readiness)}`
}

export type UniChance = { uni: Uni; chance: number }

/**
 * Оценочная вероятность поступления. Модель демо: сравнивает готовность
 * ученика с селективностью вуза и учитывает совпадение направления.
 * Это ориентир, не гарантия.
 */
export function admissionChances(readiness: number, dir: DirId | null): UniChance[] {
  return UNIS.map((u) => {
    const dirMatch = dir ? u.dirs.includes(dir) : false
    const bonus = dirMatch ? 0.08 : -0.1
    let c = 0.1 + (readiness - u.sel) * 1.4 + bonus
    c = Math.max(0.02, Math.min(0.96, c))
    return { uni: u, chance: Math.round(c * 100) }
  }).sort((a, b) => b.chance - a.chance)
}

export function chanceTone(chance: number): "high" | "mid" | "low" {
  if (chance >= 55) return "high"
  if (chance >= 25) return "mid"
  return "low"
}
