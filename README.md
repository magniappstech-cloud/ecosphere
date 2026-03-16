# ЭкоСфера Безопасности — v3.0
**Silicon Valley Product Design · MagniApps Tech · 2026**

---

## 📁 Структура проекта

```
ecosfera-final/
│
├── vscode/                          ← ВЕРСИЯ ДЛЯ VS CODE (preview)
│   ├── index.html                   ← Весь сайт в одном файле
│   ├── assets/
│   │   ├── css/style.css            ← Полная дизайн-система
│   │   └── js/main.js               ← Весь интерактив
│   └── README.md                    ← Этот файл
│
└── wordpress/
    └── ecosfera-theme/              ← ТЕМА WORDPRESS
        ├── style.css                ← Обязателен для WP (метаданные темы)
        ├── functions.php            ← Логика: CPT, ACF, REST API, AJAX
        ├── header.php               ← Шапка
        ├── footer.php               ← Подвал
        ├── front-page.php           ← Главная страница
        ├── archive-eco_news.php     ← Новости (PAGE 4)
        ├── archive-eco_project.php  ← Проекты (PAGE 3)
        ├── archive-eco_track.php    ← Музыка + Искусство (PAGE 2)
        ├── page-initiative.php      ← Инициатива (PAGE 5) — Template
        ├── assets/
        │   ├── css/style.css        ← Та же дизайн-система
        │   └── js/main.js           ← Тот же JS
        └── README.md
```

---

## 🚀 Запуск в VS Code

### Способ 1 — Live Server (рекомендуется)

1. Открой VS Code
2. `Ctrl+Shift+X` → найди **Live Server** (Ritwick Dey) → Установить
3. `Файл → Открыть папку` → выбери `ecosfera-final/vscode`
4. Правый клик на `index.html` → **Open with Live Server**
5. Сайт откроется на `http://127.0.0.1:5500`

> При каждом сохранении файла — страница обновляется автоматически.

### Способ 2 — Прямое открытие

Найди `vscode/index.html` и дважды кликни — откроется в браузере.

---

## ⚙️ Установка на WordPress

### Шаг 1 — Загрузи тему
```
Скопируй папку ecosfera-theme →
/wp-content/themes/ecosfera-theme/
```

### Шаг 2 — Активируй
`Внешний вид → Темы → ЭкоСфера Безопасности → Активировать`

### Шаг 3 — Установи плагин ACF
`Плагины → Добавить → "Advanced Custom Fields" → Установить → Активировать`

После активации все поля зарегистрируются автоматически.

### Шаг 4 — Создай страницы

| Страница         | Шаблон                | URL          |
|-----------------|----------------------|--------------|
| Главная         | По умолчанию          | `/`          |
| Инициатива      | Страница инициативы   | `/initiative/` |
| Регистрация     | Стандартная WP        | `/register/` |

`Настройки → Чтение → Главная страница → выбери "Главная"`

### Шаг 5 — Создай меню

`Внешний вид → Меню` → создай 3 меню:

**Основная навигация** → назначь на позицию `primary`:
- Главная → `/`
- Искусство → `/tracks/`
- Проекты → `/projects/`
- Новости → `/news/`
- Инициатива → `/initiative/`
- Регистрация → `/register/` (CSS-класс: `nav-cta`)

**Навигация подвала** → позиция `footer`

**Мобильное меню** → позиция `mobile`

---

## 📝 Добавление контента

### Треки (Музыка)
`Треки → Добавить`
- Заголовок: название трека
- Миниатюра: обложка
- ACF: Исполнитель, Длительность (`3:42`), Лайки, Новинка ✓, MP3-файл, Эмодзи

### Проекты
`Проекты → Добавить`
- ACF: Статус (`active`/`done`), Локация, Количество участников, Галерея, Эмодзи

### Новости
`Новости → Добавить`
- ACF: Подзаголовок, Автор, Время чтения, Главная новость ✓, Эмодзи

### Лидеры
`Лидеры → Добавить`
- ACF: Роль и город, Цитата, Эмодзи, Ссылка соцсети

---

## 🎨 Кастомизация

### Изменить цвета (vscode/assets/css/style.css или wp/assets/css/style.css)
```css
:root {
  --c-green:  #2AF598;   /* Главный акцент — поменяй один раз */
  --c-coral:  #FF6B6B;   /* Вторичный акцент */
  --c-bg:     #070E1A;   /* Основной фон */
}
```

### Изменить шрифты
```css
:root {
  --f-display: 'Syne', sans-serif;        /* Заголовки */
  --f-body:    'Inter', sans-serif;       /* Текст */
  --f-data:    'Space Grotesk', sans-serif; /* UI, данные */
}
```
Замени на любой шрифт с [fonts.google.com](https://fonts.google.com). Обновляй и ссылку в `<head>`.

---

## 🌐 REST API (WordPress)

Все данные доступны через JSON API:

| Endpoint | Метод | Описание |
|---|---|---|
| `/wp-json/ecosfera/v1/tracks` | GET | Список треков |
| `/wp-json/ecosfera/v1/projects` | GET | Список проектов |
| `/wp-json/ecosfera/v1/news` | GET | Новости |
| `/wp-json/ecosfera/v1/initiative` | POST | Отправить инициативу |
| `/wp-json/ecosfera/v1/like/{id}` | POST | Лайкнуть трек |

---

## 📱 Адаптивность — 8 breakpoints

| Устройство | Breakpoint | Особенности |
|---|---|---|
| Desktop XL | > 1440px | Широкий контейнер |
| Desktop | 1200–1440px | Стандарт |
| Laptop | 1024–1200px | Часть nav скрывается |
| Tablet L | 768–1024px | Masonry 8 кол., метрики 2×2 |
| Tablet P | 600–768px | Masonry 2 кол., бургер-меню |
| Mobile L | 480–600px | Masonry 1 кол. |
| Mobile M | 375–480px | Компактные отступы |
| Mobile S | < 375px | Минимальные размеры |

---

## 🛠 Горячие клавиши VS Code

| Действие | Windows | Mac |
|---|---|---|
| Поиск по файлу | `Ctrl+F` | `Cmd+F` |
| Поиск по всем файлам | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Форматирование | `Shift+Alt+F` | `Shift+Opt+F` |
| Терминал | `Ctrl+\`` | `Cmd+\`` |
| Сохранить | `Ctrl+S` | `Cmd+S` |
| Свернуть блок | `Ctrl+Shift+[` | `Cmd+Opt+[` |

---

## 📦 Технологии

| Технология | Версия | Назначение |
|---|---|---|
| HTML5 | — | Разметка |
| CSS Grid + Flexbox | — | Раскладки |
| CSS Custom Properties | — | Дизайн-система |
| JavaScript ES6 | — | Интерактив |
| GSAP | 3.12.5 | Scroll-анимации |
| ScrollTrigger | 3.12.5 | Masonry → Nav трансформация |
| Intersection Observer API | — | Reveal-анимации, счётчики |
| SVG | — | Радар, декоративные элементы |
| Canvas API | — | Lightbox-заглушки галереи |
| WordPress | 6.0+ | CMS |
| ACF | Free | Кастомные поля |
| REST API | — | JSON эндпоинты |

---

## 👨‍💻 Разработано

**MagniApps Tech** · [magniapps.ru](https://magniapps.ru)

---

*ЭкоСфера Безопасности © 2026 · Все права защищены*
