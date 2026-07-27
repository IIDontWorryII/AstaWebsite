# AStA Remagen website

This is the website for the AStA (Allgemeiner Studierendenausschuss) at Hochschule Koblenz, RheinAhrCampus Remagen. I rebuilt it from scratch as my semester project.

The old website was basically static and a pain for the AStA to keep up to date, so the main goal was to make the content editable by non-technical people. Almost everything you see — events, the Gremien pages, meeting protocols, the first-semester info page, the BaRACke drinks menu — can be changed through an admin area without touching any code.

The site itself is in German (its audience is German students). This README is in English; there's a separate German guide for the people who edit the content in `EDITOR_GUIDE.md`.

## What it does

- An events calendar with categories (parties, sport, BaRACke, …), a detail popup, a favourites list, and an "add to calendar" (.ics) export.
- Editable Gremien pages (AStA, StuPa, Fachschaften) built from sections: text blocks, member cards, and image galleries.
- Meeting protocols uploaded as PDFs and filterable by Gremium.
- An Ersti-Info page with a checklist and FAQ for new students.
- An admin area behind a login where editors do all of the above, edit page text in a rich-text (WYSIWYG) editor, manage members, and upload the drinks menu / sport PDFs.
- Email + password accounts with JWT cookie sessions and an "editor" role for the people who manage content.

## Tech stack

**Frontend** (`client/`)

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 and a few shadcn/ui components
- React Router for routing
- TipTap for the rich-text editor
- Vitest + Testing Library for tests

**Backend** (`server/`)

- Node + Express 5 (TypeScript)
- Prisma ORM on PostgreSQL — I used [Neon](https://neon.tech)'s free tier
- JWT auth in httpOnly cookies, passwords hashed with bcrypt
- Zod for validating incoming requests
- Uploaded files (posters, PDFs) go to Cloudflare R2 (S3-compatible) so they survive server restarts
- Vitest + Supertest for the API tests

Types that both sides need live in `shared/types.ts`.

## Project structure

```
client/     React frontend (Vite)
server/     Express API + Prisma schema, migrations and tests
shared/     TypeScript types used by both client and server
deploy.sh   build-and-restart script for the server
```

## Running it locally

You'll need:

- Node 24 (that's what CI runs on)
- A PostgreSQL database. I used Neon's free tier — you need two connection strings from it: a pooled one (`DATABASE_URL`) and a direct one (`DIRECT_URL`) that Prisma uses for migrations.
- A Cloudflare R2 bucket for file uploads. This is needed even in development, since uploads don't touch the local disk.

**1. Install dependencies** (frontend and backend are separate packages):

```
cd server && npm install
cd ../client && npm install
```

**2. Configure the backend.** Copy the example env file and fill in your own values:

```
cd server
cp .env.example .env
```

Every variable is explained by a comment in `.env.example`. The ones you actually need are `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and the `R2_*` block. (There's also some SAML config in there for a planned "log in with your HS Koblenz account" feature — that isn't wired up, so you can ignore it.)

**3. Set up the database:**

```
npx prisma migrate deploy   # create the tables
npx prisma generate         # generate the typed Prisma client
npx prisma db seed          # add some example events, protocols and pages
```

**4. Create an editor account** so you can reach the admin area:

```
npm run set-editor -- you@example.com your-password
```

**5. Start both servers** in two terminals, from the project root:

```
npm run server   # API on http://localhost:5000
npm run client   # site on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so the frontend can just use relative URLs and behaves the same in dev and in production.

Then open http://localhost:5173, and log in at `/login` with the account from step 4 to see the admin area.

## Tests

```
cd server && npm test          # API tests — these run against a real database
cd client && npm run test:run  # component and unit tests (jsdom)
```

The same tests run in CI on every push and pull request (`.github/workflows/ci.yml`).

## Deployment

`npm run build` produces a static frontend (`client/dist`) and a compiled Node server (`server/dist`).

In production this ran on a Debian VPS: nginx served the built frontend and reverse-proxied `/api` to the Node process (kept running by systemd), with HTTPS from Let's Encrypt. GitHub Actions builds and tests every push to `main`, and when a server is available it also runs `deploy.sh`, which pulls the latest code, installs, runs migrations, rebuilds, and restarts the service.
