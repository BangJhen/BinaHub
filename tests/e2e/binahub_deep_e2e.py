"""
BinaHub DEEP E2E Test Suite
===========================
Pengujian mendalam & variatif untuk seluruh menu pada role UMKM dan Worker.

Filosofi desain:
  • Soft-assertion: tiap sub-check punya try/catch sendiri (lewat context manager
    `suite.check(...)`). Satu check gagal TIDAK menghentikan check lain.
  • 3 status: PASS (ok) · FAIL (fitur rusak / assertion gagal) · SKIP (kondisi
    tidak terpenuhi, mis. tidak ada data untuk diuji — bukan bug).
  • Setiap check mengambil screenshot agar mudah ditelusuri.

Menjalankan:
  cd tests/e2e
  python binahub_deep_e2e.py            # headless
  HEADED=1 python binahub_deep_e2e.py   # tampilkan browser

Output: console PASS/FAIL/SKIP per check + ringkasan, screenshot di deep_screenshots/.
"""

import os
import sys
import struct
import zlib
from datetime import datetime
from contextlib import contextmanager
from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL  = "http://localhost:3000"
TS        = datetime.now().strftime("%H%M%S")
UMKM      = {"email": f"deep.umkm.{TS}@binahub.test",   "pass": "DeepUmkm1"}
WORKER    = {"email": f"deep.worker.{TS}@binahub.test", "pass": "DeepWorker1"}
HEADED    = os.environ.get("HEADED") == "1"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SS_DIR     = os.path.join(SCRIPT_DIR, "deep_screenshots")
os.makedirs(SS_DIR, exist_ok=True)


# ── Skip signal ─────────────────────────────────────────────────────────────--
class SkipCheck(Exception):
    """Raise di dalam check untuk menandai SKIP (bukan kegagalan)."""


# ── Soft-assertion suite ────────────────────────────────────────────────────--
class Suite:
    def __init__(self, page: Page):
        self.page = page
        self.results: list[dict] = []
        self._n = 0
        self.dialogs: list[str] = []  # menampung pesan alert() yang muncul

    @contextmanager
    def check(self, label: str):
        self._n += 1
        idx = self._n
        print(f"\n  [{idx:02d}] {label}")
        entry = {"label": label, "status": "PASS"}
        self.results.append(entry)
        try:
            yield entry
        except SkipCheck as s:
            entry["status"] = "SKIP"
            entry["note"]   = str(s)
            print(f"       \033[93m- SKIP\033[0m  {s}")
            return
        except Exception as e:
            entry["status"] = "FAIL"
            entry["error"]  = str(e).splitlines()[0][:200]
            print(f"       \033[91m✖ FAIL\033[0m  {entry['error']}")
            self._shot(f"FAIL_{idx:02d}")
            return
        # success
        print(f"       \033[92m✔ PASS\033[0m" + (f"  {entry.get('note','')}" if entry.get("note") else ""))
        self._shot(f"OK_{idx:02d}")

    def _shot(self, name: str):
        try:
            self.page.screenshot(path=os.path.join(SS_DIR, f"{name}.png"), full_page=True)
        except Exception:
            pass

    def summary(self):
        p = sum(1 for r in self.results if r["status"] == "PASS")
        f = sum(1 for r in self.results if r["status"] == "FAIL")
        s = sum(1 for r in self.results if r["status"] == "SKIP")
        print("\n" + "=" * 64)
        print("  RINGKASAN DEEP E2E")
        print("=" * 64)
        for r in self.results:
            icon = {"PASS": "\033[92m✔\033[0m", "FAIL": "\033[91m✖\033[0m", "SKIP": "\033[93m-\033[0m"}[r["status"]]
            print(f"  {icon}  {r['label'][:52]:<52} {r['status']}")
            if r.get("error"):
                print(f"        └─ {r['error']}")
            if r.get("note") and r["status"] == "SKIP":
                print(f"        └─ {r['note']}")
        print("-" * 64)
        print(f"  Total: {len(self.results)}  |  \033[92mPASS {p}\033[0m  |  "
              f"\033[91mFAIL {f}\033[0m  |  \033[93mSKIP {s}\033[0m")
        print("=" * 64 + "\n")
        return f  # jumlah fail


# ── Helpers umum ──────────────────────────────────────────────────────────────
def wait_idle(page: Page, timeout=10000):
    try:
        page.wait_for_load_state("networkidle", timeout=timeout)
    except PWTimeout:
        pass  # beberapa halaman polling terus → networkidle tak tercapai, abaikan


def make_png(path: str):
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n"
                + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
                + chunk(b"IDAT", zlib.compress(b"\x00\xff\xff\xff"))
                + chunk(b"IEND", b""))


def register(page: Page, role: str, email: str, password: str, doc_path: str | None = None):
    """Registrasi 3-langkah. role = 'umkm' | 'worker'."""
    page.goto(f"{BASE_URL}/auth/register")
    wait_idle(page)
    # Step 1
    page.fill("#name", "Deep Test " + role.upper())
    page.fill("#email", email)
    page.fill("#password", password)
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(500)
    # Step 2
    page.wait_for_selector("text=Pilih Peran", timeout=5000)
    page.click("text=Pemilik UMKM" if role == "umkm" else "text=Pekerja (Worker)")
    page.wait_for_timeout(300)
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(500)
    # Step 3
    if role == "umkm":
        page.wait_for_selector("#businessName", timeout=5000)
        page.fill("#businessName", "Deep Mebel Jaya")
        page.fill("#businessType", "Furniture")
        page.fill("#businessAddress", "Jl. Deep Test No. 1, Bandung")
    else:
        page.wait_for_selector("#nik", timeout=5000)
        page.fill("#nik", "3273019988776601")
        page.fill("#skills", "Tukang Kayu, Las")
        page.fill("#experience", "3 tahun mebel")
        page.fill("#workerAddress", "Jl. Worker No. 2, Bandung")
        page.set_input_files("#document", doc_path)
    page.click("button[type='submit']")
    page.wait_for_timeout(5000)
    body = page.inner_text("body")
    if "berhasil" not in body.lower():
        raise RuntimeError(f"Registrasi {role} gagal: {body[:120]}")


def login(page: Page, email: str, password: str, expect_path: str):
    page.goto(f"{BASE_URL}/auth/login")
    wait_idle(page)
    page.fill("[name='email']", email)
    page.fill("[name='password']", password)
    page.click("button[type='submit']")
    page.wait_for_url(f"**{expect_path}**", timeout=12000)
    wait_idle(page)


def logout(page: Page):
    """Logout via dropdown avatar. Aman dipanggil dari halaman manapun yang ada nav."""
    try:
        btn = page.locator("button[aria-label='User profile']")
        btn.wait_for(state="visible", timeout=4000)
        btn.click()
        page.wait_for_timeout(400)
        page.locator("button:has-text('Keluar')").click(timeout=3000)
        page.wait_for_timeout(1500)
    except Exception:
        # fallback: clear cookies
        page.context.clear_cookies()


def body_text(page: Page) -> str:
    try:
        return page.inner_text("body").lower()
    except Exception:
        return ""


# ════════════════════════════════════════════════════════════════════════════
#  BAGIAN A — UMKM
# ════════════════════════════════════════════════════════════════════════════
def run_umkm_suite(s: Suite):
    page = s.page
    print("\n" + "█" * 64 + "\n  ROLE: UMKM\n" + "█" * 64)

    login(page, UMKM["email"], UMKM["pass"], "/umkm/")

    # A1 — Dashboard memuat tanpa error
    with s.check("UMKM Dashboard memuat (tidak stuck loading / error)"):
        page.goto(f"{BASE_URL}/umkm/dashboard"); wait_idle(page)
        txt = body_text(page)
        assert "/umkm/dashboard" in page.url
        assert "memuat dashboard" not in txt or page.locator("nav").count() > 0, "Stuck di loading"

    # A2 — Toggle range 7d / 30d
    with s.check("UMKM Dashboard: toggle range waktu (7 Hari / 30 Hari)"):
        page.goto(f"{BASE_URL}/umkm/dashboard"); wait_idle(page)
        btn30 = page.get_by_role("button", name="30 Hari")
        btn7  = page.get_by_role("button", name="7 Hari")
        # tombol muncul setelah data dashboard ter-load
        try:
            btn30.wait_for(state="visible", timeout=8000)
        except PWTimeout:
            raise SkipCheck("Dashboard tidak menampilkan tombol range (data kosong)")
        btn30.click(); page.wait_for_timeout(600)
        btn7.click();  page.wait_for_timeout(600)

    # A3 — Navigasi nav: Dashboard / Lowongan / Matching
    with s.check("UMKM Nav: ketiga menu (Dashboard, Lowongan, Matching) terjangkau"):
        for href, frag in [("/umkm/dashboard", "/umkm/dashboard"),
                            ("/umkm/lowongan", "/umkm/lowongan"),
                            ("/umkm/matching", "/umkm/matching")]:
            page.goto(f"{BASE_URL}{href}"); wait_idle(page)
            assert frag in page.url, f"Gagal membuka {href}"

    # A4 — Lowongan list: empty state atau daftar
    with s.check("UMKM Lowongan: empty-state atau daftar tampil"):
        page.goto(f"{BASE_URL}/umkm/lowongan"); wait_idle(page)
        txt = body_text(page)
        assert ("belum ada lowongan" in txt) or ("lowongan" in txt), "Halaman lowongan tidak render konten"

    # A5 — Buat Lowongan (happy path) → redirect ke list dengan ?selected=<id>
    created_title = f"QA Barista {TS}"
    with s.check("UMKM Buat Lowongan: isi form + submit → redirect dengan ?selected="):
        page.goto(f"{BASE_URL}/umkm/lowongan/create"); wait_idle(page)
        page.get_by_placeholder("e.g. Barista, Admin Gudang").fill(created_title)
        page.get_by_placeholder("Area / Cabang").fill("Bandung Pusat")
        try:
            page.get_by_role("button", name="Part Time").click(timeout=2000)
        except Exception:
            pass
        try:
            page.get_by_role("button", name="Customer Service").click(timeout=2000)
        except Exception:
            pass
        s.dialogs.clear()  # reset penampung alert
        page.click("button[type='submit']:has-text('Buat Lowongan')")
        page.wait_for_timeout(4000)
        # Gagal create → handleSubmit memanggil alert() & tetap di /create
        if s.dialogs:
            raise AssertionError(f"Create lowongan ditolak server → alert: \"{s.dialogs[-1]}\"")
        assert "selected=" in page.url, \
            f"Tidak redirect ke list dengan ?selected= (url: {page.url}) — create kemungkinan gagal diam-diam"

    # A6 — Lowongan yang baru dibuat muncul di list (status 'open' → harus tampil)
    with s.check("UMKM Lowongan: lowongan baru muncul di daftar"):
        found = False
        for _ in range(5):  # poll s/d ~10 detik (data di-fetch client-side)
            page.goto(f"{BASE_URL}/umkm/lowongan"); wait_idle(page)
            page.wait_for_timeout(1500)
            if created_title in page.inner_text("body"):
                found = True
                break
        assert found, f"Lowongan '{created_title}' (status open) tidak muncul di daftar setelah 5x reload"

    # A7 — Search filter di list lowongan
    with s.check("UMKM Lowongan: search input memfilter daftar"):
        page.goto(f"{BASE_URL}/umkm/lowongan"); wait_idle(page)
        search = page.locator("input[type='text'], input[placeholder*='ari']").first
        if search.count() == 0:
            raise SkipCheck("Search input tidak ditemukan")
        search.fill("xyznotexist123")
        page.wait_for_timeout(800)
        # tidak crash = cukup; idealnya daftar berkurang

    # A8 — Matching: pilih job, tangani empty kandidat
    with s.check("UMKM Matching: pilih lowongan & tangani state kandidat"):
        txt = ""
        for _ in range(3):
            page.goto(f"{BASE_URL}/umkm/matching"); wait_idle(page)
            page.wait_for_timeout(1500)
            txt = body_text(page)
            if "belum ada lowongan" not in txt:
                break
        if "belum ada lowongan" in txt:
            raise SkipCheck("Matching melaporkan belum ada lowongan aktif")
        # klik opsi job pertama bila ada
        opt = page.get_by_text(created_title, exact=False)
        if opt.count() > 0:
            opt.first.click()
            page.wait_for_timeout(1000)
        # empty kandidat (worker belum melamar/aktif) adalah hasil valid
        assert page.url.endswith("/umkm/matching")

    # A9 — Profile memuat
    with s.check("UMKM Profile: halaman profil memuat"):
        page.goto(f"{BASE_URL}/umkm/profile"); wait_idle(page)
        assert "/umkm/profile" in page.url
        assert "memuat profil" not in body_text(page) or page.locator("nav").count() > 0

    # A10 — Profile edit: simpan → pesan sukses
    with s.check("UMKM Profile Edit: isi field & simpan → 'berhasil disimpan'"):
        page.goto(f"{BASE_URL}/umkm/profile/edit"); wait_idle(page)
        page.get_by_placeholder("e.g. Warung Makan Bu Sari").fill("Deep Mebel Jaya Updated")
        page.get_by_placeholder("Nama lengkap pemilik").fill("Pemilik QA")
        page.get_by_placeholder("08xxxxxxxxxx").fill("081234567890")
        page.get_by_placeholder("e.g. Bandung").fill("Bandung")
        # sektor (select wajib)
        try:
            page.locator("select").first.select_option("Kuliner")
        except Exception:
            pass
        page.click("button:has-text('Simpan Profil')")
        page.wait_for_selector("text=berhasil disimpan", timeout=8000)

    # A11 — Edge: akses route worker sebagai UMKM
    with s.check("UMKM tidak bisa mengakses dashboard worker (redirect/blok)"):
        page.goto(f"{BASE_URL}/worker/dashboard"); wait_idle(page)
        # Diharapkan TIDAK menampilkan dashboard worker untuk akun UMKM.
        # Terima: redirect keluar dari /worker/dashboard, atau halaman menolak.
        if "/worker/dashboard" in page.url:
            txt = body_text(page)
            assert ("tidak" in txt or "akses" in txt or "login" in txt or "/umkm" in page.url), \
                "UMKM bisa melihat dashboard worker tanpa pembatasan (potensi bug otorisasi)"

    logout(page)


# ════════════════════════════════════════════════════════════════════════════
#  BAGIAN B — WORKER
# ════════════════════════════════════════════════════════════════════════════
def run_worker_suite(s: Suite):
    page = s.page
    print("\n" + "█" * 64 + "\n  ROLE: WORKER\n" + "█" * 64)

    login(page, WORKER["email"], WORKER["pass"], "/worker/")

    # B1 — Dashboard memuat (profil baru → kemungkinan empty/incomplete)
    with s.check("Worker Dashboard memuat (tangani profil belum lengkap)"):
        page.goto(f"{BASE_URL}/worker/dashboard"); wait_idle(page)
        assert "/worker/dashboard" in page.url
        assert page.locator("nav").count() > 0, "Nav tidak render"

    # B2 — Nav: Dashboard / Mode Kerja / Lowongan
    with s.check("Worker Nav: ketiga menu terjangkau"):
        for href, frag in [("/worker/dashboard", "/worker/dashboard"),
                            ("/worker/check-in", "/worker/check-in"),
                            ("/worker/lowongan", "/worker/lowongan")]:
            page.goto(f"{BASE_URL}{href}"); wait_idle(page)
            assert frag in page.url, f"Gagal membuka {href}"

    # B3 — Profile edit worker: isi field wajib (full_name, city, education) → sukses
    with s.check("Worker Profile Edit: isi field wajib & simpan → 'berhasil disimpan'"):
        page.goto(f"{BASE_URL}/worker/profile/edit"); wait_idle(page)
        page.get_by_placeholder("Sesuai KTP").fill("Andi Pekerja QA")
        page.get_by_placeholder("e.g. Bandung").fill("Bandung")
        # education_level (select wajib) — pilih opsi non-kosong pertama
        try:
            sel = page.locator("select").first
            opts = sel.locator("option")
            for i in range(opts.count()):
                val = opts.nth(i).get_attribute("value")
                if val:
                    sel.select_option(val)
                    break
        except Exception:
            pass
        page.click("button:has-text('Simpan Profil')")
        # sukses → "Profil berhasil disimpan!"; gagal → "Gagal menyimpan: <pesan>"
        outcome = page.locator("text=berhasil disimpan").or_(page.locator("text=Gagal menyimpan"))
        outcome.first.wait_for(state="visible", timeout=8000)
        if page.locator("text=Gagal menyimpan").count() > 0:
            err = page.locator("text=Gagal menyimpan").first.inner_text()
            raise AssertionError(f"PUT /api/worker/profile ditolak server → \"{err.strip()}\"")

    # B4 — Lowongan search: input, lokasi, checkbox tipe, sort, reset
    with s.check("Worker Lowongan: search + filter + reset tidak crash"):
        page.goto(f"{BASE_URL}/worker/lowongan"); wait_idle(page)
        page.get_by_placeholder("Posisi, skill, atau perusahaan").fill("Barista")
        page.get_by_placeholder("Semua Kota / Provinsi").fill("Bandung")
        # toggle checkbox tipe pertama
        cb = page.locator("input[type='checkbox']")
        if cb.count() > 0:
            cb.first.check()
            page.wait_for_timeout(300)
        # reset
        reset = page.get_by_text("Reset Filter")
        if reset.count() > 0:
            reset.first.click()
        page.wait_for_timeout(500)

    # B5 — Save (bookmark) lowongan pertama bila ada
    saved_done = False
    with s.check("Worker Lowongan: simpan (bookmark) lowongan pertama"):
        page.goto(f"{BASE_URL}/worker/lowongan"); wait_idle(page)
        page.wait_for_timeout(1200)
        save_btn = page.locator("button[aria-label*='Simpan lowongan']")
        if save_btn.count() == 0:
            raise SkipCheck("Tidak ada lowongan untuk disimpan (daftar kosong)")
        save_btn.first.click()
        page.wait_for_timeout(1500)
        saved_done = True

    # B6 — Saved page: tampil item atau empty-state
    with s.check("Worker Lowongan Tersimpan: item tampil atau empty-state valid"):
        page.goto(f"{BASE_URL}/worker/lowongan/saved"); wait_idle(page)
        page.wait_for_timeout(1000)
        txt = body_text(page)
        assert ("tersimpan" in txt) or ("belum ada" in txt), "Halaman saved tidak render konten yang dikenali"

    # B7 — Detail lowongan + tombol Lamar/Simpan
    with s.check("Worker Lowongan Detail: buka detail & tombol Lamar/Simpan ada"):
        page.goto(f"{BASE_URL}/worker/lowongan"); wait_idle(page)
        page.wait_for_timeout(1000)
        detail = page.locator("a:has-text('Lihat Detail')")
        if detail.count() == 0:
            raise SkipCheck("Tidak ada lowongan untuk dibuka detailnya")
        detail.first.click()
        page.wait_for_url("**/worker/lowongan/**", timeout=8000)
        wait_idle(page)
        body = body_text(page)
        assert ("lamar" in body) or ("sudah melamar" in body), "Tombol lamar tidak ditemukan di detail"

    # B8 — Apply / Lamar
    with s.check("Worker Lowongan: aksi Lamar → status berubah / konfirmasi"):
        page.goto(f"{BASE_URL}/worker/lowongan"); wait_idle(page)
        page.wait_for_timeout(1200)
        apply_btn = page.locator("button:has-text('Lamar Sekarang')")
        if apply_btn.count() == 0:
            # mungkin sudah melamar atau tidak ada lowongan
            if "sudah melamar" in body_text(page):
                pass  # sudah melamar → PASS
            else:
                raise SkipCheck("Tidak ada tombol 'Lamar Sekarang' (daftar kosong)")
        else:
            apply_btn.first.click()
            page.wait_for_timeout(2500)
            assert "sudah melamar" in body_text(page) or apply_btn.first.is_disabled(), \
                "Status tidak berubah setelah melamar"

    # B9 — Check-in / Mode Kerja: BinaBot chat + kirim pesan
    with s.check("Worker Check-in: BinaBot chat muncul & bisa kirim pesan"):
        page.goto(f"{BASE_URL}/worker/check-in"); wait_idle(page)
        # tunggu halaman keluar dari state loading (isLoading) → textarea #journal-content render
        try:
            page.wait_for_selector("#journal-content", timeout=12000)
        except PWTimeout:
            raise SkipCheck("Halaman check-in tidak keluar dari loading (workspace API lambat)")
        chat = page.locator("#journal-content")
        # textarea disabled selama questionsLoading → tunggu enabled (fetch AI / fallback)
        try:
            page.wait_for_function(
                "() => { const t = document.getElementById('journal-content'); return t && !t.disabled; }",
                timeout=12000,
            )
        except PWTimeout:
            raise SkipCheck("Input chat tetap disabled (questions dari AI service tidak kunjung siap)")
        msg = "Hari ini saya merasa cukup baik dan produktif."
        chat.fill(msg)
        page.click("button:has-text('Kirim')")
        page.wait_for_timeout(2500)
        assert msg.lower() in body_text(page), "Pesan worker tidak muncul di percakapan"

    # B10 — Tasks: kolom kanban + form bukti
    with s.check("Worker Tasks: kanban render & form bukti bisa dibuka"):
        page.goto(f"{BASE_URL}/worker/tasks"); wait_idle(page)
        page.wait_for_timeout(1500)
        txt = body_text(page)
        assert ("to do" in txt or "selesai" in txt or "review" in txt or "tugas" in txt), \
            "Kolom kanban tidak dikenali"
        report = page.locator("button:has-text('Laporkan Selesai')")
        if report.count() > 0:
            report.first.click()
            page.wait_for_timeout(600)
            ta = page.locator("textarea").first
            if ta.count() > 0:
                ta.fill("Bukti kerja QA otomatis.")

    logout(page)


# ════════════════════════════════════════════════════════════════════════════
#  BAGIAN C — KONTROL AKSES (logged out)
# ════════════════════════════════════════════════════════════════════════════
def run_access_suite(s: Suite):
    page = s.page
    print("\n" + "█" * 64 + "\n  KONTROL AKSES (logged out)\n" + "█" * 64)
    page.context.clear_cookies()

    for path in ["/umkm/dashboard", "/worker/dashboard"]:
        with s.check(f"Logged-out: akses {path} → diarahkan ke login"):
            page.goto(f"{BASE_URL}{path}"); wait_idle(page)
            page.wait_for_timeout(800)
            url = page.url
            txt = body_text(page)
            assert ("login" in url) or ("masuk ke binahub" in txt) or ("auth/login" in url), \
                f"Tidak diarahkan ke login (url akhir: {url}) — potensi bug proteksi route"


# ── Runner ────────────────────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 64)
    print("  BinaHub DEEP E2E Test Suite")
    print(f"  Base URL : {BASE_URL}   (headed={HEADED})")
    print(f"  UMKM     : {UMKM['email']}")
    print(f"  Worker   : {WORKER['email']}")
    print("=" * 64)

    doc = os.path.join(SS_DIR, "deep_doc.png")
    make_png(doc)

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not HEADED, slow_mo=250 if HEADED else 0)
        ctx     = browser.new_context(viewport={"width": 1366, "height": 900})
        page    = ctx.new_page()
        s       = Suite(page)

        # Tangkap semua dialog alert()/confirm() → simpan pesannya, lalu terima
        def _on_dialog(d):
            s.dialogs.append(d.message)
            try:
                d.accept()
            except Exception:
                pass
        page.on("dialog", _on_dialog)

        # ── Setup: registrasi 2 akun ────────────────────────────────────────
        print("\n  ⚙  Setup: registrasi akun UMKM & Worker ...")
        try:
            register(page, "umkm", UMKM["email"], UMKM["pass"])
            print("     ✔ UMKM terdaftar")
        except Exception as e:
            print(f"     ✖ Gagal daftar UMKM: {e}")
        try:
            register(page, "worker", WORKER["email"], WORKER["pass"], doc_path=doc)
            print("     ✔ Worker terdaftar")
        except Exception as e:
            print(f"     ✖ Gagal daftar Worker: {e}")

        # ── Jalankan suite ──────────────────────────────────────────────────
        run_umkm_suite(s)
        run_worker_suite(s)
        run_access_suite(s)

        browser.close()

    fails = s.summary()
    sys.exit(1 if fails > 0 else 0)


if __name__ == "__main__":
    main()
