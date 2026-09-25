# Samba Book Selling Platform - Backend

Java 21 · Spring Boot 3.3 · Spring Security + JWT · Spring Data JPA · MySQL · Maven

> Full project documentation (architecture, API reference, deployment, etc.)
> lives in the [root README](../README.md). This file is just a quick start.

## Run
1. Create DB (or let `createDatabaseIfNotExist=true` do it):
   `CREATE DATABASE samba_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Set env vars (see `application.properties`): `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (>=32 chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. `mvn spring-boot:run` -> http://localhost:8080 (or set `PORT`/`SERVER_PORT` to change it)

Default admin (seeded on first start): `admin@samba.com` / `Admin@123` - change before deploying.
Sample categories/books are seeded when the DB is empty (`SEED_SAMPLE_DATA=false` to disable; defaults to `false` when `SPRING_PROFILES_ACTIVE=prod`).

## Auth
`POST /api/auth/login` returns `{token, tokenType, expiresInMs, user}`. Send `Authorization: Bearer <token>`.

## Endpoints
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/books?keyword&categoryId&minPrice&maxPrice&page&size&sortBy&direction | public |
| GET | /api/books/{id} | public |
| GET | /api/categories, /api/categories/{id} | public |
| GET / PUT | /api/users/me | USER/ADMIN |
| PUT | /api/users/me/password | USER/ADMIN |
| GET | /api/cart | auth |
| POST | /api/cart/items `{bookId, quantity}` | auth |
| PUT | /api/cart/items/{itemId} `{quantity}` | auth |
| DELETE | /api/cart/items/{itemId} | auth |
| DELETE | /api/cart | auth |
| POST | /api/orders/checkout `{shippingAddress, phone, paymentMethod: COD/CARD/UPI}` | auth |
| GET | /api/orders?page&size | auth |
| GET | /api/orders/{id} | auth (own orders) |
| POST | /api/orders/{id}/cancel | auth (own, PENDING only) |
| GET | /api/admin/dashboard | ADMIN |
| POST/PUT/DELETE | /api/admin/books, /api/admin/books/{id} | ADMIN |
| PATCH | /api/admin/books/{id}/stock `{stock}` | ADMIN |
| POST/PUT/DELETE | /api/admin/categories, /api/admin/categories/{id} | ADMIN |
| GET | /api/admin/users?keyword&page&size, /api/admin/users/{id} | ADMIN |
| PATCH | /api/admin/users/{id}/status `{enabled}` | ADMIN |
| GET | /api/admin/orders?status&page&size, /api/admin/orders/{id} | ADMIN |
| PATCH | /api/admin/orders/{id}/status `{status}` | ADMIN |

Order status flow: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED; PENDING/CONFIRMED -> CANCELLED (stock is restored).
Book delete is a soft delete (order history stays intact). Payment method is recorded only; no payment gateway.

## Validation rules worth knowing
- Password (register / change password): 8-64 characters, at least one letter and one number.
- Phone (register / update profile / checkout): digits, spaces or `-`, optional leading `+`, 7-20 characters.
- Shipping address (checkout): at least 10 characters.
- Book price: at least 0.01, up to 2 decimal places. Book stock: 0 or more (whole number).
- Cart quantity: 1-99.
- All of the above are enforced server-side regardless of what the frontend sends.
