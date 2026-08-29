# Deploying Adriva

Two independent pieces:

- **Frontend** (`frontend/`) — static Vite build, hosted on Vercel.
- **Backend** (`backend/`) — FastAPI + SQLite + local file uploads. Vercel's
  serverless functions can't hold a writable SQLite file or uploaded images
  between requests, so this needs a persistent host — a VPS.

## The HTTPS requirement (read this first)

Vercel serves your frontend over HTTPS. Browsers block an HTTPS page from
calling a plain-HTTP API (mixed content) — so `fetch()` calls from the
deployed frontend to `http://YOUR_VPS_IP:8000` will silently fail. **The
VPS backend must also be served over HTTPS**, which means it needs a
hostname a certificate authority will issue a cert for — you can't get a
valid TLS cert for a bare IP address.

If you don't own a domain, the free fix is
**[sslip.io](https://sslip.io)**: `YOUR_VPS_IP.sslip.io` automatically
resolves to `YOUR_VPS_IP` — no DNS setup, no registration. The steps below
use it; swap in a real domain later if you get one, no code changes needed
either way.

## 1. VPS: install nginx + certbot

SSH into the VPS, then (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx python3-venv git
```

## 2. VPS: get the code and set up the backend

```bash
git clone https://github.com/mahakjain27/Adriva.git
cd Adriva/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL=sqlite:///./adriva.db
ADMIN_API_KEY=<generate with: openssl rand -hex 32>
FRONTEND_URL=https://<your-vercel-project>.vercel.app
PUBLIC_BASE_URL=https://YOUR_VPS_IP.sslip.io
PUBLIC_PROFILE_BASE_URL=https://<your-vercel-project>.vercel.app
UPLOAD_DIR=uploads
```

`PUBLIC_PROFILE_BASE_URL` must match your actual deployed frontend domain —
it's what `GET /c/{employeeId}` (the permanent link printed on QR codes and
written to NFC chips) redirects to. Get this wrong and every physical card
you've already handed out redirects to the wrong place.

`ADMIN_API_KEY` gates every private management endpoint (companies,
employees, products, themes, uploads) — it's checked as `Authorization:
Bearer <key>`. Leaving it blank doesn't leave the dashboard open; it fails
closed and locks everyone out, including you. Generate a fresh one for
production (don't reuse the one in your local `.env`), and enter it once in
the dashboard's access-key prompt — it's remembered in that browser's
`localStorage` from then on. Public profile URLs never need it.

`FRONTEND_URL` accepts a comma-separated list — add your Vercel preview
domain too if you want previews to be able to call the API:
`FRONTEND_URL=https://adriva.vercel.app,https://adriva-git-main-you.vercel.app`

Run migrations (and optionally seed data):

```bash
python -m alembic upgrade head
python -m app.seed   # optional
```

## 3. VPS: run FastAPI as a systemd service

`/etc/systemd/system/adriva-backend.service`:

```ini
[Unit]
Description=Adriva FastAPI backend
After=network.target

[Service]
User=root
WorkingDirectory=/root/Adriva/backend
ExecStart=/root/Adriva/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

(Adjust `WorkingDirectory`/`ExecStart` paths and `User` to match where you
cloned the repo and which user runs it.)

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now adriva-backend
sudo systemctl status adriva-backend   # should be "active (running)"
```

Uvicorn binds to `127.0.0.1` only — it's never exposed to the internet
directly. Only nginx (below) is reachable from outside, and it proxies to
this local port.

## 4. VPS: nginx reverse proxy + HTTPS

`/etc/nginx/sites-available/adriva-backend`:

```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP.sslip.io;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/adriva-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Issues a real Let's Encrypt cert and rewrites the config above for HTTPS automatically
sudo certbot --nginx -d YOUR_VPS_IP.sslip.io
```

Certbot edits the nginx config in place to add the `listen 443 ssl` block and
sets up auto-renewal. After this, `https://YOUR_VPS_IP.sslip.io/docs`
should load FastAPI's Swagger UI over HTTPS.

## 5. VPS: firewall

Only 80/443 (nginx) need to be open publicly — 8000 should stay closed to
the outside:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

## 6. Vercel: point the frontend at the VPS

In the Vercel project's **Settings → Environment Variables**, set (for
Production, and Preview if you want previews working too):

```
VITE_API_BASE_URL=https://YOUR_VPS_IP.sslip.io
```

Also double-check **Settings → General → Root Directory** is set to
`frontend` — this is a monorepo (`frontend/` and `backend/` are siblings),
so Vercel needs to know to build from the `frontend/` subfolder.

Redeploy after changing env vars (Vercel doesn't hot-apply them to an
existing build).

`frontend/vercel.json` (already in the repo) adds the SPA rewrite every
route needs — without it, a direct link or refresh on a public profile URL
(`/company-slug/employee-slug`) 404s, since Vercel doesn't fall back to
`index.html` for client-side routes by default.

## 7. Verify end to end

- `https://YOUR_VPS_IP.sslip.io/docs` — Swagger UI loads.
- `https://YOUR_VPS_IP.sslip.io/api/companies` — returns JSON, not a CORS/connection error.
- Your Vercel URL's `/dashboard/employees` — shows real data.
- Open a public profile URL directly (not via in-app navigation) and refresh it — should render, not 404.
- `https://YOUR_VPS_IP.sslip.io/c/{any real employee id}` — should redirect (302) to that employee's live profile on your Vercel domain, not the VPS domain. This is the link QR codes and NFC cards actually encode.

## Updating the backend later

```bash
cd Adriva && git pull
cd backend && source .venv/bin/activate && pip install -r requirements.txt
python -m alembic upgrade head
sudo systemctl restart adriva-backend
```
