"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../shared-auth.module.css";
import { login } from "../actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);

    startTransition(async () => {
      const res = await login(data);
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl);
      } else {
        setErrorMsg(res.message || "Gagal masuk");
      }
    });
  };

  return (
    <main className={styles.pageRoot}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Login</p>
        <h1>Masuk ke BinaHub</h1>
        <p>Silakan masukkan kredensial akun Anda.</p>

        {searchParams?.message && (
          <p className={styles.message} style={{ background: '#e6f4ea', color: '#137333' }}>
            {searchParams.message}
          </p>
        )}
        {errorMsg && <p className={styles.message}>{errorMsg}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              className={styles.input} 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              className={styles.input} 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={isPending} style={{ marginTop: 16 }}>
            {isPending ? "Mautentikasi..." : "Login"}
          </button>
        </form>

        <div className={styles.linksRow} style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/auth/register">Belum punya akun? Register</Link>
          <Link href="/">Kembali ke Beranda</Link>
        </div>
      </section>
    </main>
  );
}
