# AI App Generator

Track A demo task: a config-driven full-stack system that turns JSON into a working CRUD app.

## Features

- JSON config engine for generated app name, theme, entity, fields, and events
- Dynamic CRUD API backed by PostgreSQL JSON records
- Email/password login and Google OAuth demo endpoint
- CSV import into generated apps
- Event-based notifications for app creation, record creation, updates, and imports
- Next.js dashboard for editing config, generating apps, entering records, importing CSV, and viewing notifications

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, lucide-react
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma
- Deployment target: Vercel frontend and Render backend

## Local Setup

Create `backend/.env` from `backend/.env.example` and paste your Neon PostgreSQL URL.

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

Create `frontend/.env.local` from `frontend/.env.example`.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Flow

1. Register with email/password or use the Google demo button.
2. Review the sample JSON config in the left editor.
3. Click `Generate`.
4. Select the generated app.
5. Add records through the generated form.
6. Import a CSV with headers matching config field keys, for example:

```csv
studentName,email,college,stage,notes
Ananya,ananya@example.com,ABC College,New,Interested in workshop
Ravi,ravi@example.com,XYZ Institute,Registered,Confirmed
```

## Deployment Notes

Backend on Render:

- Build command: `npm install && npm run build && npx prisma db push`
- Start command: `npm start`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`

Frontend on Vercel:

- Root directory: `frontend`
- Environment variable: `NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com`
