"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../shared-auth.module.css";

type Role = "umkm" | "worker" | "admin";

const roles: { key: Role; label: string }[] = [
  { key: "umkm", label: "UMKM" },
  { key: "worker", label: "Worker" },
  { key: "admin", label: "Admin" }
];

export default function RegisterPage() {
  const router = useRouter();

  const roleRedirect: Record<Role, string> = {
    umkm: "/umkm/dashboard",
    worker: "/worker/dashboard",
    admin: "/admin/dashboard",
  };

  function handleRegister(role: Role) {
    window.localStorage.setItem("binahub-auth-role", role);
    router.push(roleRedirect[role]);
  }

  return (
    <main className={styles.pageRoot}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Register</p>
        <h1>Buat Akun BinaHub</h1>
        <p>Pilih role akun untuk simulasi register prototype.</p>

        <div className={styles.roleGrid}>
          {roles.map((role) => (
            <button key={role.key} className={styles.roleBtn} onClick={() => handleRegister(role.key)}>
              Daftar sebagai {role.label}
            </button>
          ))}
        </div>

        <div className={styles.linksRow}>
          <Link href="/auth/login">Sudah punya akun? Login</Link>
          <Link href="/">Kembali ke Beranda</Link>
        </div>
      </section>
    </main>
  );
}
