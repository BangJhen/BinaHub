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

export default function LoginPage() {
  const router = useRouter();

  const roleRedirect: Record<Role, string> = {
    umkm: "/umkm/dashboard",
    worker: "/worker/dashboard",
    admin: "/umkm/dashboard",
  };

  function handleLogin(role: Role) {
    window.localStorage.setItem("binahub-auth-role", role);
    router.push(roleRedirect[role]);
  }

  return (
    <main className={styles.pageRoot}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Login</p>
        <h1>Masuk ke BinaHub</h1>
        <p>Pilih role akun untuk simulasi login prototype.</p>

        <div className={styles.roleGrid}>
          {roles.map((role) => (
            <button key={role.key} className={styles.roleBtn} onClick={() => handleLogin(role.key)}>
              Masuk sebagai {role.label}
            </button>
          ))}
        </div>

        <div className={styles.linksRow}>
          <Link href="/auth/register">Belum punya akun? Register</Link>
          <Link href="/">Kembali ke Beranda</Link>
        </div>
      </section>
    </main>
  );
}
