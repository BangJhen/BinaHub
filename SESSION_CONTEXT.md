# Session Context Handoff - BinaHub Frontend

Dokumen ini merangkum konteks implementasi terbaru agar bisa langsung dipakai oleh agent LLM baru.

## Ringkasan Tujuan

- Redesign landing page menjadi full-bleed, immersive, dan tidak card-heavy.
- Perbaikan navbar home agar fixed dan konsisten dengan dashboard UMKM.
- Tambah animasi scroll section berbasis library (framer-motion), bukan CSS `animation-timeline`.
- Bangun dashboard worker (ex-napi) yang fokus pada:
  - history daily check,
  - ringkasan 2 minggu,
  - tren performa,
  - feedback/review dari UMKM,
  - rekomendasi peningkatan motivasi/performa.
- Rapikan profile dropdown: hilangkan role-switching dari menu profil, ganti ke menu profil umum + logout.

---

## Perubahan Utama yang Sudah Selesai

### 1) Landing Page + Scroll Animation

- `framer-motion` sudah diinstall.
- Dibuat komponen `RevealSection`:
  - File: `frontend/src/components/reveal-section.tsx`
  - Dipakai untuk reveal animation saat section masuk viewport.
- `frontend/src/app/page.tsx`:
  - Section non-hero dibungkus `RevealSection`.
- `frontend/src/app/page.module.css`:
  - Blok `@supports (animation-timeline: view())` lama sudah dihapus.
  - Separator line atas pada hero (`.heroBand::before`) sudah disembunyikan agar tidak bentrok dengan navbar fixed.
- `frontend/src/app/globals.css`:
  - Smooth scrolling anchor (`scroll-behavior: smooth`) sudah aktif.

### 2) Navbar + FAQ Improvement (Home)

- Navbar home disamakan style-nya dengan UMKM dashboard nav, fixed di atas.
- Margin/padding logo dan auth buttons sudah diperbaiki.
- Link menu FAQ di navbar sudah ditambahkan.
- FAQ card sudah dibuat lebih soft (tidak kaku) + transisi expand/collapse lebih smooth.

### 3) Worker Dashboard (Role: worker)

#### Routing & akses

- Dibuat area route worker:
  - `frontend/src/app/worker/layout.tsx`
  - `frontend/src/app/worker/layout.module.css`
  - `frontend/src/app/worker/dashboard/page.tsx`
  - `frontend/src/app/worker/dashboard/page.module.css`
- Guard akses:
  - Role `worker` dan `admin` bisa akses route worker.
- Redirect auth role-aware:
  - `frontend/src/app/auth/login/page.tsx`
  - `frontend/src/app/auth/register/page.tsx`
  - Jika pilih role `worker`, redirect ke `/worker/dashboard`.

#### Data worker

- Dibuat source data worker:
  - `frontend/src/features/worker/worker-data.ts`
- Isi data meliputi:
  - profil worker,
  - riwayat daily check,
  - kalender monthly check,
  - trend performa (`1w`, `1m`, `3m`),
  - review UMKM,
  - rekomendasi peningkatan performa.

#### Fitur UI worker dashboard

- Header + KPI utama (streak, attendance, rating, progress target check-in).
- Riwayat daily check + ringkasan kondisi.
- Kalender check-in bulanan.
- Tren performa dalam bar chart.
- Daftar feedback/review UMKM.
- Panel rekomendasi peningkatan performa.

### 4) Penyesuaian lanjutan pada Worker Dashboard

- Riwayat daily check sekarang bisa pilih tanggal mulai (`type="date"`) dan otomatis menghitung rentang 14 hari (2 minggu).
- Ringkasan menyesuaikan data hasil filter rentang tersebut.
- Tren performa:
  - angka skor dipindah ke atas bar (agar tidak ketutup layer putih).
- Label 1 bulan pada sumbu X diubah dari `Mg 1/2/3/4` jadi `Minggu 1/2/3/4`.
- Rekomendasi peningkatan ditampilkan di bawah ringkasan check-in.

### 5) Profile Dropdown (AuthRoleControl)

- File komponen:
  - `frontend/src/components/AuthRoleControl.tsx`
  - `frontend/src/components/auth-role-control.module.css`
- Role switching di dropdown profil sudah dihapus.
- Konsep baru:
  - role fix selama login session,
  - untuk ganti role user harus logout dulu.
- Isi menu profil sekarang:
  - Beranda
  - Dashboard (role-aware)
  - Profil Saya
  - Pengaturan
  - Keluar
- Icon emoji pada menu sudah dihapus sesuai request terakhir (teks saja).

---

## Catatan Teknis Penting untuk Agent Baru

1. Penyimpanan role auth mock menggunakan `localStorage` key:
   - `binahub-auth-role`
2. Role yang digunakan saat ini:
   - `umkm`, `worker`, `admin`
3. `admin` sementara diarahkan ke dashboard UMKM.
4. Beberapa link menu profil (`/profile`, `/settings`) sudah ditampilkan di UI, namun halaman target bisa jadi belum diimplementasi penuh.
5. Worker dashboard saat ini masih berbasis mock data statis di `worker-data.ts`.

---

## To-Do Lanjutan yang Direkomendasikan

1. Implement halaman nyata untuk:
   - `/profile`
   - `/settings`
2. Integrasi data worker dashboard ke backend/API.
3. Tambahkan validasi date range lebih ketat (mis. clamp end-date ke data maksimum).
4. Tambahkan test untuk:
   - redirect role-aware,
   - filter 14 hari,
   - auth guard worker route.

---

## Quick Start Context untuk Prompt Agent Baru

Gunakan ringkasan ini untuk memulai session baru:

> Project ini adalah prototype Next.js BinaHub dengan role UMKM dan Worker. Landing page sudah full-bleed dan scroll animation sudah pakai framer-motion via `RevealSection`. Dashboard Worker sudah dibuat di `/worker/dashboard` berisi daily check history (filter rentang 14 hari), ringkasan, tren performa, review UMKM, dan rekomendasi peningkatan. Auth redirect sudah role-aware dari login/register. Profile dropdown sudah diubah jadi menu standar (tanpa role switching), role hanya berubah via logout lalu login ulang.
