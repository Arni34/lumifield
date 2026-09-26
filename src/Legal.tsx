import { useI18n, type Lang } from "@/lib/i18n"

// Юридические документы Lumifield AI (договор оферты + политика конфиденциальности)
// на RU / EN / KZ — переключаются вместе с языком сайта.
// Плейсхолдеры [...] заполните своими реквизитами; перед публичным запуском
// рекомендуется проверка юристом.

// ── Реквизиты (замените на свои) ──────────────────────────
const OPERATOR = "Arnur Bizhigitov"
const EMAIL = "s60316692@gmail.com"
const EFFECTIVE = "30.08.2026"

type Section = { h: string; p: string[] }
type Doc = { title: string; intro: string; sections: Section[] }

// ── RU ────────────────────────────────────────────────────
const OFFER_RU: Doc = {
  title: "Публичная оферта (Договор-оферта)",
  intro: `Редакция от ${EFFECTIVE}. Настоящий документ является официальным предложением ${OPERATOR} (далее — «Оператор») заключить договор на изложенных ниже условиях.`,
  sections: [
    { h: "1. Общие положения", p: [
      "1.1. Настоящая публичная оферта (далее — «Оферта») определяет условия использования сервиса Lumifield AI (далее — «Сервис», «Сайт») и содержит все существенные условия договора между Оператором и Пользователем.",
      "1.2. Акцептом (полным и безоговорочным принятием) Оферты считается любое из действий: регистрация на Сайте, оплата любого платного тарифа, активация промокода или продолжение использования Сайта. С момента акцепта договор считается заключённым.",
      "1.3. Если вы не согласны с условиями Оферты — прекратите использование Сервиса.",
    ] },
    { h: "2. Термины", p: [
      "Сервис / Сайт — веб-приложение Lumifield AI, предоставляющее каталог образовательных возможностей, AI-профориентацию и связанные инструменты.",
      "Пользователь — физическое лицо, использующее Сервис.",
      "Аккаунт — учётная запись Пользователя.",
      "Тариф — набор функций: Free, Lumifield+, Lumifield Pro.",
      "Подписка — периодический платный доступ к платному Тарифу.",
    ] },
    { h: "3. Предмет договора", p: [
      "3.1. Оператор предоставляет Пользователю доступ к функциям Сервиса (каталог возможностей, AI-профориентация, персональный план, тест уровня, AI-помощник по эссе, трекер дедлайнов) в объёме выбранного Тарифа.",
      "3.2. Сервис носит информационно-агрегационный характер. Оператор не является организатором программ, вузов, олимпиад или грантов и не гарантирует поступление, получение гранта или иной результат.",
    ] },
    { h: "4. Регистрация и аккаунт", p: [
      "4.1. Для части функций требуется регистрация с указанием имени, контактных данных и создания учётных данных.",
      "4.2. Пользователь обязуется предоставлять достоверные данные и несёт ответственность за сохранность пароля и действия под своим Аккаунтом.",
      "4.3. Использование Сервиса лицами младше 16 лет допускается с согласия родителя или законного представителя.",
    ] },
    { h: "5. Тарифы, оплата и подписка", p: [
      "5.1. Актуальные Тарифы и цены указаны на странице «Тарифы». Оператор вправе изменять цены; стоимость уже оплаченного периода не пересчитывается.",
      "5.2. Платные Тарифы: Lumifield+ (оплата ежемесячно) и Lumifield Pro (оплата раз в 6 месяцев). Оплата производится через стороннего платёжного провайдера; полные данные банковской карты Оператору не передаются и у него не хранятся.",
      "5.3. Подписка автоматически продлевается на следующий период путём списания с привязанного способа оплаты, если Пользователь не отменил продление до окончания текущего оплаченного периода. Отмена доступна в Аккаунте или по обращению к Оператору; доступ сохраняется до конца оплаченного периода.",
      "5.4. Промокоды активируют соответствующий Тариф, действуют однократно и не подлежат обмену на денежные средства.",
    ] },
    { h: "6. Возврат средств", p: [
      "6.1. Поскольку доступ к цифровым функциям предоставляется немедленно после оплаты, оплаченный период по общему правилу возврату не подлежит, за исключением случаев, прямо предусмотренных законодательством.",
      "6.2. Спорные вопросы рассматриваются по обращению на " + EMAIL + ".",
    ] },
    { h: "7. Права и обязанности сторон", p: [
      "7.1. Пользователь обязуется соблюдать законодательство, не пытаться получить несанкционированный доступ, не использовать Сервис для вредоносных действий и рассылок, не передавать Аккаунт третьим лицам.",
      "7.2. Оператор вправе приостановить доступ при нарушении условий, изменять функциональность Сервиса и проводить технические работы.",
      "7.3. Оператор прилагает разумные усилия для доступности Сервиса, но не гарантирует его бесперебойную и безошибочную работу.",
    ] },
    { h: "8. AI-функции и оговорка", p: [
      "8.1. Результаты AI-профориентации, подбора вузов, оценки шансов и AI-помощника по эссе формируются автоматически, носят рекомендательный характер и могут содержать неточности. Они не являются официальной консультацией, гарантией поступления или юридически значимым документом.",
      "8.2. Пользователь самостоятельно проверяет сведения (дедлайны, требования) на официальных источниках. Оператор не несёт ответственности за решения, принятые Пользователем на основе рекомендаций Сервиса.",
      "8.3. AI-помощник предназначен для помощи в структуре и формулировках. Пользователь не должен выдавать полностью сгенерированный текст за самостоятельную работу там, где это запрещено правилами приёма.",
    ] },
    { h: "9. Интеллектуальная собственность", p: [
      "9.1. Сайт, его дизайн, тексты, код и иные материалы принадлежат Оператору или правообладателям. Копирование и использование без письменного разрешения запрещено.",
      "9.2. Названия программ, вузов и организаций принадлежат их владельцам и используются в информационных целях.",
    ] },
    { h: "10. Ограничение ответственности", p: [
      "10.1. Сервис предоставляется на условиях «как есть». Оператор не несёт ответственности за косвенные убытки, упущенную выгоду, а также за действия третьих лиц (вузов, организаторов, платёжного провайдера).",
    ] },
    { h: "11. Персональные данные", p: [
      "11.1. Обработка персональных данных осуществляется согласно Политике конфиденциальности, являющейся неотъемлемой частью настоящей Оферты.",
    ] },
    { h: "12. Изменение условий", p: [
      "12.1. Оператор вправе изменять Оферту, публикуя новую редакцию на Сайте. Продолжение использования Сервиса после изменений означает согласие с ними.",
    ] },
    { h: "13. Реквизиты и контакты", p: [
      "Оператор: " + OPERATOR + ".",
      "Email для связи: " + EMAIL + ".",
      "Дата вступления в силу: " + EFFECTIVE + ".",
    ] },
  ],
}

const PRIVACY_RU: Doc = {
  title: "Политика конфиденциальности",
  intro: `Редакция от ${EFFECTIVE}. Настоящая Политика описывает, как ${OPERATOR} (далее — «Оператор») собирает, использует и защищает персональные данные Пользователей сервиса Lumifield AI.`,
  sections: [
    { h: "1. Общие положения", p: [
      "1.1. Используя Сайт, вы соглашаетесь с обработкой данных в соответствии с настоящей Политикой.",
      "1.2. Политика является неотъемлемой частью Договора-оферты.",
    ] },
    { h: "2. Какие данные мы собираем", p: [
      "2.1. Данные регистрации: имя, фамилия, номер телефона, email, имя пользователя.",
      "2.2. Данные использования Сервиса: ответы на анкеты профориентации, результаты тестов, сохранённые отчёты, выбранный тариф, прогресс.",
      "2.3. Технические данные: тип браузера/устройства, данные, сохраняемые в браузере (localStorage) и cookie.",
      "2.4. Платёжные данные обрабатываются платёжным провайдером; полные данные карты Оператору не передаются.",
    ] },
    { h: "3. Цели обработки", p: [
      "3.1. Предоставление и персонализация функций (профориентация, план, отчёты).",
      "3.2. Авторизация и синхронизация Аккаунта между устройствами.",
      "3.3. Обработка оплат и подписок.",
      "3.4. Поддержка Пользователей, обеспечение безопасности и улучшение Сервиса.",
    ] },
    { h: "4. Правовое основание", p: [
      "4.1. Обработка осуществляется на основании согласия Пользователя (акцепт Оферты и настоящей Политики) и в целях исполнения договора.",
    ] },
    { h: "5. Передача третьим лицам", p: [
      "5.1. Supabase — хостинг базы данных и аутентификация: хранение Аккаунта и связанных данных.",
      "5.2. Провайдер AI-моделей (например, Groq) — для генерации отчётов ваши ответы на анкеты и введённые тексты передаются модели для обработки. Не указывайте в свободных полях чувствительные сведения, которые не хотите передавать.",
      "5.3. Платёжный провайдер — для проведения оплаты подписки.",
      "5.4. Государственным органам — только в случаях, предусмотренных законодательством.",
      "5.5. Оператор не продаёт персональные данные.",
    ] },
    { h: "6. Cookie и подобные технологии", p: [
      "6.1. Необходимые cookie/localStorage используются для работы Сайта (сессия, настройки, язык, сохранение согласия на cookie) и применяются всегда.",
      "6.2. Необязательные cookie (аналитика, улучшение Сервиса) применяются только с вашего согласия. При заходе на Сайт вы можете принять или отклонить необязательные cookie в баннере.",
    ] },
    { h: "7. Хранение и защита данных", p: [
      "7.1. Данные хранятся у Supabase в течение существования Аккаунта или пока это необходимо для целей обработки.",
      "7.2. Применяются разумные технические и организационные меры защиты. Абсолютную безопасность передачи данных через интернет гарантировать невозможно.",
    ] },
    { h: "8. Права Пользователя", p: [
      "8.1. Вы вправе запросить доступ к своим данным, их исправление или удаление, удаление Аккаунта, отозвать согласие и возразить против обработки — по обращению на " + EMAIL + ".",
      "8.2. Локальные данные можно удалить самостоятельно, очистив хранилище браузера.",
    ] },
    { h: "9. Данные несовершеннолетних", p: [
      "9.1. Сервис ориентирован на школьников 13–18 лет. Обработка данных несовершеннолетних осуществляется с согласия родителя или законного представителя.",
    ] },
    { h: "10. Изменения Политики", p: [
      "10.1. Оператор вправе обновлять Политику; актуальная редакция публикуется на Сайте с указанием даты.",
    ] },
    { h: "11. Контакты", p: [
      "По вопросам обработки персональных данных: " + EMAIL + ".",
      "Оператор: " + OPERATOR + ".",
      "Дата вступления в силу: " + EFFECTIVE + ".",
    ] },
  ],
}

// ── EN ────────────────────────────────────────────────────
const OFFER_EN: Doc = {
  title: "Public Offer (Offer Agreement)",
  intro: `Version dated ${EFFECTIVE}. This document is an official offer by ${OPERATOR} (the “Operator”) to enter into an agreement on the terms set out below.`,
  sections: [
    { h: "1. General provisions", p: [
      "1.1. This public offer (the “Offer”) sets out the terms of use of the Lumifield AI service (the “Service”, “Site”) and contains all material terms of the agreement between the Operator and the User.",
      "1.2. Acceptance (full and unconditional) of the Offer is any of the following: registering on the Site, paying for any paid plan, activating a promo code, or continuing to use the Site. The agreement is deemed concluded upon acceptance.",
      "1.3. If you do not agree with the terms of the Offer, stop using the Service.",
    ] },
    { h: "2. Definitions", p: [
      "Service / Site — the Lumifield AI web application providing a catalog of educational opportunities, AI career guidance and related tools.",
      "User — an individual using the Service.",
      "Account — a User's account.",
      "Plan — a set of features: Free, Lumifield+, Lumifield Pro.",
      "Subscription — recurring paid access to a paid Plan.",
    ] },
    { h: "3. Subject of the agreement", p: [
      "3.1. The Operator grants the User access to the Service's features (opportunity catalog, AI guidance, personal plan, level test, AI essay assistant, deadline tracker) within the scope of the chosen Plan.",
      "3.2. The Service is informational and aggregational. The Operator is not the organizer of programs, universities, olympiads or grants and does not guarantee admission, a grant or any other outcome.",
    ] },
    { h: "4. Registration and account", p: [
      "4.1. Some features require registration with a name, contact details and account credentials.",
      "4.2. The User undertakes to provide accurate data and is responsible for keeping the password safe and for actions under their Account.",
      "4.3. Use of the Service by persons under 16 is permitted with the consent of a parent or legal guardian.",
    ] },
    { h: "5. Plans, payment and subscription", p: [
      "5.1. Current Plans and prices are shown on the “Pricing” page. The Operator may change prices; the cost of an already paid period is not recalculated.",
      "5.2. Paid Plans: Lumifield+ (billed monthly) and Lumifield Pro (billed every 6 months). Payment is made through a third-party payment provider; full bank card details are not transferred to or stored by the Operator.",
      "5.3. The Subscription automatically renews for the next period by charging the linked payment method unless the User cancels renewal before the end of the current paid period. Cancellation is available in the Account or by contacting the Operator; access remains until the end of the paid period.",
      "5.4. Promo codes activate the corresponding Plan, are single-use and are not exchangeable for money.",
    ] },
    { h: "6. Refunds", p: [
      "6.1. Since access to digital features is provided immediately after payment, the paid period is generally non-refundable, except as expressly required by law.",
      "6.2. Disputes are handled upon request to " + EMAIL + ".",
    ] },
    { h: "7. Rights and obligations of the parties", p: [
      "7.1. The User undertakes to comply with the law, not to attempt unauthorized access, not to use the Service for malicious actions or spam, and not to transfer the Account to third parties.",
      "7.2. The Operator may suspend access upon breach of the terms, change the Service's functionality and carry out maintenance.",
      "7.3. The Operator makes reasonable efforts to keep the Service available but does not guarantee uninterrupted or error-free operation.",
    ] },
    { h: "8. AI features and disclaimer", p: [
      "8.1. The results of AI guidance, university matching, chance estimates and the AI essay assistant are generated automatically, are advisory in nature and may contain inaccuracies. They are not official advice, a guarantee of admission or a legally binding document.",
      "8.2. The User independently verifies information (deadlines, requirements) at official sources. The Operator is not responsible for decisions made by the User based on the Service's recommendations.",
      "8.3. The AI assistant is intended to help with structure and wording. The User must not pass off fully generated text as their own work where this is prohibited by admission rules.",
    ] },
    { h: "9. Intellectual property", p: [
      "9.1. The Site, its design, texts, code and other materials belong to the Operator or rights holders. Copying and use without written permission is prohibited.",
      "9.2. Names of programs, universities and organizations belong to their owners and are used for informational purposes.",
    ] },
    { h: "10. Limitation of liability", p: [
      "10.1. The Service is provided “as is”. The Operator is not liable for indirect losses, lost profits, or for the actions of third parties (universities, organizers, the payment provider).",
    ] },
    { h: "11. Personal data", p: [
      "11.1. Personal data is processed in accordance with the Privacy Policy, which is an integral part of this Offer.",
    ] },
    { h: "12. Changes to the terms", p: [
      "12.1. The Operator may change the Offer by publishing a new version on the Site. Continued use of the Service after changes constitutes agreement with them.",
    ] },
    { h: "13. Details and contacts", p: [
      "Operator: " + OPERATOR + ".",
      "Contact email: " + EMAIL + ".",
      "Effective date: " + EFFECTIVE + ".",
    ] },
  ],
}

const PRIVACY_EN: Doc = {
  title: "Privacy Policy",
  intro: `Version dated ${EFFECTIVE}. This Policy describes how ${OPERATOR} (the “Operator”) collects, uses and protects the personal data of Users of the Lumifield AI service.`,
  sections: [
    { h: "1. General provisions", p: [
      "1.1. By using the Site, you agree to the processing of data in accordance with this Policy.",
      "1.2. The Policy is an integral part of the Offer Agreement.",
    ] },
    { h: "2. What data we collect", p: [
      "2.1. Registration data: first name, last name, phone number, email, username.",
      "2.2. Service usage data: guidance questionnaire answers, test results, saved reports, chosen plan, progress.",
      "2.3. Technical data: browser/device type, data stored in the browser (localStorage) and cookies.",
      "2.4. Payment data is processed by the payment provider; full card details are not transferred to the Operator.",
    ] },
    { h: "3. Purposes of processing", p: [
      "3.1. Providing and personalizing features (guidance, plan, reports).",
      "3.2. Authorization and syncing the Account across devices.",
      "3.3. Processing payments and subscriptions.",
      "3.4. User support, security and improvement of the Service.",
    ] },
    { h: "4. Legal basis", p: [
      "4.1. Processing is based on the User's consent (acceptance of the Offer and this Policy) and for the purpose of performing the agreement.",
    ] },
    { h: "5. Transfer to third parties", p: [
      "5.1. Supabase — database hosting and authentication: storage of the Account and related data.",
      "5.2. AI model provider (e.g., Groq) — to generate reports, your questionnaire answers and entered texts are transferred to the model for processing. Do not enter sensitive information in free-text fields that you do not wish to share.",
      "5.3. Payment provider — to process subscription payments.",
      "5.4. Government authorities — only in cases provided for by law.",
      "5.5. The Operator does not sell personal data.",
    ] },
    { h: "6. Cookies and similar technologies", p: [
      "6.1. Necessary cookies/localStorage are used for the Site to work (session, settings, language, saving cookie consent) and are always applied.",
      "6.2. Optional cookies (analytics, service improvement) are applied only with your consent. When you enter the Site you can accept or reject optional cookies in the banner.",
    ] },
    { h: "7. Storage and protection of data", p: [
      "7.1. Data is stored with Supabase for as long as the Account exists or as necessary for the purposes of processing.",
      "7.2. Reasonable technical and organizational protection measures are applied. Absolute security of data transmission over the internet cannot be guaranteed.",
    ] },
    { h: "8. User rights", p: [
      "8.1. You have the right to request access to your data, its correction or deletion, deletion of the Account, to withdraw consent and to object to processing — by contacting " + EMAIL + ".",
      "8.2. Local data can be deleted by clearing your browser storage.",
    ] },
    { h: "9. Data of minors", p: [
      "9.1. The Service is aimed at students aged 13–18. Processing of minors' data is carried out with the consent of a parent or legal guardian.",
    ] },
    { h: "10. Changes to the Policy", p: [
      "10.1. The Operator may update the Policy; the current version is published on the Site with its date.",
    ] },
    { h: "11. Contacts", p: [
      "For questions about processing personal data: " + EMAIL + ".",
      "Operator: " + OPERATOR + ".",
      "Effective date: " + EFFECTIVE + ".",
    ] },
  ],
}

// ── KZ ────────────────────────────────────────────────────
const OFFER_KZ: Doc = {
  title: "Жария оферта (Оферта-шарт)",
  intro: `${EFFECTIVE} редакциясы. Осы құжат — ${OPERATOR} (бұдан әрі — «Оператор») төмендегі шарттармен келісім жасауға ресми ұсынысы.`,
  sections: [
    { h: "1. Жалпы ережелер", p: [
      "1.1. Осы жария оферта (бұдан әрі — «Оферта») Lumifield AI сервисін (бұдан әрі — «Сервис», «Сайт») пайдалану шарттарын айқындайды және Оператор мен Пайдаланушы арасындағы келісімнің барлық елеулі шарттарын қамтиды.",
      "1.2. Офертаны акцепт (толық әрі сөзсіз қабылдау) деп мыналардың кез келгені саналады: Сайтта тіркелу, кез келген ақылы тарифті төлеу, промокодты белсендіру немесе Сайтты пайдалануды жалғастыру. Акцепт сәтінен бастап келісім жасалған болып есептеледі.",
      "1.3. Оферта шарттарымен келіспесеңіз — Сервисті пайдалануды тоқтатыңыз.",
    ] },
    { h: "2. Терминдер", p: [
      "Сервис / Сайт — білім беру мүмкіндіктерінің каталогын, AI-профбағдарды және байланысты құралдарды ұсынатын Lumifield AI веб-қосымшасы.",
      "Пайдаланушы — Сервисті пайдаланатын жеке тұлға.",
      "Аккаунт — Пайдаланушының есептік жазбасы.",
      "Тариф — функциялар жиынтығы: Free, Lumifield+, Lumifield Pro.",
      "Жазылым — ақылы Тарифке мерзімді ақылы қолжетімділік.",
    ] },
    { h: "3. Келісім мәні", p: [
      "3.1. Оператор Пайдаланушыға таңдалған Тариф көлемінде Сервис функцияларына (мүмкіндіктер каталогы, AI-профбағдар, жеке жоспар, деңгей тесті, AI эссе көмекшісі, мерзім трекері) қолжетімділік береді.",
      "3.2. Сервис ақпараттық-жинақтаушы сипатта. Оператор бағдарламалардың, университеттердің, олимпиадалардың немесе гранттардың ұйымдастырушысы емес және оқуға түсуді, грантты не өзге нәтижені кепілдемейді.",
    ] },
    { h: "4. Тіркелу және аккаунт", p: [
      "4.1. Кейбір функциялар үшін аты, байланыс деректері және есептік деректерді жасау арқылы тіркелу қажет.",
      "4.2. Пайдаланушы шынайы деректер беруге міндеттенеді және құпиясөздің сақталуы мен Аккаунт арқылы жасалған әрекеттерге жауап береді.",
      "4.3. 16 жасқа толмаған тұлғалардың Сервисті пайдалануы ата-ананың немесе заңды өкілдің келісімімен рұқсат етіледі.",
    ] },
    { h: "5. Тарифтер, төлем және жазылым", p: [
      "5.1. Өзекті Тарифтер мен бағалар «Тарифтер» бетінде көрсетілген. Оператор бағаны өзгертуге құқылы; төленген кезеңнің құны қайта есептелмейді.",
      "5.2. Ақылы Тарифтер: Lumifield+ (ай сайын төлем) және Lumifield Pro (6 айда бір төлем). Төлем үшінші тарап төлем провайдері арқылы жасалады; банк картасының толық деректері Операторға берілмейді және онда сақталмайды.",
      "5.3. Жазылым Пайдаланушы ағымдағы төленген кезең аяқталғанға дейін ұзартудан бас тартпаса, байланыстырылған төлем әдісінен есептеу арқылы келесі кезеңге автоматты түрде ұзартылады. Бас тарту Аккаунтта немесе Операторға хабарласу арқылы қолжетімді; қолжетімділік төленген кезең соңына дейін сақталады.",
      "5.4. Промокодтар тиісті Тарифті белсендіреді, бір рет қолданылады және ақшаға айырбасталмайды.",
    ] },
    { h: "6. Ақшаны қайтару", p: [
      "6.1. Цифрлық функцияларға қолжетімділік төлемнен кейін бірден берілетіндіктен, төленген кезең әдетте қайтарылмайды, заңнамада тікелей көзделген жағдайларды қоспағанда.",
      "6.2. Даулы мәселелер " + EMAIL + " мекенжайына хабарласу бойынша қаралады.",
    ] },
    { h: "7. Тараптардың құқықтары мен міндеттері", p: [
      "7.1. Пайдаланушы заңнаманы сақтауға, рұқсатсыз қол жеткізуге әрекет жасамауға, Сервисті зиянды әрекеттер мен таратуларға пайдаланбауға және Аккаунтты үшінші тұлғаларға бермеуге міндеттенеді.",
      "7.2. Оператор шарттар бұзылған жағдайда қолжетімділікті тоқтата тұруға, Сервис функционалын өзгертуге және техникалық жұмыстар жүргізуге құқылы.",
      "7.3. Оператор Сервистің қолжетімділігі үшін ақылға қонымды күш салады, бірақ оның үздіксіз әрі қатесіз жұмысын кепілдемейді.",
    ] },
    { h: "8. AI-функциялар және ескертпе", p: [
      "8.1. AI-профбағдардың, университет таңдаудың, мүмкіндікті бағалаудың және AI эссе көмекшісінің нәтижелері автоматты түрде жасалады, ұсынымдық сипатта болады және дәлсіздіктер болуы мүмкін. Олар ресми кеңес, оқуға түсу кепілі немесе заңдық маңызы бар құжат емес.",
      "8.2. Пайдаланушы мәліметтерді (мерзімдер, талаптар) ресми дереккөздерден өзі тексереді. Оператор Пайдаланушының Сервис ұсыныстары негізінде қабылдаған шешімдері үшін жауап бермейді.",
      "8.3. AI көмекшісі құрылым мен тұжырымдауға көмектесуге арналған. Пайдаланушы қабылдау ережелерінде тыйым салынған жерде толық жасалған мәтінді өз жұмысы ретінде ұсынбауға тиіс.",
    ] },
    { h: "9. Зияткерлік меншік", p: [
      "9.1. Сайт, оның дизайны, мәтіндері, коды және өзге материалдары Операторға немесе құқық иеленушілерге тиесілі. Жазбаша рұқсатсыз көшіру мен пайдалануға тыйым салынады.",
      "9.2. Бағдарламалардың, университеттердің және ұйымдардың атаулары иелеріне тиесілі және ақпараттық мақсатта пайдаланылады.",
    ] },
    { h: "10. Жауапкершілікті шектеу", p: [
      "10.1. Сервис «қалай бар, солай» ұсынылады. Оператор жанама залалдар, жіберілген пайда, сондай-ақ үшінші тұлғалардың (университеттер, ұйымдастырушылар, төлем провайдері) әрекеттері үшін жауап бермейді.",
    ] },
    { h: "11. Дербес деректер", p: [
      "11.1. Дербес деректерді өңдеу осы Офертаның ажырамас бөлігі болып табылатын Құпиялылық саясатына сәйкес жүзеге асырылады.",
    ] },
    { h: "12. Шарттарды өзгерту", p: [
      "12.1. Оператор Сайтта жаңа редакцияны жариялау арқылы Офертаны өзгертуге құқылы. Өзгерістерден кейін Сервисті пайдалануды жалғастыру олармен келісуді білдіреді.",
    ] },
    { h: "13. Деректемелер және байланыс", p: [
      "Оператор: " + OPERATOR + ".",
      "Байланыс email: " + EMAIL + ".",
      "Күшіне ену күні: " + EFFECTIVE + ".",
    ] },
  ],
}

const PRIVACY_KZ: Doc = {
  title: "Құпиялылық саясаты",
  intro: `${EFFECTIVE} редакциясы. Осы Саясат ${OPERATOR} (бұдан әрі — «Оператор») Lumifield AI сервисі Пайдаланушыларының дербес деректерін қалай жинайтынын, пайдаланатынын және қорғайтынын сипаттайды.`,
  sections: [
    { h: "1. Жалпы ережелер", p: [
      "1.1. Сайтты пайдалану арқылы сіз деректерді осы Саясатқа сәйкес өңдеуге келісесіз.",
      "1.2. Саясат Оферта-шарттың ажырамас бөлігі болып табылады.",
    ] },
    { h: "2. Біз қандай деректерді жинаймыз", p: [
      "2.1. Тіркелу деректері: аты, тегі, телефон нөмірі, email, пайдаланушы аты.",
      "2.2. Сервисті пайдалану деректері: профбағдар анкеталарының жауаптары, тест нәтижелері, сақталған есептер, таңдалған тариф, прогресс.",
      "2.3. Техникалық деректер: браузер/құрылғы түрі, браузерде сақталатын деректер (localStorage) және cookie.",
      "2.4. Төлем деректері төлем провайдерімен өңделеді; картаның толық деректері Операторға берілмейді.",
    ] },
    { h: "3. Өңдеу мақсаттары", p: [
      "3.1. Функцияларды ұсыну және дербестендіру (профбағдар, жоспар, есептер).",
      "3.2. Авторизация және Аккаунтты құрылғылар арасында синхрондау.",
      "3.3. Төлемдер мен жазылымдарды өңдеу.",
      "3.4. Пайдаланушыларды қолдау, қауіпсіздік және Сервисті жақсарту.",
    ] },
    { h: "4. Құқықтық негіз", p: [
      "4.1. Өңдеу Пайдаланушының келісімі (Оферта мен осы Саясатты акцепт) негізінде және келісімді орындау мақсатында жүзеге асырылады.",
    ] },
    { h: "5. Үшінші тұлғаларға беру", p: [
      "5.1. Supabase — дерекқор хостингі және аутентификация: Аккаунт пен байланысты деректерді сақтау.",
      "5.2. AI модель провайдері (мысалы, Groq) — есептерді жасау үшін сіздің анкета жауаптарыңыз бен енгізілген мәтіндер модельге өңдеуге беріледі. Еркін өрістерде бөліскіңіз келмейтін құпия мәліметтерді көрсетпеңіз.",
      "5.3. Төлем провайдері — жазылым төлемін өткізу үшін.",
      "5.4. Мемлекеттік органдарға — тек заңнамада көзделген жағдайларда.",
      "5.5. Оператор дербес деректерді сатпайды.",
    ] },
    { h: "6. Cookie және ұқсас технологиялар", p: [
      "6.1. Қажетті cookie/localStorage Сайттың жұмысы үшін (сессия, параметрлер, тіл, cookie келісімін сақтау) пайдаланылады және әрдайым қолданылады.",
      "6.2. Қажетсіз cookie (аналитика, Сервисті жақсарту) тек сіздің келісіміңізбен қолданылады. Сайтқа кірген кезде баннерде қажетсіз cookie-ді қабылдауға немесе бас тартуға болады.",
    ] },
    { h: "7. Деректерді сақтау және қорғау", p: [
      "7.1. Деректер Supabase-те Аккаунт бар болғанша немесе өңдеу мақсаттары үшін қажет болғанша сақталады.",
      "7.2. Ақылға қонымды техникалық және ұйымдастырушылық қорғау шаралары қолданылады. Интернет арқылы деректерді берудің абсолютті қауіпсіздігін кепілдеу мүмкін емес.",
    ] },
    { h: "8. Пайдаланушының құқықтары", p: [
      "8.1. Сіз өз деректеріңізге қол жеткізуді, оларды түзетуді немесе жоюды, Аккаунтты жоюды, келісімді кері қайтаруды және өңдеуге қарсылық білдіруді сұрауға құқылысыз — " + EMAIL + " мекенжайына хабарласу арқылы.",
      "8.2. Жергілікті деректерді браузер қоймасын тазалау арқылы өзіңіз жоя аласыз.",
    ] },
    { h: "9. Кәмелетке толмағандардың деректері", p: [
      "9.1. Сервис 13–18 жастағы оқушыларға бағытталған. Кәмелетке толмағандардың деректерін өңдеу ата-ананың немесе заңды өкілдің келісімімен жүзеге асырылады.",
    ] },
    { h: "10. Саясаттың өзгерістері", p: [
      "10.1. Оператор Саясатты жаңартуға құқылы; өзекті редакция күні көрсетіліп Сайтта жарияланады.",
    ] },
    { h: "11. Байланыс", p: [
      "Дербес деректерді өңдеу мәселелері бойынша: " + EMAIL + ".",
      "Оператор: " + OPERATOR + ".",
      "Күшіне ену күні: " + EFFECTIVE + ".",
    ] },
  ],
}

const DOCS: Record<Lang, { offer: Doc; privacy: Doc }> = {
  ru: { offer: OFFER_RU, privacy: PRIVACY_RU },
  en: { offer: OFFER_EN, privacy: PRIVACY_EN },
  kz: { offer: OFFER_KZ, privacy: PRIVACY_KZ },
}

export default function Legal({ doc }: { doc: "offer" | "privacy" }) {
  const { lang } = useI18n()
  const d = (DOCS[lang] ?? DOCS.ru)[doc]
  return (
    <section className="mx-auto max-w-3xl px-6 pt-12 pb-24">
      <h1 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">{d.title}</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">{d.intro}</p>
      <div className="mt-8 space-y-8">
        {d.sections.map((s) => (
          <div key={s.h}>
            <h2 className="border-b-2 border-foreground pb-2 text-lg font-black uppercase tracking-tight">{s.h}</h2>
            <div className="mt-3 space-y-2.5">
              {s.p.map((para, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-foreground/85">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
