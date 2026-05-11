"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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

export default function AuthRoleControl() {
  const [role, setRole] = useState<Role | null>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.user_metadata?.role) {
        setRole(user.user_metadata.role as Role);
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setRole(session.user.user_metadata?.role as Role);
        } else if (event === "SIGNED_OUT") {
          setRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    }
    if (openProfile) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openProfile]);

  async function handleLogout() {
    setOpenProfile(false);
    await supabase.auth.signOut();
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

  const initial = ROLE_LABEL[role]?.charAt(0) || "U";
  const dashboardHref = ROLE_DASHBOARD[role] || "/";

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
