// Диагностические мини-тесты в духе MAP: вопросы разной сложности (вес w).
// Не полноценный экзамен — оценивает ПРИМЕРНЫЙ уровень для прикидки шансов.
export type ExamId = "ielts" | "sat" | "hsk"

export type ExamQ = { q: string; options: string[]; correct: number; w: number }

export type Exam = {
  id: ExamId
  name: string
  unit: string
  blurb: string
  questions: ExamQ[]
  toLevel: (readiness: number) => string
}

export const EXAMS: Record<ExamId, Exam> = {
  ielts: {
    id: "ielts", name: "IELTS", unit: "band", blurb: "Английский язык (0–9)",
    toLevel: (r) => (4 + r * 5).toFixed(1),
    questions: [
      { w: 1, q: "Choose the correct form: “She ___ to school every day.”", options: ["go", "goes", "going", "gone"], correct: 1 },
      { w: 1, q: "Pick the synonym of “rapid”.", options: ["slow", "quick", "heavy", "quiet"], correct: 1 },
      { w: 2, q: "“If I ___ more time, I would travel.”", options: ["have", "had", "has", "having"], correct: 1 },
      { w: 2, q: "Choose the best word: “The results were ___ with our hypothesis.”", options: ["consistent", "consist", "consisting", "consistence"], correct: 0 },
      { w: 3, q: "Which sentence is grammatically correct?", options: ["Neither of them were ready.", "Neither of them was ready.", "Neither of them are ready.", "Neither of them been ready."], correct: 1 },
      { w: 3, q: "“Despite ___ hard, he failed.” Complete correctly.", options: ["to work", "working", "he worked", "works"], correct: 1 },
    ],
  },
  sat: {
    id: "sat", name: "SAT", unit: "score", blurb: "Математика + чтение (400–1600)",
    toLevel: (r) => String(Math.round((900 + r * 700) / 10) * 10),
    questions: [
      { w: 1, q: "If 3x = 12, then x = ?", options: ["2", "3", "4", "6"], correct: 2 },
      { w: 1, q: "What is 15% of 200?", options: ["15", "30", "45", "20"], correct: 1 },
      { w: 2, q: "If f(x)=2x+1, then f(5) = ?", options: ["10", "11", "12", "9"], correct: 1 },
      { w: 2, q: "A line has slope 2 through (0,3). Its equation:", options: ["y=2x", "y=3x+2", "y=2x+3", "y=x+3"], correct: 2 },
      { w: 3, q: "If x²−5x+6=0, the roots are:", options: ["1 and 6", "2 and 3", "−2 and −3", "0 and 5"], correct: 1 },
      { w: 3, q: "The average of 5 numbers is 20. Their sum is:", options: ["25", "100", "40", "400"], correct: 1 },
    ],
  },
  hsk: {
    id: "hsk", name: "HSK", unit: "уровень", blurb: "Китайский язык (1–6)",
    toLevel: (r) => String(Math.max(1, Math.round(1 + r * 5))),
    questions: [
      { w: 1, q: "«你好» означает:", options: ["Спасибо", "Привет", "Пока", "Да"], correct: 1 },
      { w: 1, q: "Число «三» — это:", options: ["1", "2", "3", "10"], correct: 2 },
      { w: 2, q: "«谢谢» означает:", options: ["Извини", "Пожалуйста", "Спасибо", "Привет"], correct: 2 },
      { w: 2, q: "«我是学生» переводится как:", options: ["Я учитель", "Я студент", "Ты студент", "Он врач"], correct: 1 },
      { w: 3, q: "Выбери верное: «他 ___ 中文» (говорит по-китайски)", options: ["说", "吃", "看", "买"], correct: 0 },
      { w: 3, q: "«因为…所以…» выражает:", options: ["условие", "причину–следствие", "время", "место"], correct: 1 },
    ],
  },
}

export const EXAM_LIST = Object.values(EXAMS)
