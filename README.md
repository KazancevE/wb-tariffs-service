# WB Tariffs Service

Сервис на NestJS, который:
- ежечасно получает box‑тарифы WB и сохраняет их в PostgreSQL;
- каждые 6 часов (и по ручному запросу) обновляет Google Sheets (лист `stocks_coefs`).

---

## Стек

- Node.js 20 (alpine)
- NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/schedule`)[web:106]
- PostgreSQL + Knex
- Axios (WB API)[web:84]
- Google Sheets API (`googleapis`)[web:107]
- Docker, docker compose

---

## Подготовка

### 1. Wildberries API

1. Получите токен WB в ЛК продавца.
2. Убедитесь, что доступен метод  
   `GET https://common-api.wildberries.ru/api/v1/tariffs/box?date=YYYY-MM-DD`  
   с заголовком `Authorization: Bearer <WB_TOKEN>`.[web:84]

### 2. Google Cloud и Google Sheets

1. Зайдите в [Google Cloud Console](https://console.developers.google.com).[web:90]
2. Выберите/создайте проект.
3. В разделе **APIs & Services → Library** включите **Google Sheets API**.[web:90][web:104]
4. В **APIs & Services → Credentials** создайте **Service Account**, скачайте JSON‑ключ.
5. В каждом Google Sheet:
   - откройте файл;
   - «Поделиться» → добавьте сервисный аккаунт `...@<project>.iam.gserviceaccount.com` как **редактора**.[web:85]
6. В каждом Sheet создайте лист `stocks_coefs` (именно такое имя).

---

## .env

В корне проекта создайте `.env` (можно из `.env.example`):

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=wb_tariffs_db
DB_USER=user
DB_PASSWORD=pass

WB_TOKEN=... # токен Wildberries

GOOGLE_SHEETS_IDS=sheetId1,sheetId2 # ID таблиц через запятую

PORT=3000
```

## Cборка и запуск
### Cборка образа приложения
docker compose build --no-cache app[5][1]

### Запуск сервисов в фоне
docker compose up -d[1][5]

### healthcheck HTTP‑сервиса
curl <http://localhost:3000/health>[2]
### → {"status":"ok","timestamp":"..."}

### Ручной запуск полного цикла (WB → Postgres → Google Sheets)
curl <http://localhost:3000/run-once>[2]

### Логи приложения
docker compose logs -f app[5][1]

### Проверка данных в БД (количество записей за текущую дату)
docker compose exec postgres \
  psql -U user -d wb_tariffs_db \
  -c "SELECT COUNT(*) FROM wb_tariffs WHERE fetch_date = CURRENT_DATE;"[3][4]
