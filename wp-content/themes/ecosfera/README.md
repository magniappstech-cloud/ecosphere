# Ecosfera Theme

## Что уже настроено

- WordPress остается backend и CMS.
- React собирает интерфейс внутри темы `ecosfera`.
- Vite отвечает за dev/build фронтенда.
- Зарегистрированы типы записей:
  - `post` для новостей и статей
  - `project` для проектов
  - `initiative` для инициатив
  - `artwork` для раздела искусства
- Добавлен REST endpoint `/wp-json/ecosfera/v1/bootstrap` для стартовых данных фронтенда.

## Структура

```text
wp-content/themes/ecosfera
├─ inc/                 PHP-логика темы
├─ templates/           PHP-обертки и shell
├─ frontend/src/        React-компоненты и стили
├─ assets/build/        production build от Vite
├─ functions.php        подключение модулей темы
├─ style.css            заголовок темы WordPress
├─ package.json         скрипты фронтенда
└─ vite.config.js       сборка в assets/build
```

## Как запускать

1. Активировать тему `Ecosfera` в админке WordPress.
2. В каталоге `wp-content/themes/ecosfera` выполнить `npm install`.
3. Для разработки:
   - задать в `wp-config.php` константу `ECOSFERA_VITE_DEV_SERVER`, например `http://localhost:5173`
   - выполнить `npm run dev`
4. Для production:
   - выполнить `npm run build`
   - тема автоматически подключит файлы из `assets/build/.vite/manifest.json`

## Что делать дальше

1. Перенести секции из `template/index.html` в отдельные React-компоненты вместо одного монолитного файла.
2. Завести в WordPress меню `primary` и `footer`.
3. Создать нужные поля через ACF или Meta Box для проектов, инициатив и карточек главной.
4. Подключить реальные изображения и контент из админки, а затем поэтапно заменить временные тексты в `frontend/src`.
