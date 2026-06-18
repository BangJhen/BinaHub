# 🚀 Panduan Deploy: Frontend (Vercel) & Backend (Render)

> Dokumen ini mencakup langkah lengkap deploy aplikasi fullstack — frontend ke **Vercel** dan backend ke **Render** — menggunakan terminal/CLI.

---

## 📁 Struktur Project

```
my-app/
├── frontend/          # React / Next.js / Vue / dll
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.local
├── backend/           # Express / FastAPI / Django / dll
│   ├── src/
│   ├── package.json   # atau requirements.txt
│   ├── render.yaml
│   └── .env
└── README.md
```

---

## ⚙️ Prasyarat

Sebelum memulai, pastikan tools berikut sudah terinstall:

| Tool | Versi Minimum | Cek Versi |
|------|--------------|-----------|
| Node.js | v18+ | `node --version` |
| npm / yarn | v9+ | `npm --version` |
| Git | v2.30+ | `git --version` |
| Vercel CLI | latest | `vercel --version` |
| Render CLI | latest | `render --version` |

---

## 🟣 BAGIAN 1 — Deploy Backend ke Render

### 1.1 Install Render CLI

```bash
# Opsi A: via npm
npm install -g @render-com/cli

# Opsi B: via curl (macOS/Linux)
curl -fsSL https://render.com/install-cli.sh | bash

# Verifikasi instalasi
render --version
```

### 1.2 Login ke Render

```bash
# Login via browser (direkomendasikan)
render login

# Atau gunakan API Key untuk CI/CD (headless)
export RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxx
```

> 💡 **Cara dapat API Key:** Login ke [dashboard.render.com](https://dashboard.render.com) → Account Settings → API Keys → Create API Key

### 1.3 Buat File `render.yaml`

Buat file `render.yaml` di **root direktori backend**:

#### Untuk Node.js / Express

```yaml
# backend/render.yaml
services:
  - type: web
    name: my-backend
    env: node
    region: singapore          # Pilih region terdekat
    plan: free
    buildCommand: npm install
    startCommand: node src/index.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        sync: false            # Diisi manual di dashboard
      - key: JWT_SECRET
        generateValue: true    # Auto-generate secret
```

#### Untuk Python / FastAPI

```yaml
# backend/render.yaml
services:
  - type: web
    name: my-backend-python
    env: python
    region: singapore
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        sync: false
```

#### Untuk Django

```yaml
# backend/render.yaml
services:
  - type: web
    name: my-django-backend
    env: python
    region: singapore
    plan: free
    buildCommand: |
      pip install -r requirements.txt
      python manage.py collectstatic --no-input
      python manage.py migrate
    startCommand: gunicorn myproject.wsgi:application
    envVars:
      - key: DJANGO_SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: false
      - key: ALLOWED_HOSTS
        value: .onrender.com
      - key: DATABASE_URL
        sync: false
```

### 1.4 Siapkan `.env` dan `.env.example`

```bash
# backend/.env (JANGAN di-commit ke Git!)
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=rahasia-lokal-anda
CORS_ORIGIN=http://localhost:3000

# backend/.env.example (boleh di-commit, sebagai referensi)
NODE_ENV=
PORT=
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=
```

Pastikan `.env` ada di `.gitignore`:

```bash
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
```

### 1.5 Tambahkan Health Check Endpoint

Tambahkan route health check di backend (wajib untuk Render):

```javascript
// Express.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

```python
# FastAPI
@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### 1.6 Commit dan Push ke Git

```bash
cd backend/

# Tambahkan semua file
git add .

# Commit
git commit -m "chore: add render.yaml and backend config"

# Push ke GitHub/GitLab
git push origin main
```

### 1.7 Deploy ke Render

```bash
# Deploy pertama kali (membuat service baru)
render deploy --new

# Ikuti prompt interaktif:
# ? Select workspace: My Workspace
# ? Service name: my-backend
# ? Select region: Singapore
# ? Select plan: Free

# Output:
# ✓ Service created: srv-xxxxxxxxxxxxxxxxx
# ✓ Deploy triggered
# ✓ Build berhasil!
# 🌐 https://my-backend.onrender.com
```

> ⚠️ **Simpan Service ID** (`srv-xxx`) — dibutuhkan untuk perintah berikutnya.

### 1.8 Set Environment Variables via CLI

```bash
# Set satu variable
render env set DATABASE_URL="postgresql://..." --service-id srv-xxxxxxxxxx

# Set banyak variable sekaligus
render env set \
  DATABASE_URL="postgresql://user:pass@host:5432/db" \
  JWT_SECRET="secret-production-kamu" \
  CORS_ORIGIN="https://my-frontend.vercel.app" \
  --service-id srv-xxxxxxxxxx

# Lihat semua env variable
render env list --service-id srv-xxxxxxxxxx

# Hapus variable
render env unset DATABASE_URL --service-id srv-xxxxxxxxxx
```

### 1.9 Monitoring & Logs

```bash
# Lihat log real-time (streaming)
render logs --service-id srv-xxxxxxxxxx --tail

# Lihat history deploy
render deploys list --service-id srv-xxxxxxxxxx

# Lihat detail deploy tertentu
render deploys get --service-id srv-xxxxxxxxxx --deploy-id dep-xxx

# Rollback ke deploy sebelumnya
render deploys rollback dep-xxxxxxxxxx --service-id srv-xxxxxxxxxx
```

### 1.10 Re-deploy Manual

```bash
# Trigger deploy ulang (setelah push ke Git)
render deploy --service-id srv-xxxxxxxxxx

# Atau otomatis — setiap push ke branch main akan auto-deploy
# (dikonfigurasi saat setup service pertama kali)
```

---

## 🔺 BAGIAN 2 — Deploy Frontend ke Vercel

### 2.1 Install Vercel CLI

```bash
# Install global
npm install -g vercel

# Verifikasi
vercel --version
```

### 2.2 Login ke Vercel

```bash
# Login (buka browser untuk autentikasi)
vercel login

# Pilih metode login:
# > Continue with GitHub
# > Continue with GitLab
# > Continue with Email
```

### 2.3 Konfigurasi `vercel.json`

Buat file `vercel.json` di root direktori frontend:

#### Untuk React (Vite / CRA)

```json
{
  "version": 2,
  "name": "my-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

#### Untuk Next.js

```json
{
  "version": 2,
  "name": "my-nextjs-app",
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "devCommand": "next dev",
  "installCommand": "npm install"
}
```

#### Untuk Vue.js (Vite)

```json
{
  "version": 2,
  "name": "my-vue-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2.4 Siapkan Environment Variables Frontend

```bash
# frontend/.env.local (development)
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=My App

# frontend/.env.production (production)
VITE_API_URL=https://my-backend.onrender.com/api
VITE_APP_NAME=My App
```

> ⚠️ Untuk **Next.js**, prefix-nya `NEXT_PUBLIC_` bukan `VITE_`:
> ```
> NEXT_PUBLIC_API_URL=https://my-backend.onrender.com/api
> ```

### 2.5 Commit dan Push

```bash
cd frontend/

git add .
git commit -m "chore: add vercel.json config"
git push origin main
```

### 2.6 Deploy ke Vercel

```bash
# Deploy pertama kali (setup project)
vercel

# Ikuti prompt:
# ? Set up and deploy "~/my-app/frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? My Account
# ? Link to existing project? [y/N] N
# ? What's your project's name? my-frontend
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N

# Output:
# ✓ Linked to my-account/my-frontend
# ✓ Deployed to Production
# 🌐 https://my-frontend.vercel.app
```

```bash
# Deploy ke Production langsung
vercel --prod

# Deploy preview (staging/testing)
vercel

# Output preview URL:
# 🔍 https://my-frontend-git-feature-branch.vercel.app
```

### 2.7 Set Environment Variables via CLI

```bash
# Set env untuk production
vercel env add VITE_API_URL production
# (akan diminta input nilainya secara interaktif)

# Set env untuk semua environment
vercel env add VITE_API_URL

# Set dari file .env langsung
vercel env pull .env.local       # Pull dari Vercel ke lokal
vercel env push .env.production  # Push dari file ke Vercel

# Lihat semua env
vercel env ls

# Hapus env variable
vercel env rm VITE_API_URL
```

### 2.8 Konfigurasi Domain Kustom

```bash
# Tambah domain kustom
vercel domains add mydomain.com

# Lihat semua domain
vercel domains ls

# Verifikasi DNS (ikuti instruksi yang muncul)
vercel domains inspect mydomain.com

# Assign domain ke project
vercel alias my-frontend.vercel.app mydomain.com
```

### 2.9 Monitoring & Logs

```bash
# Lihat log deployment terbaru
vercel logs https://my-frontend.vercel.app

# Lihat list deployment
vercel ls

# Lihat detail project
vercel inspect my-frontend

# Buka dashboard di browser
vercel open

# Hapus deployment lama
vercel rm my-frontend --safe
```

---

## 🔗 BAGIAN 3 — Konfigurasi CORS (Menghubungkan Frontend & Backend)

### 3.1 Konfigurasi CORS di Backend

#### Express.js

```javascript
// backend/src/index.js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',          // Development
  'https://my-frontend.vercel.app', // Production Vercel
  process.env.CORS_ORIGIN,          // Custom domain (dari env)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### FastAPI

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://my-frontend.vercel.app",
        os.getenv("CORS_ORIGIN", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.2 Konfigurasi API URL di Frontend

```javascript
// frontend/src/lib/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  get: (path) => fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),

  post: (path, body) => fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
};
```

---

## 🔄 BAGIAN 4 — Setup CI/CD Otomatis

### 4.1 GitHub Actions — Deploy Backend ke Render

Buat file `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Render

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: |
          curl -X POST \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": false}'

      - name: Tunggu deploy selesai
        run: sleep 60

      - name: Health check
        run: |
          curl --fail https://my-backend.onrender.com/health || exit 1
```

### 4.2 GitHub Actions — Deploy Frontend ke Vercel

Buat file `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy ke Vercel (Production)
        working-directory: ./frontend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: vercel --prod --token=$VERCEL_TOKEN
```

### 4.3 Setup GitHub Secrets

Di repository GitHub → Settings → Secrets and variables → Actions:

| Secret Name | Cara Mendapatkan |
|------------|-----------------|
| `RENDER_API_KEY` | Render Dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Output `render services list` atau URL dashboard |
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | File `.vercel/project.json` setelah `vercel link` |
| `VERCEL_PROJECT_ID` | File `.vercel/project.json` setelah `vercel link` |

```bash
# Cara cepat dapat Vercel IDs
cd frontend/
vercel link    # Ini akan membuat file .vercel/project.json
cat .vercel/project.json
# {"orgId": "team_xxx", "projectId": "prj_xxx"}
```

---

## 🛠️ BAGIAN 5 — Troubleshooting

### Backend (Render)

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| Build gagal | Dependency tidak ditemukan | Cek `package.json`, pastikan semua package ada di `dependencies` bukan `devDependencies` |
| Service tidak start | Port salah | Gunakan `process.env.PORT` bukan hardcode port |
| Service tidur (free plan) | Tidak ada request 15 menit | Upgrade ke Starter plan atau gunakan uptime monitor |
| CORS error | Origin tidak diizinkan | Tambahkan URL Vercel ke `allowedOrigins` di backend |
| Deploy loop | Health check gagal | Pastikan endpoint `/health` mengembalikan status 200 |
| `render.yaml` tidak terbaca | File di lokasi salah | Pastikan `render.yaml` ada di root repo (bukan subfolder) |

```bash
# Debug: lihat log error
render logs --service-id srv-xxx --tail

# Debug: cek status service
render services get --service-id srv-xxx
```

### Frontend (Vercel)

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| Build gagal | TypeScript error / import salah | Jalankan `npm run build` lokal dulu |
| Halaman 404 saat refresh | SPA routing tidak dikonfigurasi | Tambahkan route catch-all di `vercel.json` |
| Env var tidak terbaca | Prefix salah | Gunakan `VITE_` (Vite) atau `NEXT_PUBLIC_` (Next.js) |
| API tidak bisa diakses | URL salah atau CORS | Cek `VITE_API_URL` di Vercel env settings |
| Deploy lambat | Cache tidak digunakan | Pastikan `node_modules` di `.gitignore` |

```bash
# Debug: build lokal sebelum deploy
npm run build

# Debug: cek env variable
vercel env ls

# Debug: lihat log deploy
vercel logs [deployment-url]
```

---

## 📋 Checklist Deploy

### Backend (Render) ✅

- [ ] `render.yaml` dibuat di root backend
- [ ] Health check endpoint (`/health`) ditambahkan
- [ ] `.env` ada di `.gitignore`
- [ ] Port menggunakan `process.env.PORT`
- [ ] CORS dikonfigurasi dengan URL Vercel
- [ ] Environment variables di-set di Render dashboard/CLI
- [ ] Push ke Git dan deploy berhasil
- [ ] URL backend dicatat: `https://______.onrender.com`

### Frontend (Vercel) ✅

- [ ] `vercel.json` dibuat di root frontend
- [ ] `VITE_API_URL` di-set ke URL backend Render
- [ ] `.env.local` ada di `.gitignore`
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Deploy ke Vercel berhasil
- [ ] URL frontend dicatat: `https://______.vercel.app`
- [ ] Koneksi frontend → backend diuji

### CI/CD (Opsional) ✅

- [ ] GitHub Actions workflow dibuat untuk backend
- [ ] GitHub Actions workflow dibuat untuk frontend
- [ ] Secrets di-set di GitHub repository settings
- [ ] Auto-deploy berjalan saat push ke `main`

---

## 🔑 Ringkasan Perintah Penting

```bash
# ===== RENDER (BACKEND) =====
render login                                          # Login
render deploy --new                                   # Deploy pertama
render deploy --service-id srv-xxx                   # Re-deploy
render logs --service-id srv-xxx --tail              # Log real-time
render env set KEY=VALUE --service-id srv-xxx        # Set env var
render env list --service-id srv-xxx                 # Lihat env vars
render services list                                  # List semua services
render deploys rollback dep-xxx --service-id srv-xxx # Rollback

# ===== VERCEL (FRONTEND) =====
vercel login                                          # Login
vercel                                                # Deploy preview
vercel --prod                                         # Deploy production
vercel logs [url]                                     # Lihat logs
vercel env add KEY                                    # Tambah env var
vercel env ls                                         # Lihat env vars
vercel ls                                             # List deployments
vercel domains add mydomain.com                       # Custom domain
```

---

## 📚 Referensi

- [Render Docs](https://render.com/docs)
- [Render CLI Reference](https://render.com/docs/cli)
- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

*Dibuat dengan ❤️ — Last updated: Juni 2026*
