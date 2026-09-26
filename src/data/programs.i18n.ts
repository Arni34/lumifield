// Переводы контента карточек программ (EN / KZ). RU — исходные поля в programs.ts.
// Резолвится в ProgramCard по текущему языку из useI18n(). Названия (t), орг,
// теги и числовой возраст не переводим; age указываем только где он текстовый.
type PT = { d: string; loc: string; dl: string; age?: string }

export const PROG_TR: Record<string, { en: PT; kz: PT }> = {
  "swift-student-challenge": {
    en: { d: "Build an interactive project in Swift Playgrounds — winners go to Apple's WWDC.", loc: "Worldwide", dl: "Annually, late February" },
    kz: { d: "Swift Playgrounds-та интерактивті жоба жаса — жеңімпаздар Apple WWDC-ге барады.", loc: "Бүкіл әлем", dl: "Жыл сайын, ақпан соңы" },
  },
  "apple-developer-program": {
    en: { d: "Publish your apps on the App Store and get access to Apple's beta tools.", loc: "Worldwide", dl: "Year-round · $99/year" },
    kz: { d: "Қолданбаларыңды App Store-да жарияла әрі Apple бета-құралдарына қол жеткіз.", loc: "Бүкіл әлем", dl: "Жыл бойы · $99/жыл" },
  },
  "samsung-innovation-campus": {
    en: { d: "Free courses in AI, Python, IoT and Big Data with a Samsung certificate.", loc: "Kazakhstan + world", dl: "Intake for the autumn semester" },
    kz: { d: "AI, Python, IoT және Big Data бойынша тегін курстар, Samsung сертификатымен.", loc: "Қазақстан + әлем", dl: "Күзгі семестрге қабылдау" },
  },
  "microsoft-imagine-cup": {
    en: { d: "A global tech startup competition with prizes and mentorship from Microsoft.", loc: "Worldwide", dl: "Annually, ~Jan 9" },
    kz: { d: "Жүлделері мен Microsoft менторлығы бар жаһандық стартап технологиялық байқауы.", loc: "Бүкіл әлем", dl: "Жыл сайын, ~9 қаңтар" },
  },
  "nasa-space-apps": {
    en: { d: "The world's largest hackathon on NASA data — with a site in Kazakhstan.", loc: "Almaty + online", dl: "Nov 14–15, 2026" },
    kz: { d: "NASA деректеріндегі әлемдегі ең ірі хакатон — Қазақстанда алаңы бар.", loc: "Алматы + онлайн", dl: "2026 ж. 14–15 қараша" },
  },
  "harvard-cs50": {
    en: { d: "Harvard's legendary intro CS course — free, certificate optional.", loc: "Online", dl: "Start anytime" },
    kz: { d: "Гарвардтың атақты кіріспе CS курсы — тегін, сертификат қалауыңша.", loc: "Онлайн", dl: "Кез келген уақытта бастау" },
  },
  "mit-ocw": {
    en: { d: "Full MIT courses — lectures, assignments and materials — open and free.", loc: "Online", dl: "Year-round" },
    kz: { d: "MIT-тің толық курстары — дәрістер, тапсырмалар мен материалдар — ашық әрі тегін.", loc: "Онлайн", dl: "Жыл бойы" },
  },
  "coursera-financial-aid": {
    en: { d: "Thousands of courses from top universities; get the certificate free via Financial Aid.", loc: "Online", dl: "Year-round" },
    kz: { d: "Үздік университеттердің мыңдаған курсы; сертификатты Financial Aid арқылы тегін ал.", loc: "Онлайн", dl: "Жыл бойы" },
  },
  "yale-young-global-scholars": {
    en: { d: "A two-week summer academy at Yale for the world's strongest high schoolers.", loc: "USA (Yale)", dl: "EA ~Oct 15 / RD ~Jan 7 · aid" },
    kz: { d: "Йельдегі екі апталық жазғы академия — әлемнің үздік мектеп оқушыларына.", loc: "АҚШ (Yale)", dl: "EA ~15 қаз / RD ~7 қаң · стипендия" },
  },
  "launchx": {
    en: { d: "A summer program: launch a real startup with a team and mentors over the summer.", loc: "Online / USA", dl: "Priority ~Nov 12 · final ~Mar 4" },
    kz: { d: "Жазғы бағдарлама: жаз бойы командамен және менторлармен нақты стартап бастап көр.", loc: "Онлайн / АҚШ", dl: "Басымдық ~12 қар · финал ~4 нау" },
  },
  "technovation-girls": {
    en: { d: "Girls build a mobile app solving a social problem in 12 weeks.", loc: "Worldwide", dl: "Submission ~Apr 20" },
    kz: { d: "Қыздар 12 аптада әлеуметтік мәселені шешетін мобильді қолданба жасайды.", loc: "Бүкіл әлем", dl: "Тапсыру ~20 сәуір" },
  },
  "world-scholars-cup": {
    en: { d: "A team academic tournament: debate, essays, quizzes — a path to the Global Round.", loc: "Rounds in Kazakhstan", dl: "Rounds year-round" },
    kz: { d: "Командалық академиялық турнир: дебат, эссе, викториналар — Global Round-қа жол.", loc: "Раундтар Қазақстанда", dl: "Раундтар жыл бойы" },
  },
  "conrad-challenge": {
    en: { d: "A team innovation contest: solve a global problem with a business idea.", loc: "Worldwide", dl: "Innovation stage ~Jan 8" },
    kz: { d: "Командалық инновациялық байқау: жаһандық мәселені бизнес-идеямен шеш.", loc: "Бүкіл әлем", dl: "Innovation кезеңі ~8 қаңтар" },
  },
  "diamond-challenge": {
    en: { d: "An international entrepreneurship contest for students with a $100k prize pool.", loc: "Worldwide", dl: "~Jan 15" },
    kz: { d: "Мектеп оқушыларына арналған халықаралық кәсіпкерлік байқауы, $100k жүлде қорымен.", loc: "Бүкіл әлем", dl: "~15 қаңтар" },
  },
  "flex-exchange": {
    en: { d: "A fully free year of study at an American school with a host family.", loc: "USA (a year)", dl: "Applications: Sep–Oct" },
    kz: { d: "Америка мектебінде отбасында тұрумен толық тегін бір жыл оқу.", loc: "АҚШ (бір жыл)", dl: "Қабылдау: қыркүйек–қазан" },
  },
  "first-robotics": {
    en: { d: "An international robotics league — build a robot and compete as a team.", loc: "World + teams in KZ", dl: "Season: autumn–spring" },
    kz: { d: "Халықаралық робототехника лигасы — робот жаса әрі командамен жарыс.", loc: "Әлем + KZ командалары", dl: "Маусым: күз–көктем" },
  },
  "duke-of-edinburgh-award": {
    en: { d: "A world-recognized development program through skills, sport and volunteering.", loc: "Available in Kazakhstan", dl: "Join year-round" },
    kz: { d: "Дағды, спорт және волонтёрлік арқылы дамудың әлемге танылған бағдарламасы.", loc: "Қазақстанда бар", dl: "Жыл бойы қосылуға болады" },
  },
  "uwc-scholarship": {
    en: { d: "A two-year International Baccalaureate scholarship at a UWC college.", loc: "Colleges worldwide", dl: "Apply by ~Jan 5 (KZ)" },
    kz: { d: "UWC колледждерінің бірінде екі жылдық International Baccalaureate стипендиясы.", loc: "Әлемдегі колледждер", dl: "Өтініш ~5 қаңтарға дейін (KZ)" },
  },
  "harvard-mun": {
    en: { d: "The largest Model UN: diplomacy, debate and negotiation in English.", loc: "USA / online", dl: "Reg: Sep–Oct (conf. Jan 2027)" },
    kz: { d: "Ең ірі БҰҰ моделі: ағылшын тілінде дипломатия, дебат және келіссөз.", loc: "АҚШ / онлайн", dl: "Тіркеу: қыр–қаз (конф. қаң 2027)" },
  },
  "respublikanskie-olimpiady": {
    en: { d: "Official subject olympiads: the path from school to the national round.", loc: "Kazakhstan", dl: "School round: Oct–Nov", age: "grades 9–11" },
    kz: { d: "Пәндік ресми олимпиадалар: мектептен республикалық турға дейінгі жол.", loc: "Қазақстан", dl: "Мектеп туры: қаз–қар", age: "9–11 сынып" },
  },
  "astana-daryny-otbor": {
    en: { d: "National training and the path to IMO, IOI, IPhO and other world olympiads.", loc: "Kazakhstan → world", dl: "Selections: winter–spring" },
    kz: { d: "Ұлттық жиындар және IMO, IOI, IPhO және басқа әлемдік олимпиадаларға жол.", loc: "Қазақстан → әлем", dl: "Іріктеу: қыс–көктем" },
  },
  "nfactorial-incubator": {
    en: { d: "An intensive summer dev bootcamp — competitive selection, fully free.", loc: "Almaty", dl: "Selection: spring" },
    kz: { d: "Қарқынды жазғы әзірлеу буткемпі — конкурстық іріктеу, толық тегін.", loc: "Алматы", dl: "Іріктеу: көктем" },
  },
  "astana-hub-hackathons": {
    en: { d: "Tech hackathons and meetups of Central Asia's largest IT hub.", loc: "Astana / online", dl: "Several times a year" },
    kz: { d: "Орталық Азиядағы ең ірі IT-хабтың технологиялық хакатондары мен митаптары.", loc: "Астана / онлайн", dl: "Жылына бірнеше рет" },
  },
  "alem-school": {
    en: { d: "A free peer-to-peer programming school — no lectures, no teachers.", loc: "Astana", dl: "'Pool' selection: several times a year" },
    kz: { d: "Peer-to-peer моделі бойынша тегін бағдарламалау мектебі — дәрісіз, оқытушысыз.", loc: "Астана", dl: "«Бассейн» іріктеуі: жылына бірнеше рет" },
  },
  "kolesa-academy": {
    en: { d: "A free IT school: development, design, analytics, management with job placement.", loc: "Almaty", dl: "Intake: ~May–Jul" },
    kz: { d: "Тегін IT-мектеп: әзірлеу, дизайн, аналитика, менеджмент, жұмысқа орналастырумен.", loc: "Алматы", dl: "Қабылдау: ~мамыр–шілде" },
  },
  "bolashak": {
    en: { d: "A presidential scholarship to study at the world's best universities.", loc: "Study abroad", dl: "Intake: Mar 16 – Oct 16, 2026" },
    kz: { d: "Әлемнің үздік университеттерінде оқуға президенттік стипендия.", loc: "Шетелде оқу", dl: "Қабылдау: 2026 ж. 16 нау – 16 қаз" },
  },
  "qazvolunteer": {
    en: { d: "Kazakhstan's official volunteering platform — projects, hours and certificates for your portfolio.", loc: "All of Kazakhstan", dl: "Projects year-round" },
    kz: { d: "ҚР ресми волонтёрлік платформасы — портфолиоға арналған жобалар, сағаттар мен сертификаттар.", loc: "Бүкіл Қазақстан", dl: "Жобалар жыл бойы" },
  },
  "el-umiti": {
    en: { d: "Support for talented students from vulnerable families — scholarships and mentorship.", loc: "Kazakhstan", dl: "Intake: spring (check)", age: "high schoolers" },
    kz: { d: "Әлеуметтік осал отбасылардан шыққан талантты оқушыларға қолдау — стипендия мен менторлық.", loc: "Қазақстан", dl: "Қабылдау: көктем (нақтылаңыз)", age: "жоғары сынып оқушылары" },
  },
  "british-council-kz": {
    en: { d: "English courses, IELTS prep and international education contests.", loc: "Almaty / Astana", dl: "Year-round" },
    kz: { d: "Ағылшын тілі курстары, IELTS-ке дайындық және халықаралық білім байқаулары.", loc: "Алматы / Астана", dl: "Жыл бойы" },
  },
  "luma-events": {
    en: { d: "A live board of meetups, workshops and hackathons of Kazakhstan's tech scene.", loc: "Almaty / Astana", dl: "New events every week" },
    kz: { d: "Қазақстан тех-қауымдастығының митаптары, воркшоптары мен хакатондарының тірі афишасы.", loc: "Алматы / Астана", dl: "Апта сайын жаңа оқиғалар" },
  },
  "freecodecamp": {
    en: { d: "Free certifications in web dev, JavaScript and data analysis with practice.", loc: "Online", dl: "Start anytime" },
    kz: { d: "Веб-әзірлеу, JavaScript және деректерді талдау бойынша практикамен тегін сертификаттар.", loc: "Онлайн", dl: "Кез келген уақытта бастау" },
  },
  "khan-academy": {
    en: { d: "Free courses in math, physics, programming and SAT prep.", loc: "Online", dl: "Year-round" },
    kz: { d: "Математика, физика, бағдарламалау және SAT-қа дайындық бойынша тегін курстар.", loc: "Онлайн", dl: "Жыл бойы" },
  },
  "kaggle": {
    en: { d: "Machine-learning competitions on real data — a strong line in your portfolio.", loc: "Online", dl: "Competitions year-round" },
    kz: { d: "Нақты деректердегі машиналық оқыту жарыстары — портфолиодағы күшті жол.", loc: "Онлайн", dl: "Жарыстар жыл бойы" },
  },
  "github-student-pack": {
    en: { d: "Free access to dozens of paid developer tools for students.", loc: "Online", dl: "Year-round" },
    kz: { d: "Студенттерге ондаған ақылы әзірлеуші құралына тегін қол жеткізу.", loc: "Онлайн", dl: "Жыл бойы" },
  },
  "mlh": {
    en: { d: "The largest student hackathon league — hundreds of online events a year.", loc: "Online / world", dl: "Hackathons every week" },
    kz: { d: "Ең ірі студенттік хакатон лигасы — жылына жүздеген онлайн оқиға.", loc: "Онлайн / әлем", dl: "Хакатондар апта сайын" },
  },
  "breakthrough-junior-challenge": {
    en: { d: "Make a video explaining a science idea — a prize up to $250k for education.", loc: "Worldwide", dl: "~Sep 15" },
    kz: { d: "Ғылыми идеяны түсіндіретін видео түсір — білімге $250k-ға дейін жүлде.", loc: "Бүкіл әлем", dl: "~15 қыркүйек" },
  },
  "john-locke-essay": {
    en: { d: "A prestigious essay contest across 7 disciplines — strong for a humanities portfolio.", loc: "Worldwide", dl: "Essay by ~May 31", age: "under 18" },
    kz: { d: "7 пән бойынша беделді эссе байқауы — гуманитарлық портфолио үшін күшті.", loc: "Бүкіл әлем", dl: "Эссе ~31 мамырға дейін", age: "18-ге дейін" },
  },
  "regeneron-isef": {
    en: { d: "The world's largest student science fair — via national project selection.", loc: "Final in the USA", dl: "Via science-project selection" },
    kz: { d: "Әлемдегі ең ірі мектеп оқушыларының ғылыми жәрмеңкесі — ұлттық жобалық іріктеу арқылы.", loc: "Финал АҚШ-та", dl: "Ғылыми жоба іріктеуі арқылы" },
  },
  "world-robot-olympiad": {
    en: { d: "An international robotics olympiad with a national stage in Kazakhstan.", loc: "World + stages in KZ", dl: "Season: spring–autumn" },
    kz: { d: "Қазақстанда ұлттық кезеңі бар халықаралық робототехника олимпиадасы.", loc: "Әлем + KZ кезеңдері", dl: "Маусым: көктем–күз" },
  },
  "aiesec": {
    en: { d: "Youth volunteering and leadership internships abroad from the largest student org.", loc: "Available in Kazakhstan", dl: "Intake year-round" },
    kz: { d: "Ең ірі студенттік ұйымнан шетелдегі жастар волонтёрлік және көшбасшылық тәжірибелері.", loc: "Қазақстанда бар", dl: "Қабылдау жыл бойы" },
  },
  "stanford-precollegiate": {
    en: { d: "Stanford's summer academic courses for high schoolers worldwide.", loc: "USA (Stanford)", dl: "~Mar 13" },
    kz: { d: "Стэнфордтың бүкіл әлемдегі мектеп оқушыларына арналған жазғы академиялық курстары.", loc: "АҚШ (Stanford)", dl: "~13 наурыз" },
  },
  "harvard-precollege": {
    en: { d: "Two-week intensives at Harvard — campus life and elective courses.", loc: "USA (Harvard)", dl: "EA ~Jan 7 / reg ~Feb 11" },
    kz: { d: "Гарвардтағы екі апталық интенсивтер — кампус өмірі және таңдау курстары.", loc: "АҚШ (Harvard)", dl: "EA ~7 қаң / тіркеу ~11 ақп" },
  },
  "girls-who-code": {
    en: { d: "Free coding programs for girls — clubs and online courses.", loc: "Online", dl: "Clubs and courses all year" },
    kz: { d: "Қыздарға арналған тегін бағдарламалау бағдарламалары — клубтар мен онлайн курстар.", loc: "Онлайн", dl: "Клубтар мен курстар жыл бойы" },
  },
  "immerse-essay": {
    en: { d: "An essay contest with a chance to win a scholarship to a summer program at Cambridge or Oxford.", loc: "Worldwide", dl: "Rounds: September and January" },
    kz: { d: "Кембридж не Оксфордтағы жазғы бағдарламаға стипендия ұтуға мүмкіндік беретін эссе байқауы.", loc: "Бүкіл әлем", dl: "Раундтар: қыркүйек және қаңтар" },
  },
  "purple-comet": {
    en: { d: "A free team online math competition for schools worldwide.", loc: "Online", dl: "Apr 14–23", age: "school" },
    kz: { d: "Бүкіл әлем мектептеріне арналған тегін командалық онлайн математика жарысы.", loc: "Онлайн", dl: "14–23 сәуір", age: "мектеп" },
  },
  "brilliant": {
    en: { d: "Interactive courses in math, logic and Data Science through problem-solving.", loc: "Online", dl: "Year-round" },
    kz: { d: "Есеп шығару арқылы математика, логика және Data Science бойынша интерактивті курстар.", loc: "Онлайн", dl: "Жыл бойы" },
  },
  "educationusa-kz": {
    en: { d: "Free advising on admission and scholarships to US universities.", loc: "Almaty / Astana", dl: "Advising year-round" },
    kz: { d: "АҚШ университеттеріне түсу мен стипендиялар бойынша тегін кеңес.", loc: "Алматы / Астана", dl: "Кеңес жыл бойы" },
  },
  "sabaq-kz": {
    en: { d: "Free video lessons across the whole school curriculum in Kazakh and Russian.", loc: "Online (KZ / RU)", dl: "Year-round", age: "grades 1–11" },
    kz: { d: "Қазақ және орыс тілдерінде барлық мектеп бағдарламасы бойынша тегін видеосабақтар.", loc: "Онлайн (KZ / RU)", dl: "Жыл бойы", age: "1–11 сынып" },
  },
  "bilimland": {
    en: { d: "A large Kazakhstani online platform with lessons, tests and UNT prep.", loc: "Online (KZ)", dl: "Subscription year-round", age: "grades 1–11" },
    kz: { d: "Сабақтары, тесттері және ҰБТ-ға дайындығы бар ірі қазақстандық онлайн платформа.", loc: "Онлайн (KZ)", dl: "Жазылым жыл бойы", age: "1–11 сынып" },
  },
  "unicef-zhastary": {
    en: { d: "A platform for young volunteers: training, social projects and leadership development.", loc: "Kazakhstan", dl: "Initiatives year-round" },
    kz: { d: "Жас волонтёрлерге арналған платформа: оқыту, әлеуметтік жобалар және көшбасшылықты дамыту.", loc: "Қазақстан", dl: "Бастамалар жыл бойы" },
  },
}
