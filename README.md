# 📚 Samba — Book Selling Platform

A full-stack e-commerce application for browsing and buying books, with a
separate admin panel for managing the catalogue, categories, users and
orders. Built as a Java Full Stack portfolio project: **React** on the
frontend, **Spring Boot** on the backend, **MySQL** for storage, and **JWT**
for stateless authentication.

> Live demo: _add your deployed URLs here once deployed_
> Backend: `https://your-backend.onrender.com` · Frontend: `https://your-app.vercel.app`

---

## Table of contents

1. [Description](#description)
2. [Features](#features)
3. [Technology stack](#technology-stack)
4. [Architecture](#architecture)
5. [Database structure](#database-structure)
6. [API documentation](#api-documentation)
7. [Authentication flow](#authentication-flow)
8. [User flow](#user-flow)
9. [Admin flow](#admin-flow)
10. [Project structure](#project-structure)
11. [Local setup](#local-setup)
12. [Environment variables](#environment-variables)
13. [Database setup](#database-setup)
14. [Backend setup](#backend-setup)
15. [Frontend setup](#frontend-setup)
16. [Deployment](#deployment)
17. [Screenshots](#screenshots)
18. [Future enhancements](#future-enhancements)
19. [Known limitations](#known-limitations)

---

## Description

Samba is a two-sided book store: customers can register, browse and search a
catalogue, manage a cart, check out, and track their order history; admins
manage the book catalogue, categories, users and order fulfilment from a
separate panel. The backend is a REST API secured with JWT and role-based
authorization (`USER` / `ADMIN`); the frontend is a single-page React app
that consumes it. There is no payment gateway — checkout records a chosen
payment method (Cash on Delivery, Card or UPI) but does not process a real
payment. That is intentionally listed under [Future enhancements](#future-enhancements)
rather than faked.

## Features

**Public**
- Browse the catalogue, search by title/author/ISBN, filter by category and
  price range, sort by title/author/price/newest.
- View book details.

**Customer (role `USER`)**
- Register / log in with a JWT-secured session.
- Add to cart, change quantity, remove items — all validated against live
  stock.
- Checkout with shipping address, phone and payment method.
- View order history and per-order details with a status timeline.
- Cancel a `PENDING` order (restocks the books).
- Edit profile, change password.

**Admin (role `ADMIN`)**
- Dashboard: revenue, order/book/user counts, orders-by-status breakdown,
  low-stock count, recent orders.
- Full CRUD on books (with inline stock editing) and categories.
- View and search users; enable/disable accounts (cannot disable self).
- View and filter orders; move an order through its allowed status
  transitions (`PENDING → CONFIRMED → SHIPPED → DELIVERED`, or
  `PENDING/CONFIRMED → CANCELLED`, which restocks the books).

**Cross-cutting**
- Centralized error handling with consistent JSON error responses and the
  correct HTTP status for every case (400/401/403/404/409/500).
- Server-side validation on every write endpoint (never trusts the client).
- Responsive UI (desktop / tablet / mobile), loading states, empty states,
  toasts, and graceful handling of broken cover images.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Axios, Vite, custom CSS (no UI kit) |
| Backend | Java 21, Spring Boot 3.3, Spring Web, Spring Security, Spring Data JPA / Hibernate |
| Auth | JWT (`jjwt`), BCrypt password hashing |
| Database | MySQL 8 |
| Build tools | Maven (backend), npm/Vite (frontend) |
| Deployment target | Render or Railway (backend), Vercel (frontend) — no Docker |

## Architecture

Classic layered REST architecture on the backend, consumed by a
component-based SPA on the frontend:

```
React (pages/components)
   │  axios, JWT in Authorization header
   ▼
Spring Boot Controller   (@RestController — request/response only, no business logic)
   │
   ▼
Service                  (@Service, @Transactional — business rules, validation, orchestration)
   │
   ▼
Repository                (Spring Data JPA — query methods / Specifications)
   │
   ▼
Hibernate (JPA provider) → MySQL
```

- **Controllers** only translate HTTP ⇄ DTOs and delegate to services — no
  business logic lives here.
- **Services** hold every business rule (stock checks, order-status
  transitions, password hashing, uniqueness checks) and own the
  `@Transactional` boundaries.
- **Repositories** are thin Spring Data JPA interfaces; `BookSpecifications`
  builds the dynamic search/filter query.
- **DTOs** (Java records) are the only objects that cross the controller
  boundary — entities are never serialized directly to JSON, so the API
  shape is decoupled from the database schema.
- **EntityMapper** is a single, explicit place where entities become DTOs.
- On the frontend, `src/api/*.js` is the only place that knows an HTTP
  endpoint exists; `src/context/*` centralizes auth and cart state so no
  component talks to `localStorage` or axios directly.

## Database structure

MySQL, created/updated automatically by Hibernate (`ddl-auto=update`) from
the JPA entities — no manual DDL to run.

| Table | Purpose | Key relationships |
|---|---|---|
| `users` | Account, role (`USER`/`ADMIN`), hashed password, enabled flag | 1:1 → `carts`, 1:M → `orders` |
| `categories` | Book categories | 1:M → `books` (delete blocked while books reference it) |
| `books` | Catalogue; `active` flag for soft delete | M:1 → `categories` |
| `carts` | One per user | 1:1 → `users`, 1:M → `cart_items` |
| `cart_items` | Book + quantity in a cart | M:1 → `carts`, M:1 → `books`; **unique (cart_id, book_id)** — prevents duplicate rows for the same book |
| `orders` | A placed order; status, totals, shipping/payment info | M:1 → `users`, 1:M → `order_items` |
| `order_items` | Snapshot of book title/price/quantity at purchase time | M:1 → `orders`, M:1 → `books` |

**Constraints & indexes worth knowing**
- `users.email`, `categories.name`, `books.isbn` — unique constraints.
- `cart_items(cart_id, book_id)` — composite unique constraint (the actual
  mechanism preventing duplicate cart rows for the same book).
- `books(title)`, `books(author)` — indexes to keep search responsive.
- Cascades: deleting a `User`'s cart cascades to its `CartItem`s
  (`orphanRemoval`); deleting an `Order` cascades to its `OrderItem`s.
  **Books are never hard-deleted** — "delete" sets `active=false`, which
  keeps past `OrderItem`s valid and intact while removing the book from the
  catalogue and from every cart that held it.
- `order_items` stores its own `bookTitle`/`unitPrice`/`subtotal` snapshot,
  so an order's history stays accurate even if the book's price changes or
  the book is later removed from sale.

**Sample/initial data** — on first startup, `DataSeeder` creates one
`ADMIN` account (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, default
`admin@samba.com` / `Admin@123`) and, if the database is empty, 5 sample
categories and 8 sample books (toggle with `SEED_SAMPLE_DATA`). In
production this defaults to **off** (see [Environment variables](#environment-variables)).

## API documentation

Base path: `/api`. JWT required unless marked public. `ADMIN` endpoints
also require the `ADMIN` role.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a `USER` account, returns a JWT |
| POST | `/auth/login` | Public | Authenticate, returns a JWT |
| GET | `/books?keyword&categoryId&minPrice&maxPrice&page&size&sortBy&direction` | Public | Search/filter/sort/paginate the catalogue |
| GET | `/books/{id}` | Public | Book details |
| GET | `/categories` | Public | List categories |
| GET | `/categories/{id}` | Public | Category details |
| GET | `/users/me` | Any user | Current profile |
| PUT | `/users/me` | Any user | Update profile |
| PUT | `/users/me/password` | Any user | Change password |
| GET | `/cart` | USER | View cart |
| POST | `/cart/items` | USER | Add a book to the cart |
| PUT | `/cart/items/{itemId}` | USER | Update quantity |
| DELETE | `/cart/items/{itemId}` | USER | Remove an item |
| DELETE | `/cart` | USER | Clear the cart |
| POST | `/orders/checkout` | USER | Convert the cart into an order |
| GET | `/orders?page&size` | USER | Order history |
| GET | `/orders/{id}` | USER | Order details (own orders only) |
| POST | `/orders/{id}/cancel` | USER | Cancel a `PENDING` order |
| GET | `/admin/dashboard` | ADMIN | Stats: revenue, counts, orders by status, recent orders |
| POST | `/admin/books` | ADMIN | Create a book |
| PUT | `/admin/books/{id}` | ADMIN | Update a book |
| PATCH | `/admin/books/{id}/stock` | ADMIN | Update stock only |
| DELETE | `/admin/books/{id}` | ADMIN | Soft-delete a book |
| POST | `/admin/categories` | ADMIN | Create a category |
| PUT | `/admin/categories/{id}` | ADMIN | Update a category |
| DELETE | `/admin/categories/{id}` | ADMIN | Delete a category (blocked if it still has books) |
| GET | `/admin/users?keyword&page&size` | ADMIN | List/search users |
| GET | `/admin/users/{id}` | ADMIN | User details |
| PATCH | `/admin/users/{id}/status` | ADMIN | Enable/disable a user |
| GET | `/admin/orders?status&page&size` | ADMIN | List/filter orders |
| GET | `/admin/orders/{id}` | ADMIN | Order details |
| PATCH | `/admin/orders/{id}/status` | ADMIN | Move an order to its next status |

**Error shape** (every non-2xx response):
```json
{
  "timestamp": "2026-09-25T10:15:30",
  "status": 400,
  "error": "Bad Request",
  "message": "Only 3 copies of 'Clean Code' available",
  "path": "/api/cart/items",
  "validationErrors": { "field": "message" }
}
```

## Authentication flow

```
1. POST /api/auth/register or /api/auth/login
      Spring Security's AuthenticationManager verifies the password
      against the BCrypt hash stored in `users.password`
2. Backend returns { token, tokenType, expiresInMs, user }
      token = a JWT signed with HS256, subject = email, claim "role" = USER|ADMIN
3. Frontend stores the token (localStorage) and the user object
4. Every subsequent request: axios interceptor adds
      Authorization: Bearer <token>
5. JwtAuthFilter (a OncePerRequestFilter) runs before Spring Security's
   authorization check on every request:
      - no/malformed header  → request proceeds as anonymous
      - valid signature+claims → SecurityContext is populated with the
        user's authorities (ROLE_USER or ROLE_ADMIN)
      - invalid/expired token → SecurityContext stays empty
6. SecurityConfig's authorizeHttpRequests rules then decide:
      - public endpoints        → allowed regardless
      - /api/admin/**           → requires ROLE_ADMIN → 403 otherwise
      - everything else         → requires any authenticated user → 401 otherwise
7. Frontend: a 401 on any authenticated call triggers a global logout
   and redirect to /login (handled once, centrally, in AuthContext —
   not repeated in every component)
```

This is the exact chain to describe in an interview:
**React login form → POST /api/auth/login → Spring Security
AuthenticationManager → BCrypt password check → JWT issued → stored
client-side → sent as a Bearer header → JwtAuthFilter validates it on
every request → SecurityConfig enforces role-based authorization.**

## User flow

Register/Login → Browse/Search/Filter books → Book details → Add to cart →
Adjust quantity → Checkout (address, phone, payment method) → Order placed
(stock decremented server-side, inside one transaction) → Order history →
Order details → optionally cancel while `PENDING`.

## Admin flow

Login (same form, redirected by role) → Admin dashboard (stats) → Manage
books (create/edit/soft-delete, inline stock edits) → Manage categories →
Manage users (search, enable/disable) → Manage orders (filter by status,
move to the next allowed status).

## Project structure

```
samba-book-platform/
├── README.md                     ← this file
├── backend/
│   ├── pom.xml
│   ├── README.md                 ← backend quick-start
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties        (defaults, all overridable by env vars)
│       │   └── application-prod.properties    (safer prod defaults, profile "prod")
│       └── java/com/samba/
│           ├── SambaApplication.java
│           ├── config/            SecurityConfig, DataSeeder
│           ├── security/          JwtService, JwtAuthFilter, CustomUserDetailsService,
│           │                      RestAuthEntryPoint, RestAccessDeniedHandler
│           ├── entity/            User, Role, Category, Book, Cart, CartItem,
│           │                      Order, OrderItem, OrderStatus, BaseEntity
│           ├── repository/        UserRepository, CategoryRepository, BookRepository
│           │                      (+ BookSpecifications), CartRepository,
│           │                      CartItemRepository, OrderRepository
│           ├── dto/                23 request/response records
│           ├── mapper/            EntityMapper
│           ├── service/           AuthService, UserService, CategoryService,
│           │                      BookService, CartService, OrderService, AdminService
│           ├── controller/        Auth, User, Book, Category, Cart, Order,
│           │                      AdminBook, AdminCategory, AdminOrder, AdminUser,
│           │                      AdminDashboard
│           └── exception/         ApiError, ResourceNotFoundException,
│                                  BadRequestException, ConflictException,
│                                  GlobalExceptionHandler
└── frontend/
    ├── package.json  vite.config.js  index.html  vercel.json
    ├── .env.example
    ├── README.md                 ← frontend quick-start
    └── src/
        ├── main.jsx  App.jsx     (routes)
        ├── api/                  client.js (axios, JWT header, 401 handling),
        │                         auth, users, books, categories, cart, orders, admin
        ├── context/              AuthContext, CartContext, ToastContext
        ├── hooks/                useFetch, useDebounce
        ├── utils/                format, validators, nav
        ├── layouts/              MainLayout, AdminLayout
        ├── components/           Navbar, Footer, Loader, Alert, EmptyState, Modal,
        │                         ConfirmDialog, Pagination, StatusBadge, Field,
        │                         BookCover, BookCard, QtyStepper, AddToCartButton,
        │                         OrderTimeline, ProtectedRoute
        ├── pages/                Home, Login, Register, Books, BookDetails, Dashboard,
        │                         Profile, Cart, Checkout, OrderSuccess, MyOrders,
        │                         OrderDetails, NotFound
        ├── pages/admin/          AdminDashboard, ManageBooks, BookForm,
        │                         ManageCategories, ManageUsers, ManageOrders
        └── styles/index.css
```

## Local setup

Prerequisites: **Java 21**, **Maven**, **Node.js 18+**, **MySQL 8** running
locally.

```bash
# 1. clone, then from the project root:

# 2. database
mysql -u root -p -e "CREATE DATABASE samba_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. backend (terminal 1)
cd backend
export DB_USERNAME=root DB_PASSWORD=yourpassword JWT_SECRET=$(openssl rand -base64 48)
mvn spring-boot:run          # http://localhost:8080

# 4. frontend (terminal 2)
cd frontend
cp .env.example .env         # defaults already point at http://localhost:8080/api
npm install
npm run dev                  # http://localhost:5173
```

Log in as the seeded admin (`admin@samba.com` / `Admin@123`), or register a
new customer account.

## Environment variables

### Backend (`backend/src/main/resources/application.properties`)

| Variable | Default | Notes |
|---|---|---|
| `PORT` / `SERVER_PORT` | `8080` | `PORT` is what Render/Railway inject automatically |
| `DB_HOST` | `localhost` | |
| `DB_PORT` | `3306` | |
| `DB_NAME` | `samba_db` | |
| `DB_USERNAME` | `root` | |
| `DB_PASSWORD` | `change_me` | **must** be set outside local dev |
| `DDL_AUTO` | `update` | Hibernate schema strategy |
| `SHOW_SQL` | `false` | |
| `JWT_SECRET` | (placeholder) | **must** be a long random string in any real deployment — generate with `openssl rand -base64 48` |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | comma-separated; add your deployed frontend URL |
| `ADMIN_NAME` | `Samba Admin` | seeded admin account |
| `ADMIN_EMAIL` | `admin@samba.com` | |
| `ADMIN_PASSWORD` | `Admin@123` | **change this before deploying** |
| `SEED_SAMPLE_DATA` | `true` locally, `false` under the `prod` profile | demo categories/books |
| `SPRING_PROFILES_ACTIVE` | _(none)_ | set to `prod` to apply `application-prod.properties` |

Alternatively, the entire datasource can be overridden directly via Spring
Boot's standard `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` /
`SPRING_DATASOURCE_PASSWORD` env vars if your MySQL provider gives you a
full connection string.

### Frontend (`frontend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | point this at your deployed backend + `/api` |
| `VITE_CURRENCY` | `USD` | any ISO 4217 code, changes price formatting only |

## Database setup

Works with any managed MySQL 8 instance (Railway's MySQL plugin, Render's
managed MySQL/PlanetScale, AWS RDS, etc.):

1. Provision a MySQL 8 database and note its host, port, database name,
   username and password.
2. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` (or the
   single `SPRING_DATASOURCE_URL` override) on the backend service.
3. Leave `DDL_AUTO=update` for the first deploy — Hibernate creates every
   table from the JPA entities automatically. No manual SQL is required.
4. If your provider requires TLS, append `&useSSL=true&requireSSL=true` to
   `SPRING_DATASOURCE_URL`, or use the provider-specific connection string
   they give you directly.
5. Once the schema is stable, consider switching `DDL_AUTO` to `validate`
   (fails fast on drift instead of silently altering tables) — see
   [Future enhancements](#future-enhancements) re: migrations.

## Backend setup

```bash
cd backend
mvn clean package -DskipTests   # produces target/samba-backend-1.0.0.jar
java -jar target/samba-backend-1.0.0.jar
```
Or for local development: `mvn spring-boot:run`.

## Frontend setup

```bash
cd frontend
npm install
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Deployment

No Docker — both halves deploy from source with a build command and a
start command.

### Backend → Render or Railway

1. Push this repository to GitHub.
2. Create a new **Web Service** (Render) or **Service from repo** (Railway),
   root directory `backend`.
3. Build command: `mvn clean package -DskipTests`
   Start command: `java -jar target/samba-backend-1.0.0.jar`
4. Add the backend environment variables from the table above — at minimum
   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`,
   `JWT_SECRET`, `ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS` (your Vercel URL),
   and `SPRING_PROFILES_ACTIVE=prod`.
5. Provision MySQL: Railway has a one-click MySQL plugin; on Render, use an
   external managed MySQL (Render's own managed databases are Postgres) —
   e.g. PlanetScale or a small MySQL instance elsewhere.
6. Deploy. Both platforms set `PORT` automatically — `application.properties`
   already reads it.

### Frontend → Vercel

1. Import the repository into Vercel, root directory `frontend`.
2. Framework preset: **Vite**. Build command `npm run build`, output
   directory `dist` (Vercel auto-detects both).
3. Add environment variable `VITE_API_BASE_URL` = your deployed backend URL
   + `/api` (e.g. `https://samba-backend.onrender.com/api`).
4. Deploy. `vercel.json` is already included so client-side routes (e.g.
   `/books/12`) don't 404 on refresh.
5. Once you have the Vercel URL, add it to the backend's
   `CORS_ALLOWED_ORIGINS` and redeploy the backend.

## Screenshots

> _Add screenshots here before sharing the repo — suggested set:_
- [ ] Home page
- [ ] Book catalogue with filters
- [ ] Book details page
- [ ] Cart
- [ ] Checkout
- [ ] Order history / order details
- [ ] Admin dashboard
- [ ] Admin manage books / categories / users / orders
- [ ] Mobile view (nav + book grid)

## Future enhancements

Listed honestly as **not implemented**, not faked:
- **Real payment gateway** (Stripe/Razorpay) — checkout currently records a
  chosen payment method only.
- **Database migrations** (Flyway/Liquibase) instead of
  `ddl-auto=update`, for safe schema evolution over time.
- **Refresh tokens** — the JWT currently just expires (24h default) and the
  user has to log back in; no silent refresh.
- **Email notifications** (order confirmation, status changes).
- **Product reviews/ratings**.
- **Rate limiting** on auth endpoints.
- **Automated tests** (unit/integration) — not included in this pass.
- **Book cover uploads** — currently a book's cover is an external image
  URL, not a file upload.

## Known limitations

- The JWT is stored in `localStorage`, not an httpOnly cookie — acceptable
  here since the app renders no untrusted HTML, but worth knowing.
- No automated test suite is included.
- Order listing queries are not batch-optimized (fine at demo scale; would
  want `@EntityGraph`/`JOIN FETCH` under real load — see Future enhancements).


## Role-based access

Samba uses two roles:
- `USER`: customer/student pages only. Admin navigation and `/admin/**` are hidden and protected.
- `ADMIN`: admin pages only for administration. `/api/admin/**` requires `ROLE_ADMIN`.

New user registration always creates `USER`. The role is never accepted from the public registration request.

If a USER manually opens an admin URL, the frontend redirects them to their user home and the backend returns 403 for admin API calls. If an ADMIN tries to open USER-only learning/customer routes, the frontend redirects them to the admin area and the learning API requires `ROLE_USER`.
