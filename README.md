# Password Vault

A personal password manager: Laravel 12 API with Sanctum tokens, and a React 18 + Ant Design single-page app built with Vite.

## Features

- **Vault** – logins, secure notes, cards and identities with search, folder and type filters, and pagination.
- **Secrets stay secret** – passwords and notes are encrypted at rest with your `APP_KEY`. Lists never include them; one is fetched only when you reveal or copy it, and a revealed password hides itself after 20 seconds.
- **Folders** – group items; deleting a folder keeps its items.
- **Dashboard** – counts, items per type, and a security score that flags weak and reused passwords.
- **Generator** – passwords from `crypto.getRandomValues`, with length, character sets and a look-alike filter. Also built into the item form.
- **Import / export** – CSV in the same columns both ways, up to 1000 rows per import in one transaction.
- Light and dark theme, works down to phone width.

## Requirements

PHP 8.2+, Composer 2, Node 20.19+ (or 22.12+), and MySQL or SQLite.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# set the DB_* values in .env, then:
php artisan migrate
npm install
npm run build
php artisan serve
```

Open http://127.0.0.1:8000 and create an account. For frontend work, run `npm run dev` next to `php artisan serve` for hot reload.

> **Keep `APP_KEY` safe and never change it on a live install.** Vault passwords and notes are encrypted with it; a new key makes them unreadable.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `SANCTUM_TOKEN_EXPIRATION` | `10080` | Minutes a login stays valid (7 days). |

Login and sign-up are limited to 10 attempts a minute per email and IP; the rest of the API to 120 requests a minute per user.

## API

All routes are under `/api` and, apart from register and login, need `Authorization: Bearer <token>`.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register` | `name`, `email`, `password`, `password_confirmation` → `{ token, user }` |
| POST | `/auth/login` | `email`, `password` → `{ token, user }` |
| GET | `/auth/me` | Current user |
| POST | `/auth/logout` | Revokes the current token |
| GET | `/dashboard` | Counts, per-type totals, health report, recent items |
| GET | `/categories` | Item types |
| GET/POST | `/folders` | List (with `items_count`) / create |
| PUT/DELETE | `/folders/{id}` | Rename / delete (items move to "no folder") |
| GET | `/items` | `search`, `folder_id` (id or `none`), `category_id`, `sort` (`name`, `recent`), `per_page` ≤ 100 |
| POST | `/items` | Create |
| GET/PUT/PATCH/DELETE | `/items/{id}` | Show (includes password and notes) / update / delete |
| GET | `/vault/export` | CSV download |
| POST | `/vault/import` | `{ rows: [{ name, type_id, folder_name, username, password, url, notes }] }` |

Every query is scoped to the signed-in user: another user's ids return 404.

## Upgrading from the old version

`php artisan migrate` encrypts existing passwords and notes and adds the default types if the table is empty. Accounts created before the upgrade (md5 hashes) are moved to bcrypt the first time they log in.

## Tests

```bash
vendor/bin/phpunit
```

Feature tests run on in-memory SQLite and cover auth, user isolation, encryption, import/export and the dashboard.
