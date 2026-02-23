# WB Tariffs Service

Ежечасно получает тарифы WB, сохраняет в PostgreSQL, каждые 6ч обновляет Google Sheets.

## Запуск

1. Клонируйте: `git clone <repo>`
2. Создайте `.env` из `.env.example`
3. Установить WB_TOKEN
4. Google: создайте service account, скачайте JSON, поделитесь sheets (email из JSON)
5. Создайте тестовые sheets с листом "stocks_coefs"
6. `docker compose up -d`

Healthcheck: http://localhost:3000/health

Логи: `docker compose logs -f app`
