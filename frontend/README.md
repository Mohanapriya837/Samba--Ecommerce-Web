# Samba Book Store - Frontend (React + Vite)

> Full project documentation (architecture, API reference, deployment, etc.)
> lives in the [root README](../README.md). This file is just a quick start.

Vite · React Router · Axios

## Run
```bash
cp .env.example .env      # adjust VITE_API_BASE_URL if the backend is not on :8080
npm install
npm run dev               # http://localhost:5173
```
Backend first: `cd ../backend && mvn spring-boot:run` (CORS already allows :5173 and :3000).

## Env
- `VITE_API_BASE_URL` - Spring Boot API base, must end with `/api`
- `VITE_CURRENCY` - ISO currency code for price formatting (default USD)

## Demo login
- Admin: `admin@samba.com` / `Admin@123` (seeded by the backend) -> /admin
- Users: register at /register

## Build
`npm run build` -> `dist/`. `vercel.json` (SPA rewrite to `index.html`) is already included for Vercel deploys; other static hosts need an equivalent rewrite rule for client-side routing to survive a page refresh.
