# 📚 Samba — Full-Stack Book & Learning Platform

> A production-style Java Full Stack portfolio project built with **React, Spring Boot, Spring Security, JWT, JPA/Hibernate, and MySQL**.

Samba is a full-stack platform designed for **book discovery, online book purchasing, doorstep delivery, and role-based administration**. The platform separates customer and administrator capabilities using **JWT-based authentication and role-based authorization**.

The application follows a clean **layered REST architecture**, with React providing the frontend experience and Spring Boot exposing secure REST APIs backed by MySQL.

---

## 🚀 Project Overview

Samba provides two primary experiences:

### 👤 Customer Experience

Customers can:

* Register and authenticate securely.
* Browse the available book catalogue.
* Search books by title, author, or ISBN.
* Filter books by category and price.
* Sort books by title, author, price, or newest.
* View detailed book information.
* Add books to a shopping cart.
* Update cart quantities.
* Remove books from the cart.
* Checkout with shipping information.
* Select a payment method.
* Track placed orders.
* View order history.
* Cancel eligible pending orders.
* Manage their profile.
* Change their password.

### 🛠️ Administrator Experience

Administrators have a completely separate administration area where they can:

* View dashboard statistics.
* Manage books.
* Manage categories.
* Manage users.
* Enable or disable user accounts.
* Monitor customer orders.
* Filter orders by status.
* Update order status.
* Monitor inventory.
* View recent orders and revenue statistics.

### 🔐 Security

The application implements:

* JWT authentication.
* BCrypt password hashing.
* Spring Security.
* Role-based authorization.
* Protected REST APIs.
* Protected React routes.
* `USER` and `ADMIN` roles.
* Server-side authorization checks.
* Centralized authentication handling.

A normal customer cannot access administrative APIs even by manually entering an admin URL.

---

# ✨ Key Features

## 📖 Book Catalogue

Customers can browse a responsive catalogue with:

* Book cover images.
* Title.
* Author.
* ISBN.
* Publisher.
* Category.
* Price.
* Available stock.
* Active/inactive catalogue status.

### Search & Filtering

The catalogue supports:

* Keyword search.
* Category filtering.
* Minimum price.
* Maximum price.
* Sorting.
* Pagination.

Supported sorting options include:

```text
Title
Author
Price
Newest
```

---

## 🛒 Shopping Cart

The cart supports:

* Add book.
* Update quantity.
* Remove item.
* Clear cart.
* Live stock validation.
* Duplicate-item prevention.

The backend validates stock before modifying the cart and again during checkout.

---

## 📦 Order Management

Customers can place orders using their cart.

Checkout captures:

* Shipping address.
* Phone number.
* Payment method.
* Ordered books.
* Quantity.
* Total amount.

### Order Lifecycle

```text
PENDING
   ↓
CONFIRMED
   ↓
SHIPPED
   ↓
DELIVERED
```

Cancellation is available for eligible orders:

```text
PENDING ─────→ CANCELLED
     │
     └────────→ CONFIRMED ─────→ CANCELLED
```

Cancelled orders restock the associated books.

---

# 💳 Payment Handling

The current application **does not process real payments**.

Customers can select:

* Cash on Delivery
* Card
* UPI

The selected method is stored with the order, but no actual payment gateway transaction is performed.

This limitation is intentionally documented rather than presenting simulated payment processing as a real integration.

### Planned Payment Integration

Future versions can integrate:

* Razorpay
* Stripe
* Other payment providers

---

# 👨‍💼 Admin Management

The administrator has access to a dedicated admin interface.

## Dashboard

The dashboard provides:

* Total revenue.
* Total orders.
* Total books.
* Total users.
* Low-stock information.
* Orders grouped by status.
* Recent orders.

## Book Management

Administrators can:

* Add books.
* Edit books.
* Update stock.
* Soft-delete books.
* Manage book information.
* Associate books with categories.

## Category Management

Administrators can:

* Create categories.
* Update categories.
* Delete categories when allowed.

Categories containing books cannot be deleted until their references are removed.

## User Management

Administrators can:

* Search users.
* View user information.
* Enable accounts.
* Disable accounts.

An administrator cannot disable their own account.

## Order Management

Administrators can:

* Search orders.
* Filter by status.
* View order details.
* Update order status.
* Monitor fulfilment progress.

---

# 🔐 Role-Based Access Control

Samba implements role-based access control using **Spring Security + JWT**.

There are two application roles:

```text
USER
ADMIN
```

## USER

A `USER` can access customer functionality such as:

```text
Home
Books
Book Details
Cart
Checkout
My Orders
Order Details
Profile
```

A user cannot access:

```text
Admin Dashboard
Manage Books
Manage Categories
Manage Users
Manage Orders
```

## ADMIN

An `ADMIN` can access:

```text
Admin Dashboard
Manage Books
Manage Categories
Manage Users
Manage Orders
```

### Backend Protection

Administrative APIs require:

```text
ROLE_ADMIN
```

For example:

```http
GET /api/admin/dashboard
```

requires administrator authorization.

A normal user attempting to access an administrative API receives:

```text
403 Forbidden
```

### Registration Security

Public registration does **not** accept a role from the client.

Every newly registered account is created as:

```text
USER
```

The client cannot register itself as an administrator.

---

# 🔑 Authentication Architecture

The authentication process follows this flow:

```text
React Login Form
       │
       ▼
POST /api/auth/login
       │
       ▼
Spring Security AuthenticationManager
       │
       ▼
BCrypt Password Verification
       │
       ▼
JWT Generated
       │
       ▼
React Stores JWT
       │
       ▼
Authorization: Bearer <token>
       │
       ▼
JwtAuthFilter
       │
       ▼
JWT Validation
       │
       ▼
SecurityContext
       │
       ▼
Role-Based Authorization
```

### JWT Payload

The JWT contains the authenticated user's identity and role information.

The backend uses the JWT to establish the authenticated security context for subsequent requests.

---

# 🏗️ System Architecture

Samba follows a classic layered architecture.

```text
┌───────────────────────────────┐
│          React SPA            │
│ Pages / Components / Context  │
└───────────────┬───────────────┘
                │
                │ Axios + JWT
                ▼
┌───────────────────────────────┐
│      Spring Boot REST API     │
│          Controllers          │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           Services            │
│ Business Logic / Transactions │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         Repositories          │
│        Spring Data JPA        │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Hibernate / JPA         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           MySQL 8             │
└───────────────────────────────┘
```

## Architectural Responsibilities

### Controller Layer

Controllers are responsible for:

* Receiving HTTP requests.
* Validating request structure.
* Delegating operations to services.
* Returning API responses.

Business logic is not placed directly inside controllers.

### Service Layer

Services contain the application business rules, including:

* Stock validation.
* Cart operations.
* Checkout.
* Order processing.
* Order-status transitions.
* Password changes.
* User management.
* Category validation.

Transactional operations are handled at the service layer.

### Repository Layer

Repositories use Spring Data JPA for:

* Database access.
* Query methods.
* Filtering.
* Pagination.
* Sorting.

### DTO Layer

DTOs are used between the controller and client layers.

Entities are not directly exposed as API responses.

This keeps the API contract separated from the database model.

### Mapper Layer

`EntityMapper` provides explicit conversion between entities and DTOs.

---

# 🗄️ Database Design

Samba uses **MySQL 8** with **JPA/Hibernate**.

Hibernate automatically creates or updates the schema using:

```properties
spring.jpa.hibernate.ddl-auto=update
```

## Entity Relationships

```text
User
 │
 ├────────────── Cart
 │                  │
 │                  └── CartItem ─── Book
 │
 └────────────── Order
                    │
                    └── OrderItem ─── Book

Category
   │
   └────────────── Books
```

## Main Tables

| Table         | Purpose                                 |
| ------------- | --------------------------------------- |
| `users`       | User accounts, roles and account status |
| `categories`  | Book categories                         |
| `books`       | Book catalogue                          |
| `carts`       | User shopping carts                     |
| `cart_items`  | Books stored in carts                   |
| `orders`      | Customer orders                         |
| `order_items` | Ordered book snapshots                  |

---

# 🧩 Data Integrity

The application includes several database-level and application-level safeguards.

### Unique Constraints

Unique values include:

```text
users.email
categories.name
books.isbn
```

### Cart Constraint

A cart cannot contain duplicate rows for the same book.

The database uses:

```text
(cart_id, book_id)
```

as a composite unique constraint.

### Order Snapshot

`order_items` stores:

```text
bookTitle
unitPrice
quantity
subtotal
```

This preserves historical order information even if the original book:

* changes price,
* changes details,
* becomes inactive.

### Soft Delete

Books are not physically deleted from the database.

Instead:

```text
active = false
```

This preserves historical order references.

---

# 🔌 REST API

Base URL:

```text
/api
```

## Authentication

| Method | Endpoint         | Access | Purpose             |
| ------ | ---------------- | ------ | ------------------- |
| POST   | `/auth/register` | Public | Register a customer |
| POST   | `/auth/login`    | Public | Authenticate user   |

## Books

| Method | Endpoint      | Access | Purpose                      |
| ------ | ------------- | ------ | ---------------------------- |
| GET    | `/books`      | Public | Search/filter/paginate books |
| GET    | `/books/{id}` | Public | View book details            |

Supported query parameters:

```text
keyword
categoryId
minPrice
maxPrice
page
size
sortBy
direction
```

## Categories

| Method | Endpoint           | Access | Purpose         |
| ------ | ------------------ | ------ | --------------- |
| GET    | `/categories`      | Public | List categories |
| GET    | `/categories/{id}` | Public | View category   |

## User Profile

| Method | Endpoint             | Access        | Purpose         |
| ------ | -------------------- | ------------- | --------------- |
| GET    | `/users/me`          | Authenticated | View profile    |
| PUT    | `/users/me`          | Authenticated | Update profile  |
| PUT    | `/users/me/password` | Authenticated | Change password |

## Cart

| Method | Endpoint               | Access | Purpose         |
| ------ | ---------------------- | ------ | --------------- |
| GET    | `/cart`                | USER   | View cart       |
| POST   | `/cart/items`          | USER   | Add item        |
| PUT    | `/cart/items/{itemId}` | USER   | Update quantity |
| DELETE | `/cart/items/{itemId}` | USER   | Remove item     |
| DELETE | `/cart`                | USER   | Clear cart      |

## Orders

| Method | Endpoint              | Access | Purpose              |
| ------ | --------------------- | ------ | -------------------- |
| POST   | `/orders/checkout`    | USER   | Place order          |
| GET    | `/orders`             | USER   | Order history        |
| GET    | `/orders/{id}`        | USER   | View own order       |
| POST   | `/orders/{id}/cancel` | USER   | Cancel pending order |

## Administration

| Method | Endpoint                    | Access | Purpose              |
| ------ | --------------------------- | ------ | -------------------- |
| GET    | `/admin/dashboard`          | ADMIN  | Dashboard statistics |
| POST   | `/admin/books`              | ADMIN  | Create book          |
| PUT    | `/admin/books/{id}`         | ADMIN  | Update book          |
| PATCH  | `/admin/books/{id}/stock`   | ADMIN  | Update stock         |
| DELETE | `/admin/books/{id}`         | ADMIN  | Soft-delete book     |
| POST   | `/admin/categories`         | ADMIN  | Create category      |
| PUT    | `/admin/categories/{id}`    | ADMIN  | Update category      |
| DELETE | `/admin/categories/{id}`    | ADMIN  | Delete category      |
| GET    | `/admin/users`              | ADMIN  | Search users         |
| GET    | `/admin/users/{id}`         | ADMIN  | User details         |
| PATCH  | `/admin/users/{id}/status`  | ADMIN  | Enable/disable user  |
| GET    | `/admin/orders`             | ADMIN  | Search/filter orders |
| GET    | `/admin/orders/{id}`        | ADMIN  | Order details        |
| PATCH  | `/admin/orders/{id}/status` | ADMIN  | Update order status  |

---

# ⚠️ API Error Handling

The backend uses centralized exception handling.

Typical HTTP responses include:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Example:

```json
{
  "timestamp": "2026-09-25T10:15:30",
  "status": 400,
  "error": "Bad Request",
  "message": "Only 3 copies of 'Clean Code' available",
  "path": "/api/cart/items",
  "validationErrors": {
    "quantity": "Quantity exceeds available stock"
  }
}
```

This provides a consistent error contract for the React frontend.

---

# 🖥️ Frontend Architecture

The frontend is a React single-page application.

```text
src/
├── api/
├── context/
├── hooks/
├── utils/
├── layouts/
├── components/
├── pages/
├── pages/admin/
└── styles/
```

## API Layer

All HTTP communication is centralized under:

```text
src/api/
```

Axios is responsible for:

* API requests.
* JWT headers.
* Authentication handling.
* Centralized 401 handling.

Components do not directly manage API URLs.

## Context Layer

Application-wide state is managed through:

```text
AuthContext
CartContext
ToastContext
```

## Protected Routes

The frontend uses protected routing for authenticated and administrator areas.

Example:

```text
USER
  │
  ├── Customer pages
  │
  └── Admin page → Redirect / Access denied

ADMIN
  │
  └── Admin pages
```

Backend authorization remains the final security boundary.

---

# 📁 Project Structure

```text
samba-book-platform/
│
├── README.md
│
├── backend/
│   ├── pom.xml
│   ├── README.md
│   │
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties
│       │   └── application-prod.properties
│       │
│       └── java/com/samba/
│           ├── SambaApplication.java
│           │
│           ├── config/
│           │   ├── SecurityConfig
│           │   └── DataSeeder
│           │
│           ├── security/
│           │   ├── JwtService
│           │   ├── JwtAuthFilter
│           │   ├── CustomUserDetailsService
│           │   ├── RestAuthEntryPoint
│           │   └── RestAccessDeniedHandler
│           │
│           ├── entity/
│           ├── repository/
│           ├── dto/
│           ├── mapper/
│           ├── service/
│           ├── controller/
│           └── exception/
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── vercel.json
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        │
        ├── api/
        ├── context/
        ├── hooks/
        ├── utils/
        ├── layouts/
        ├── components/
        ├── pages/
        ├── pages/admin/
        └── styles/
```

---

# 🛠️ Technology Stack

| Area              | Technology                  |
| ----------------- | --------------------------- |
| Frontend          | React 18                    |
| Routing           | React Router 6              |
| HTTP Client       | Axios                       |
| Build Tool        | Vite                        |
| Styling           | Custom CSS                  |
| Backend           | Java 21                     |
| Framework         | Spring Boot 3.3             |
| REST API          | Spring Web                  |
| Security          | Spring Security             |
| Authentication    | JWT                         |
| Password Security | BCrypt                      |
| ORM               | Spring Data JPA / Hibernate |
| Database          | MySQL 8                     |
| Backend Build     | Maven                       |
| Frontend Build    | npm / Vite                  |
| Deployment        | Render / Railway + Vercel   |
| Containerization  | Not required                |

---

# ⚙️ Local Development

## Prerequisites

Install:

* Java 21
* Maven
* Node.js 18+
* MySQL 8
* Git

Verify:

```bash
java -version
mvn -version
node -version
npm -version
mysql --version
git --version
```

---

# 🗄️ Create the Database

Create the database:

```sql
CREATE DATABASE samba_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

No manual table creation is required.

Hibernate creates/updates the tables from the JPA entities.

---

# ▶️ Start the Backend

Navigate to:

```bash
cd backend
```

Set the required environment variables.

Example:

```bash
DB_USERNAME=root
DB_PASSWORD=yourpassword
JWT_SECRET=your-long-random-secret
```

Start Spring Boot:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

API:

```text
http://localhost:8080/api
```

---

# ▶️ Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔑 Default Development Admin

For local development, the seeded administrator is:

```text
Email: admin@samba.com
Password: Admin@123
```

### Important

Change the administrator password before any real deployment.

---

# 🌱 Environment Variables

## Backend

| Variable                 | Default           | Purpose                   |
| ------------------------ | ----------------- | ------------------------- |
| `PORT`                   | `8080`            | Server port               |
| `DB_HOST`                | `localhost`       | MySQL host                |
| `DB_PORT`                | `3306`            | MySQL port                |
| `DB_NAME`                | `samba_db`        | Database name             |
| `DB_USERNAME`            | `root`            | Database user             |
| `DB_PASSWORD`            | `change_me`       | Database password         |
| `DDL_AUTO`               | `update`          | Hibernate schema strategy |
| `SHOW_SQL`               | `false`           | Hibernate SQL logging     |
| `JWT_SECRET`             | Placeholder       | JWT signing secret        |
| `JWT_EXPIRATION_MS`      | `86400000`        | JWT lifetime              |
| `CORS_ALLOWED_ORIGINS`   | localhost origins | Allowed frontend origins  |
| `ADMIN_NAME`             | `Samba Admin`     | Seeded admin name         |
| `ADMIN_EMAIL`            | `admin@samba.com` | Seeded admin email        |
| `ADMIN_PASSWORD`         | `Admin@123`       | Seeded admin password     |
| `SEED_SAMPLE_DATA`       | `true` locally    | Sample data switch        |
| `SPRING_PROFILES_ACTIVE` | none              | Production profile        |

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CURRENCY=USD
```

---

# 🚀 Production Deployment

Samba is designed to deploy without Docker.

## Backend

Recommended deployment targets:

```text
Render
Railway
```

Backend build:

```bash
mvn clean package -DskipTests
```

Start command:

```bash
java -jar target/samba-backend-1.0.0.jar
```

Configure production environment variables for:

```text
Database
JWT_SECRET
Admin credentials
CORS
Spring profile
```

Use:

```text
SPRING_PROFILES_ACTIVE=prod
```

---

# 🌐 Frontend Deployment

The React frontend can be deployed to:

```text
Vercel
```

Build command:

```bash
npm run build
```

Output:

```text
dist
```

Set:

```env
VITE_API_BASE_URL=https://your-backend-url/api
```

The backend CORS configuration must include the deployed frontend URL.

---

# 🔒 Production Security Considerations

Before production deployment:

* Replace the default admin password.
* Generate a strong JWT secret.
* Configure production CORS origins.
* Do not commit `.env` files.
* Use HTTPS.
* Set production database credentials through environment variables.
* Consider changing `ddl-auto` from `update` to `validate`.
* Introduce database migrations.
* Add rate limiting to authentication endpoints.
* Add automated security tests.

---

# 📸 Screenshots

Add screenshots here once the final UI is ready.

Recommended screenshots:

### Customer

* Home page
* Book catalogue
* Search and filtering
* Book details
* Shopping cart
* Checkout
* Order history
* Order tracking
* Profile

### Administration

* Admin dashboard
* Book management
* Category management
* User management
* Order management

### Responsive Design

* Desktop
* Tablet
* Mobile

Example:

```text
docs/
└── screenshots/
    ├── home.png
    ├── books.png
    ├── book-details.png
    ├── cart.png
    ├── checkout.png
    ├── orders.png
    ├── admin-dashboard.png
    ├── admin-books.png
    ├── admin-users.png
    └── admin-orders.png
```

---

# 🧪 Validation & Error Handling

The application validates operations on both the frontend and backend.

Important business rules are enforced server-side.

Examples:

```text
Cannot add unavailable quantity
Cannot checkout without sufficient stock
Cannot cancel a delivered order
Cannot move an order through an invalid status transition
Cannot delete a category containing books
Cannot disable the currently authenticated administrator
Cannot access another user's order
Cannot access ADMIN APIs as USER
```

The backend remains the source of truth for business rules.

---

# 📈 Scalability Considerations

Although Samba is currently designed as a portfolio-scale application, the architecture provides clear extension points.

Potential improvements include:

* Redis caching.
* Database indexing improvements.
* Entity graphs / optimized fetch strategies.
* Background order processing.
* Email notification service.
* Payment service integration.
* Object storage for book covers.
* Refresh-token authentication.
* API rate limiting.
* Automated testing.
* Database migrations.
* Observability and centralized logging.

---

# 🔮 Future Enhancements

The following features are intentionally **not presented as implemented**:

### 💳 Real Payment Gateway

Integrate:

* Razorpay
* Stripe

### 🔄 Refresh Tokens

Add refresh-token support for longer-lived sessions without requiring frequent login.

### 📧 Email Notifications

Send notifications for:

* Order confirmation.
* Order shipment.
* Delivery.
* Cancellation.

### ⭐ Reviews & Ratings

Allow customers to review purchased books.

### 🖼️ Book Cover Upload

Replace external image URLs with managed file/object storage.

### 🗃️ Database Migrations

Introduce:

```text
Flyway
```

or:

```text
Liquibase
```

instead of relying on Hibernate `ddl-auto=update`.

### 🧪 Automated Testing

Add:

```text
JUnit
Mockito
Spring Boot Test
Integration Tests
React Testing
```

### 🛡️ Rate Limiting

Protect authentication and other sensitive endpoints against excessive requests.

---

# ⚠️ Known Limitations

The current portfolio version has the following limitations:

* JWT is stored in `localStorage`.
* No real payment gateway is integrated.
* No refresh-token mechanism.
* No automated test suite is included.
* Book covers currently use external image URLs.
* Database migrations are not currently implemented.
* Order queries are suitable for demo-scale usage but could be optimized for larger datasets.
* Production infrastructure and monitoring are not included in the repository.

These limitations are intentionally documented so the project does not claim functionality that has not been implemented.

---

# 💼 Portfolio & Interview Highlights

Samba demonstrates practical experience with:

* Java 21
* Spring Boot
* Spring Security
* JWT authentication
* BCrypt password hashing
* Role-based authorization
* REST API development
* Spring Data JPA
* Hibernate
* MySQL
* React
* React Router
* Axios
* State management using React Context
* DTO-based API design
* Layered architecture
* Transaction management
* Server-side validation
* Pagination and filtering
* Inventory management
* Order lifecycle management
* Soft deletion
* Exception handling
* Responsive UI development
* Frontend/backend integration

### Interview Architecture Summary

A concise way to explain the project:

> **Samba is a Java Full Stack e-commerce application built using React, Spring Boot, Spring Security, JWT, Spring Data JPA, Hibernate and MySQL. The backend follows a layered REST architecture with controllers, services, repositories, DTOs and entity mapping. Authentication is handled using JWT and BCrypt, while authorization is enforced using USER and ADMIN roles. Customers can browse books, manage their cart, place orders and track order status, while administrators manage books, categories, users and orders through a protected administration module.**

---

# 👩‍💻 Author

**Mohanapriya Kamaraj**

Java Full Stack Developer

### Technologies

```text
Java
Spring Boot
Spring Security
REST APIs
JPA / Hibernate
MySQL
React
JavaScript
HTML
CSS
Git
```

---

# 📄 License

This project is intended primarily as a **portfolio and learning project**.

Add an appropriate open-source license such as MIT if you intend to distribute the source code publicly under that license.

---

# ⭐ Project Status

```text
Backend        ████████████████████  Complete
Authentication ████████████████████  Complete
Authorization ████████████████████  Complete
Book Store     ████████████████████  Complete
Cart           ████████████████████  Complete
Orders         ████████████████████  Complete
Admin Panel    ████████████████████  Complete
Deployment     ███████████████░░░░░  Configurable
Payments       ░░░░░░░░░░░░░░░░░░░░  Planned
Testing        ░░░░░░░░░░░░░░░░░░░░  Planned
```

---

## 📌 Why This Project?

Samba was designed to demonstrate how a real-world full-stack application can be structured beyond simple CRUD operations.

The project focuses on:

**Secure authentication → Role-based authorization → REST APIs → Business logic → Database transactions → React integration → Admin operations → Order lifecycle management**

This makes Samba a practical demonstration of Java Full Stack development rather than a simple frontend bookstore.
