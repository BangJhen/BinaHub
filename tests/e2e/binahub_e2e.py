"""
BinaHub E2E Test Suite
======================
Menguji alur utama aplikasi layaknya pengguna nyata menggunakan Playwright.

Skenario yang diuji:
  T01 - Landing page: tampilan & navigasi
  T02 - Validasi form register (input invalid → cek error messages)
  T03 - Register UMKM (alur 3 langkah, akun baru di Supabase)
  T04 - Login UMKM → redirect ke /umkm/dashboard
  T05 - UMKM Dashboard: navigasi dasar & buat lowongan
  T06 - Register Worker (alur 3 langkah + upload dokumen)
  T07 - Login Worker → redirect ke /worker/dashboard
  T08 - Worker Dashboard: navigasi, cari lowongan
  T09 - Logout: sesi berakhir, redirect ke halaman utama

Cara menjalankan:
  cd tests/e2e
  python binahub_e2e.py

Output:
  - Console: PASS / FAIL per test
  - screenshots/  → gambar tiap tahap
"""

import os
import sys
import time
import struct
import zlib
import tempfile
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, expect

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL   = "http://localhost:3000"
TIMESTAMP  = datetime.now().strftime("%H%M%S")
UMKM_EMAIL    = f"test.umkm.{TIMESTAMP}@binahub.test"
UMKM_PASS     = "TestUmkm1"
WORKER_EMAIL  = f"test.worker.{TIMESTAMP}@binahub.test"
WORKER_PASS   = "TestWorker1"

# Flag: apakah worker berhasil terdaftar
_worker_registered = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SS_DIR     = os.path.join(SCRIPT_DIR, "screenshots")
os.makedirs(SS_DIR, exist_ok=True)

# ── Helpers ───────────────────────────────────────────────────────────────────
results: list[dict] = []

def ss(page: Page, name: str) -> str:
    path = os.path.join(SS_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    return path

def run_test(label: str):
    """
    Decorator — prints PASS / FAIL / SKIP.
    The current test's result dict is appended BEFORE calling fn(),
    so fn() can safely do results[-1]['status'] = 'SKIP'.
    """
    def decorator(fn):
        def wrapper(page: Page, *args, **kwargs):
            print(f"\n  ▶  {label}")
            current = {"label": label, "status": "PASS"}
            results.append(current)
            try:
                fn(page, *args, **kwargs)
            except Exception as e:
                current["status"] = "FAIL"
                current["error"] = str(e)
                try:
                    ss(page, f"FAIL_{label.replace(' ', '_')}")
                except Exception:
                    pass

            # Print final status after fn() may have changed it
            s = current["status"]
            if s == "PASS":
                print(f"     \033[92m✔ PASS\033[0m")
            elif s == "FAIL":
                print(f"     \033[91m✖ FAIL\033[0m  {current.get('error', '')}")
            else:
                pass  # SKIP message already printed inside fn()
        return wrapper
    return decorator


def make_fake_png(path: str) -> None:
    """
    Buat file PNG 1x1 pixel valid secara minimal — untuk dipakai sebagai
    dokumen dummy di form registrasi Worker.
    """
    def chunk(tag: bytes, data: bytes) -> bytes:
        c = struct.pack(">I", len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return c + struct.pack(">I", crc)

    sig  = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw  = b"\x00\xff\xff\xff"
    comp = zlib.compress(raw)
    idat = chunk(b"IDAT", comp)
    iend = chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(sig + ihdr + idat + iend)


def wait_network(page: Page, timeout: int = 8000):
    page.wait_for_load_state("networkidle", timeout=timeout)


# ── Tests ─────────────────────────────────────────────────────────────────────

@run_test("T01 · Landing page — tampilan & navigasi")
def test_landing(page: Page):
    page.goto(BASE_URL)
    wait_network(page)
    ss(page, "T01_landing")

    # Navbar harus ada
    page.wait_for_selector("nav", timeout=5000)

    # Tombol CTA "Login" atau "Masuk" harus ada di halaman
    cta = page.locator("text=Login").or_(page.locator("text=Masuk")).first
    assert cta.count() >= 1, "Tombol login tidak ditemukan di landing page"

    # Hero section — cari h1 atau heading utama
    heading = page.locator("h1").first
    assert heading.is_visible(), "Heading utama halaman tidak terlihat"

    # Scroll ke bawah untuk memeriksa section lainnya
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(600)
    ss(page, "T01_landing_mid")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(600)
    ss(page, "T01_landing_bottom")


@run_test("T02 · Validasi form register — input invalid")
def test_register_validation(page: Page):
    page.goto(f"{BASE_URL}/auth/register")
    wait_network(page)
    ss(page, "T02_register_blank")

    # Klik "Lanjut" tanpa mengisi apa-apa → harus muncul error
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(400)
    ss(page, "T02_validation_errors")

    # Cek error message muncul
    error = page.locator("[class*='fieldError'], [class*='error']").first
    assert error.count() >= 1, "Pesan validasi tidak muncul saat form kosong"

    # Isi email tidak valid
    page.fill("#email", "bukan_email")
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(400)
    ss(page, "T02_invalid_email")

    # Password lemah (tanpa huruf besar)
    page.fill("#name",  "Test User")
    page.fill("#email", "valid@test.com")
    page.fill("#password", "weakpassword")
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(400)
    ss(page, "T02_weak_password")
    error2 = page.locator("[class*='fieldError'], [class*='error']").first
    assert error2.count() >= 1, "Pesan validasi password lemah tidak muncul"


@run_test("T03 · Register UMKM — alur 3 langkah")
def test_register_umkm(page: Page):
    page.goto(f"{BASE_URL}/auth/register")
    wait_network(page)

    # Step 1: Informasi Personal
    page.fill("#name",     "Budi Santoso Test")
    page.fill("#email",    UMKM_EMAIL)
    page.fill("#password", UMKM_PASS)
    ss(page, "T03_step1_filled")
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(500)

    # Step 2: Pilih Role → klik card "Pemilik UMKM"
    page.wait_for_selector("text=Pilih Peran", timeout=5000)
    ss(page, "T03_step2")
    page.click("text=Pemilik UMKM")
    page.wait_for_timeout(300)
    ss(page, "T03_step2_role_selected")
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(500)

    # Step 3: Detail UMKM
    page.wait_for_selector("#businessName", timeout=5000)
    page.fill("#businessName",    "Mebel Jaya Test")
    page.fill("#businessType",    "Furniture & Mebel")
    page.fill("#businessAddress", "Jl. Raya Test No. 12, Bandung")
    ss(page, "T03_step3_filled")

    # Submit
    page.click("button[type='submit']")
    page.wait_for_timeout(4000)  # tunggu server action + Supabase
    ss(page, "T03_after_submit")

    # Cek sukses: step 4 muncul atau pesan sukses
    success = (
        page.locator("text=Registrasi berhasil").or_(
        page.locator("text=berhasil")).or_(
        page.locator("text=login")).first
    )
    assert success.count() >= 1, "Pesan sukses registrasi UMKM tidak ditemukan"


@run_test("T04 · Login UMKM → redirect ke /umkm/dashboard")
def test_login_umkm(page: Page):
    page.goto(f"{BASE_URL}/auth/login")
    wait_network(page)
    ss(page, "T04_login_page")

    # Login form menggunakan name= bukan id= — pakai selector [name]
    page.fill("[name='email']",    UMKM_EMAIL)
    page.fill("[name='password']", UMKM_PASS)
    ss(page, "T04_login_filled")
    page.click("button[type='submit']")

    # Tunggu redirect
    page.wait_for_url("**/umkm/**", timeout=10000)
    wait_network(page)
    ss(page, "T04_after_login")

    assert "/umkm/" in page.url, f"Tidak redirect ke /umkm/ — actual: {page.url}"


@run_test("T05 · UMKM Dashboard — navigasi & eksplorasi")
def test_umkm_dashboard(page: Page):
    # Halaman UMKM sudah terbuka dari T04
    page.wait_for_selector("nav", timeout=5000)
    ss(page, "T05_dashboard")

    # Cek heading dashboard ada
    heading = page.locator("h1, h2").first
    assert heading.is_visible(), "Heading dashboard UMKM tidak terlihat"

    # Klik menu Lowongan jika ada
    nav_lowongan = page.locator("a[href*='lowongan']").first
    if nav_lowongan.count() > 0:
        nav_lowongan.click()
        wait_network(page)
        ss(page, "T05_lowongan_page")

    # Klik Buat Lowongan jika ada tombolnya
    btn_create = (
        page.locator("text=Buat Lowongan").or_(
        page.locator("text=Tambah Lowongan")).or_(
        page.locator("text=+ Lowongan")).first
    )
    if btn_create.count() > 0:
        btn_create.click()
        wait_network(page)
        ss(page, "T05_buat_lowongan_form")


@run_test("T06 · Register Worker — alur 3 langkah + upload dokumen")
def test_register_worker(page: Page):
    global _worker_registered
    # Buat fake PNG untuk dokumen
    fake_doc = os.path.join(SS_DIR, "fake_cv.png")
    make_fake_png(fake_doc)

    page.goto(f"{BASE_URL}/auth/register")
    wait_network(page)

    # Step 1
    page.fill("#name",     "Andi Worker Test")
    page.fill("#email",    WORKER_EMAIL)
    page.fill("#password", WORKER_PASS)
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(500)

    # Step 2: Pilih Worker
    page.wait_for_selector("text=Pilih Peran", timeout=5000)
    page.click("text=Pekerja (Worker)")
    page.wait_for_timeout(300)
    page.click("button:has-text('Lanjut')")
    page.wait_for_timeout(500)

    # Step 3: Detail Worker
    page.wait_for_selector("#nik", timeout=5000)
    page.fill("#nik",            "3273012345678901")  # 16 digit valid
    page.fill("#skills",         "Tukang Kayu, Las")
    page.fill("#experience",     "3 tahun di industri mebel")
    page.fill("#workerAddress",  "Jl. Melati No. 5, Bandung")
    ss(page, "T06_step3_filled")

    # Upload dokumen
    page.set_input_files("#document", fake_doc)
    page.wait_for_timeout(300)
    ss(page, "T06_doc_uploaded")

    # Submit
    page.click("button[type='submit']")
    page.wait_for_timeout(6000)  # tunggu upload ke Supabase Storage
    ss(page, "T06_after_submit")

    # Cek sukses
    success = (
        page.locator("text=Registrasi berhasil").or_(
        page.locator("text=berhasil")).first
    )
    if success.count() >= 1:
        _worker_registered = True
        return  # PASS

    # Cek apakah ada error message yang informatif (mis. storage bucket belum ada)
    error_el = page.locator("[class*='message'], [class*='error'], [class*='submitError']").first
    error_text = error_el.inner_text() if error_el.count() > 0 else "(no error message found)"
    ss(page, "T06_error_detail")
    raise AssertionError(
        f"Registrasi Worker gagal — server mengembalikan: \"{error_text}\"\n"
        "     CATATAN: Buat bucket 'documents' di Supabase Storage Dashboard → "
        "Storage → New bucket → nama: 'documents', akses: private"
    )


@run_test("T07 · Login Worker → redirect ke /worker/dashboard")
def test_login_worker(page: Page):
    global _worker_registered
    if not _worker_registered:
        # Worker tidak berhasil didaftarkan (T06 gagal) — skip
        results[-1]["status"] = "SKIP"
        print("     (skip — akun worker tidak terdaftar karena T06 gagal)")
        return

    page.goto(f"{BASE_URL}/auth/login")
    wait_network(page)

    page.fill("[name='email']",    WORKER_EMAIL)
    page.fill("[name='password']", WORKER_PASS)
    page.click("button[type='submit']")

    page.wait_for_url("**/worker/**", timeout=10000)
    wait_network(page)
    ss(page, "T07_worker_dashboard")

    assert "/worker/" in page.url, f"Tidak redirect ke /worker/ — actual: {page.url}"


@run_test("T08 · Worker Dashboard — navigasi & cari lowongan")
def test_worker_dashboard(page: Page):
    global _worker_registered
    if not _worker_registered:
        results[-1]["status"] = "SKIP"
        print("     (skip — bergantung pada T06/T07 yang gagal)")
        return

    page.wait_for_selector("nav", timeout=5000)
    ss(page, "T08_dashboard")

    heading = page.locator("h1, h2").first
    assert heading.is_visible(), "Heading dashboard Worker tidak terlihat"

    # Klik menu Lowongan
    nav_lowongan = page.locator("a[href*='lowongan']").first
    if nav_lowongan.count() > 0:
        nav_lowongan.click()
        wait_network(page)
        ss(page, "T08_lowongan_list")

    # Cek halaman profil
    nav_profile = page.locator("a[href*='profile']").first
    if nav_profile.count() > 0:
        nav_profile.click()
        wait_network(page)
        ss(page, "T08_profile_page")


@run_test("T09 · Logout — sesi berakhir (dari akun UMKM)")
def test_logout(page: Page):
    # Kembali ke UMKM dashboard agar ada sesi aktif
    page.goto(f"{BASE_URL}/umkm/dashboard")
    wait_network(page)
    ss(page, "T09_before_logout")

    # Klik tombol avatar (aria-label="User profile") untuk buka dropdown
    avatar_btn = page.locator("button[aria-label='User profile']")
    avatar_btn.wait_for(state="visible", timeout=5000)
    avatar_btn.click()
    page.wait_for_timeout(500)
    ss(page, "T09_dropdown_open")

    # Klik "Keluar" di dalam dropdown
    keluar_btn = page.locator("button:has-text('Keluar')")
    keluar_btn.wait_for(state="visible", timeout=3000)
    keluar_btn.click()

    # Tunggu redirect ke halaman utama
    page.wait_for_url("**/", timeout=8000)
    wait_network(page)
    ss(page, "T09_after_logout")

    assert "/umkm/dashboard"   not in page.url, "Masih di UMKM dashboard setelah logout"
    assert "/worker/dashboard" not in page.url, "Masih di Worker dashboard setelah logout"


# ── Runner ────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "="*58)
    print("  BinaHub E2E Test Suite")
    print(f"  Base URL  : {BASE_URL}")
    print(f"  UMKM email: {UMKM_EMAIL}")
    print(f"  Worker email: {WORKER_EMAIL}")
    print(f"  Screenshots: {SS_DIR}")
    print("="*58)

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx     = browser.new_context(viewport={"width": 1280, "height": 800})
        page    = ctx.new_page()

        # Tes yang perlu state berurutan
        test_landing(page)
        test_register_validation(page)
        test_register_umkm(page)
        test_login_umkm(page)
        test_umkm_dashboard(page)
        test_register_worker(page)
        test_login_worker(page)
        test_worker_dashboard(page)
        test_logout(page)

        browser.close()

    # ── Ringkasan ─────────────────────────────────────────────────────────────
    print("\n" + "="*58)
    print("  RINGKASAN HASIL")
    print("="*58)
    passed = skipped = failed = 0
    for r in results:
        icon = {"PASS": "\033[92m✔\033[0m", "FAIL": "\033[91m✖\033[0m", "SKIP": "\033[93m-\033[0m"}[r["status"]]
        label_col = f"{r['label']:<42}"
        print(f"  {icon}  {label_col} {r['status']}")
        if r.get("error"):
            print(f"     └─ {r['error']}")
        if r["status"] == "PASS":   passed  += 1
        if r["status"] == "FAIL":   failed  += 1
        if r["status"] == "SKIP":   skipped += 1

    total = len(results)
    print("-"*58)
    print(f"  Total: {total}  |  \033[92mPass: {passed}\033[0m  |  "
          f"\033[91mFail: {failed}\033[0m  |  \033[93mSkip: {skipped}\033[0m")
    print("="*58 + "\n")

    sys.exit(1 if failed > 0 else 0)


if __name__ == "__main__":
    main()
