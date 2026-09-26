# Lumifield AI

AI-навигатор по поступлению для школьников Казахстана. Ученик отвечает
на 20 вопросов о себе и получает персональный отчёт: направление, реальные
вузы с требованиями и дедлайнами, план поступления по семестрам и черновик
мотивационного эссе.

Прод: [lumifield.app](https://lumifield.app)

Это B2C-версия продукта. Школьный модуль (кабинеты учителя и завуча)
в этот репозиторий не входит.

## Стек

- React 19 + TypeScript + Vite
- Tailwind CSS v4, Radix UI, GSAP
- Supabase (auth, БД, RLS, Edge Functions)
- Serverless-функции на Vercel (`api/`)

## Запуск

```bash
npm install
cp .env.example .env.local   # заполни ключи, см. ниже
npm run dev
```

Без ключей приложение работает целиком на `localStorage`: каталог,
профориентация и план доступны, аккаунтов и синхронизации нет.

```bash
npm run build     # tsc -b && vite build — собирает с проверкой типов
npm run lint      # oxlint
npm run preview   # предпросмотр собранной версии
```

## Переменные окружения

Все клиентские ключи начинаются с `VITE_` и **видны в браузере** — туда
кладут только публичные значения. Секреты живут в серверных переменных
Vercel и в Supabase Edge Functions.

| Переменная | Где | Зачем |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | клиент | аккаунты и синхронизация; пусто = localStorage |
| `VITE_PROFORI_ENDPOINT` | клиент | прокси к модели для профориентации |
| `VITE_TAVILY_ENDPOINT` | клиент | поиск новых программ в каталог |
| `VITE_ADMIN_ENDPOINT` | клиент | админ-модерация заявок |
| `VITE_PAY_ENDPOINT` | клиент | оплата тарифов |
| `SUPABASE_SERVICE_ROLE` | сервер | сводка по аккаунтам и выдача тарифов в админке |
| `ADMIN_PASSWORD` | сервер | вход в админку `/#admin` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | сервер | уведомления о новых заявках |

Полный список с комментариями — в [`.env.example`](.env.example).
Про выбор моделей и балансировку — в [`MODEL.md`](MODEL.md).

## Структура

```
src/
  App.tsx            роутинг по хешу, шапка, футер
  Landing.tsx        главная
  Catalog.tsx        каталог возможностей
  YouPath.tsx        анкета из 20 вопросов
  Plan.tsx           карта поступления
  Assess.tsx         пробные IELTS / SAT / HSK
  Essay.tsx          помощь с эссе
  Pricing.tsx        тарифы
  Account.tsx        аккаунт и сохранённые отчёты
  Admin.tsx          админка (скрыта за #admin)
  components/        UI, маскот Lumi
  data/              каталог программ и словари, i18n-компаньоны
  lib/               store, auth, AI, оплата, i18n
api/                 serverless-функции Vercel
supabase/            SQL-схемы и Edge Functions
```

## База данных

`supabase/schema.sql` и `supabase/auth-schema.sql` — выполнить в SQL Editor
проекта Supabase. Доступ к данным закрыт через RLS; операции, которым нужны
повышенные права, вынесены в `SECURITY DEFINER`-функции.

## Языки

Интерфейс и ответы AI на трёх языках: қазақша, русский, English.
Словарь — `src/lib/i18n.tsx`, контентные компаньоны — `src/data/*.i18n.ts`.
