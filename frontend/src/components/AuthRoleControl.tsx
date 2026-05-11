"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./auth-role-control.module.css";

type Role = "umkm" | "worker" | "admin";

const ROLE_LABEL: Record<Role, string> = {
  umkm: "UMKM",
  worker: "Pekerja",
  admin: "Admin",
};

const ROLE_DASHBOARD: Record<Role, string> = {
  umkm: "/umkm/dashboard",
  worker: "/worker/dashboard",
  admin: "/admin/dashboard",
};

const STORAGE_KEY = "binahub-auth-role";

export default function AuthRoleControl() {
  const [role, setRole] = useState<Role | null>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const savedRole = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (savedRole === "umkm" || savedRole === "worker" || savedRole === "admin") {
      setRole(savedRole);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    }
    if (openProfile) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openProfile]);

  function handleLogout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setRole(null);
    setOpenProfile(false);
    router.push("/");
  }

  if (!role) {
    return (
      <div className={styles.authRoot}>
        <Link className={styles.authBtn} href="/auth/login">Login</Link>
        <Link className={styles.authBtnPrimary} href="/auth/register">Register</Link>
      </div>
    );
  }

  const initial = ROLE_LABEL[role].charAt(0);
  const dashboardHref = ROLE_DASHBOARD[role];

  return (
    <div className={styles.authRoot} ref={panelRef}>
      <button
        className={styles.profileBtn}
        onClick={() => setOpenProfile((prev) => !prev)}
        aria-label="User profile"
        aria-expanded={openProfile}
      >
        {initial}
      </button>

      {openProfile && (
        <div className={styles.profilePanel}>
          <div className={styles.profileHead}>
            <div className={styles.profileAvatar}>{initial}</div>
            <div>
              <p className={styles.profileName}>Akun BinaHub</p>
              <span className={styles.profileRoleBadge}>{ROLE_LABEL[role]}</span>
            </div>
          </div>

          <div className={styles.menuDivider} />

          <nav className={styles.menuList}>
            <Link href="/" className={styles.menuItem} onClick={() => setOpenProfile(false)}>Beranda</Link>
            <Link href={dashboardHref} className={styles.menuItem} onClick={() => setOpenProfile(false)}>Dashboard</Link>
            <Link href="/profile" className={styles.menuItem} onClick={() => setOpenProfile(false)}>Profil Saya</Link>
            <Link href="/settings" className={styles.menuItem} onClick={() => setOpenProfile(false)}>Pengaturan</Link>
          </nav>

          <div className={styles.menuDivider} />

          <button className={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
        </div>
      )}
    </div>
  );
}
