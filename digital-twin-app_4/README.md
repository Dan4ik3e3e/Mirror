# Двойник — Telegram Mini App

## Структура
- `public/index.html` — фронтенд (то что видит пользователь в Telegram)
- `api/chat.js` — бэкенд, общается с Claude API
- `api/profile.js` — бэкенд, сохраняет профиль пользователя

## Деплой на Vercel (бесплатно)

1. Зарегистрируйся на vercel.com через GitHub
2. Загрузи эту папку в новый репозиторий на GitHub
3. На Vercel: New Project → Import от GitHub → выбери репозиторий
4. В Settings → Environment Variables добавь:
   - `ANTHROPIC_API_KEY` — твой ключ с console.anthropic.com
   - `SUPABASE_URL` — (опционально, для сохранения профилей)
   - `SUPABASE_KEY` — (опционально)
5. Deploy

После деплоя получишь URL вида `https://your-app.vercel.app`

## Подключение к Telegram

1. В @BotFather: `/newapp`
2. Выбери своего бота
3. Вставь URL от Vercel
4. Готово — приложение откроется кнопкой в боте
