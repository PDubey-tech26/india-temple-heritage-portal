# India Temple Heritage & Pilgrimage Portal

Responsive, mobile-first information portal for discovering temples, learning about heritage, and planning visits.

## Stack
- React + Vite
- Express + PostgreSQL (`pg`)
- JWT + bcrypt admin authentication
- Responsive CSS design system (no UI framework lock-in)

## Included
- Home page with search and state filters
- Temple listing and temple detail pages
- Saved temples in local storage
- Festivals and visitor guidance sections
- Admin login and protected temple-management API
- PostgreSQL schema and optional sample seed
- Mobile navigation, responsive grids, reduced-motion support, accessible labels and focus states

## Requirements
- Node.js 20+
- PostgreSQL 14+

## Setup
1. Create a PostgreSQL database, for example `temple_heritage`.
2. Copy `server/.env.example` to `server/.env` and set database credentials plus a long random JWT secret.
3. Install dependencies from the project root:
   ```bash
   npm install
   ```
4. Create the schema:
   ```bash
   npm run db:setup -w server
   ```
5. Create the first admin:
   ```bash
   npm run admin:create -w server
   ```
   Follow the prompts. Do not use a weak password.
6. Start both apps:
   ```bash
   npm run dev
   ```
7. Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Database
`server/sql/schema.sql` creates tables for temples, deities, rituals, festivals, visitor information, facilities, pilgrimage circuits, circuit stops, and admin users.

## API
- `GET /api/health`
- `GET /api/temples`
- `GET /api/temples/:slug`
- `POST /api/admin/login`
- `GET /api/admin/temples` (JWT required)
- `POST /api/admin/temples` (JWT required)
- `PUT /api/admin/temples/:id` (JWT required)
- `PATCH /api/admin/temples/:id/status` (JWT required)
- `DELETE /api/admin/temples/:id` (JWT required)

Public endpoints only show approved content. Admin writes require a valid JWT.

## Important content note
Included temple records are clearly marked as sample/demo content. Verify every temple detail, darshan schedule, festival date, route and facility against official temple trust or government sources before publishing. Festival dates may vary by year and local calendar.

## Deployment
- Frontend: Vercel or Netlify
- API: Render, Railway, or another Node hosting provider
- Database: managed PostgreSQL
- Set `VITE_API_URL` to the deployed API base URL.
- Configure `CLIENT_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, and `PORT` on the API host.
- Use HTTPS, database backups, restricted database credentials, and a secret manager in production.

## Current project boundaries
This phase is an informational web portal. It does not process donations, book puja, provide live darshan, or offer native mobile apps. No live third-party maps or accommodation integrations are claimed.
