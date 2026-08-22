# Adriva

Multi-tenant digital business card and employee profile platform.

Companies → Employees → Digital Identity → Theme/Branding → Live Profile → QR + NFC + vCard.

## Structure

```text
Adriva/
├── frontend/   React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion
├── backend/    FastAPI + SQLAlchemy + Alembic + SQLite (Postgres-ready)
├── docs/       design-system.md — tokens/motion/theme architecture reference
│               deployment.md — Vercel (frontend) + VPS (backend) production setup
└── assets/
```

## Quick start

Run the backend and frontend in two terminals — the frontend expects the API at `http://localhost:8000` by default (see `frontend/.env`).

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # defaults already work for local dev
python -m alembic upgrade head
python -m app.seed            # optional — seeds one company, 2 employees, 3 products
uvicorn app.main:app --reload --port 8000
```

API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env          # defaults already work for local dev
npm run dev
```

Admin dashboard at `http://localhost:5173/dashboard` — gated by a single access-key prompt (no email/password form), checked against `ADMIN_API_KEY` in `backend/.env`. Public profiles are served at `http://localhost:5173/:companySlug/:employeeSlug` and need no key.

## Deployment

Frontend on Vercel, backend on a VPS (SQLite + local uploads need a
persistent host — Vercel's serverless functions can't hold either between
requests). See `docs/deployment.md` for the full walkthrough, including the
HTTPS requirement (Vercel's HTTPS frontend can't call a plain-HTTP API).

## Testing

```bash
# Backend
cd backend && .venv/Scripts/python.exe -m pytest

# Frontend
cd frontend && npm run build && npm run lint
```

## Themes

Every public profile renders through one shared structural template (`frontend/src/features/profiles/sections/`) — Header, Hero, QuickActions, About, Products, Scan-to-Chat, Location, Working Hours, Enquiry, Footer. The five themes — **Luxury**, **Modern**, **Executive**, **Minimal**, **Glass** — are token presets (`frontend/src/features/profiles/theme/`: colors, typography, spacing, radius, shadows, motion, hero layout, card/button chrome), not separate component trees, so a new theme never needs new components. Each company can further customize its active theme via Theme Builder (Brand Color, Ombre, Glass, Buttons, Corners, Typography, Motion). See `docs/design-system.md` for the underlying token/motion architecture.
