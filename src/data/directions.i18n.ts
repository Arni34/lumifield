import { type DirId } from "@/data/directions"

// Переводы направлений (EN / KZ). RU — исходные поля в directions.ts.
type DT = { title: string; tagline: string; d: string }

export const DIR_TR: Record<DirId, { en: DT; kz: DT }> = {
  it: {
    en: { title: "IT & software", tagline: "Code, apps, artificial intelligence", d: "You create through code: websites, apps, AI. A high-demand field with a fast entry — you can build projects while still in school." },
    kz: { title: "IT және әзірлеу", tagline: "Код, қолданбалар, жасанды интеллект", d: "Сен код арқылы жасайсың: сайттар, қолданбалар, ЖИ. Тез кіретін сұранысты бағыт — жобаларды мектепте-ақ жинауға болады." },
  },
  eng: {
    en: { title: "Engineering & robotics", tagline: "Hardware, robots, how things work", d: "You like building and fixing in the physical world: robots, electronics, mechanisms. The path runs through physics olympiads and robotics leagues." },
    kz: { title: "Инженерия және робототехника", tagline: "Темір, роботтар, заттардың құрылысы", d: "Саған физикалық әлемде құрастырып, жөндеу қызық: роботтар, электроника, механизмдер. Жол физика олимпиадалары мен робо-лигалар арқылы." },
  },
  sci: {
    en: { title: "Natural sciences", tagline: "Physics, chemistry, biology, space", d: "You want to understand how the world works and test it by experiment. A strong base for science and medicine — it starts with olympiads and summer schools." },
    kz: { title: "Жаратылыстану ғылымдары", tagline: "Физика, химия, биология, ғарыш", d: "Сен әлемнің қалай жұмыс істейтінін түсініп, оны тәжірибемен тексергің келеді. Ғылым мен медицинаға мықты негіз — олимпиада мен жазғы мектептен басталады." },
  },
  math: {
    en: { title: "Math & Data", tagline: "Logic, problems, data analysis", d: "You enjoy pure logic and elegant problems. Math is the key to CS, economics and science. Your springboard is subject olympiads." },
    kz: { title: "Математика және Data", tagline: "Логика, есептер, деректерді талдау", d: "Саған таза логика мен әсем есептер ұнайды. Математика — CS, экономика мен ғылымның кілті. Трамплиның — пәндік олимпиадалар." },
  },
  biz: {
    en: { title: "Business & entrepreneurship", tagline: "Ideas, products, startups, money", d: "You come up with ideas and want to turn them into a business. This field is about launching projects, pitching and leadership — leveled up at startup contests." },
    kz: { title: "Бизнес және кәсіпкерлік", tagline: "Идеялар, өнімдер, стартаптар, ақша", d: "Сен идея ойлап тауып, оны іске асырғың келеді. Бұл бағыт — жобаларды іске қосу, питч және көшбасшылық — стартап байқауларында дамиды." },
  },
  soc: {
    en: { title: "Society & international relations", tagline: "Law, politics, diplomacy, debate", d: "People, justice and persuasion matter to you. The path to lawyers, diplomats and leaders — through debate, MUN and exchanges." },
    kz: { title: "Қоғам және халықаралық қатынастар", tagline: "Құқық, саясат, дипломатия, дебат", d: "Саған адамдар, әділдік және сендіру маңызды. Заңгер, дипломат және көшбасшыларға жол — дебат, MUN және алмасулар арқылы." },
  },
  med: {
    en: { title: "Medicine & health sciences", tagline: "Help people, biology, health", d: "You want to help people directly and biology is close to you. The base is strong chemistry and biology plus research summer programs." },
    kz: { title: "Медицина және денсаулық ғылымдары", tagline: "Адамдарға көмек, биология, денсаулық", d: "Сен адамдарға тікелей көмектескің келеді әрі саған биология жақын. Негізі — мықты химия мен биология және зерттеу жазғы бағдарламалары." },
  },
  design: {
    en: { title: "Design & creativity", tagline: "Visual, product, self-expression", d: "You create through image and form: design, media, product. It pairs well with IT (product design) and entrepreneurship." },
    kz: { title: "Дизайн және шығармашылық", tagline: "Визуал, өнім, өзін таныту", d: "Сен образ бен форма арқылы жасайсың: дизайн, медиа, өнім. IT-мен (өнім дизайны) және кәсіпкерлікпен жақсы үйлеседі." },
  },
}
