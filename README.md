# Linear Electron — Open-source Linear clone (Laravel + Inertia + React)

> A self-hostable **Linear clone**: a fast, keyboard-first issue tracker and project management app, available both as a web app and as a cross-platform **desktop app** (Electron via NativePHP).

[![Tests](https://github.com/MakFly/linear-electron/actions/workflows/tests.yml/badge.svg)](https://github.com/MakFly/linear-electron/actions/workflows/tests.yml)
[![Lint](https://github.com/MakFly/linear-electron/actions/workflows/lint.yml/badge.svg)](https://github.com/MakFly/linear-electron/actions/workflows/lint.yml)
[![Laravel 12](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/MakFly/linear-electron/releases)

**Keywords:** linear clone · issue tracker · project management · laravel · inertia · react · typescript · tailwind · electron · nativephp · self-hosted · open source · kanban · agile · sprint planning

---

## ✨ Features

- 🗂️ **Issue tracking** — create, assign, prioritize and track tickets through customizable statuses.
- 🏷️ **Labels, priorities & assignees** — organize work the way your team thinks.
- 📋 **Views & projects** — group issues into projects and saved views.
- ⌨️ **Keyboard-first UX** — a fast, focused workflow inspired by Linear.
- 🖥️ **Desktop app** — ships as a cross-platform Electron app powered by [NativePHP](https://nativephp.com).
- 🌍 **Internationalization** — built-in English & French locales (i18next + react-i18next).
- 🔐 **Social login** — OAuth via Laravel Socialite, plus a one-click demo account.
- 🎨 **Modern UI** — shadcn/ui + Radix primitives on Tailwind CSS v4.

## 🧱 Tech stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Backend      | PHP 8.2+, Laravel 12                                    |
| Bridge       | Inertia.js 2, Ziggy                                     |
| Frontend     | React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui + Radix |
| Desktop      | Electron via NativePHP                                  |
| Auth         | Laravel Socialite                                       |
| i18n         | i18next, react-i18next (en / fr)                        |
| Tooling      | Vite 6, ESLint, Prettier, Pest/PHPUnit                  |

## 🚀 Getting started

### Prerequisites

- PHP **8.2+** and [Composer](https://getcomposer.org)
- [Bun](https://bun.sh) (or Node.js) for the frontend
- SQLite/MySQL/PostgreSQL

### Installation

```bash
# 1. Clone
git clone https://github.com/MakFly/linear-electron.git
cd linear-electron

# 2. Install dependencies
composer install
bun install

# 3. Environment
cp .env.example .env
php artisan key:generate

# 4. Database
php artisan migrate --seed

# 5. Build assets (the app serves the production build)
bun run build
bunx vite build --ssr

# 6. Serve
php artisan serve   # http://localhost:8100
```

Then open the app and choose **“Continue with demo account”** to explore it instantly.

### Desktop app (Electron)

```bash
php artisan native:serve     # run the desktop app in dev
php artisan native:build     # build a distributable
```

## 🛠️ Development

```bash
bun run dev            # Vite dev server
bun run lint           # ESLint --fix
bun run format         # Prettier
php artisan test       # backend tests
```

> ℹ️ The app serves the **production build**, so run `bun run build` (and `vite build --ssr`)
> to see source changes locally.

## 🌍 Internationalization

UI strings live in `resources/js/locales/{en,fr}/common.json` and are rendered with
`useTranslation()`. The locale follows the user's `language` preference, shared via Inertia.
Contributions to additional locales are welcome.

## 🤝 Contributing

Contributions, issues and feature requests are welcome. Please open an issue to discuss
significant changes before submitting a pull request. Make sure `bun run lint` and
`php artisan test` pass.

## 📦 Releases

Current version: **v0.0.1** — early preview. See [Releases](https://github.com/MakFly/linear-electron/releases).

## 📄 License

Released under the [MIT License](#license).

---

<p align="center"><sub>Built with Laravel, Inertia & React. Not affiliated with Linear.</sub></p>
