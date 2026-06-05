"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/supabase/client";
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

const ROLE_PROFILE: Record<Role, string> = {
  umkm: "/umkm/profile",
  worker: "/worker/profile",
  admin: "/admin/dashboard",
};

export default function AuthRoleControl({ initialRole = null }: { initialRole?: Role | null }) {
  const [role, setRole] = useState<Role | null>(initialRole);
  const [openProfile, setOpenProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // Fetch avatar from API
  const fetchAvatar = async () => {
    try {
      const res = await fetch("/api/user/avatar");
      const data = await res.json();
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    } catch {}
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.user_metadata?.role) {
        setRole(user.user_metadata.role as Role);
        fetchAvatar();
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setRole(session.user.user_metadata?.role as Role);
          fetchAvatar();
        } else if (event === "SIGNED_OUT") {
          setRole(null);
          setAvatarUrl(null);
        }
      }
    );

    // Listen for avatar-updated event dispatched from profile pages
    const handleAvatarUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.avatar_url) setAvatarUrl(detail.avatar_url);
    };
    window.addEventListener("avatar-updated", handleAvatarUpdated);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("avatar-updated", handleAvatarUpdated);
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
  const profileHref = ROLE_PROFILE[role] || "/";

  return (
    <div className={styles.authRoot} ref={panelRef}>
      {/* Navbar avatar button */}
      <button
        className={styles.profileBtn}
        onClick={() => setOpenProfile((prev) => !prev)}
        aria-label="User profile"
        aria-expanded={openProfile}
        style={{ padding: 0, overflow: "hidden" }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
          />
        ) : (
          initial
        )}
      </button>

      {openProfile && (
        <div className={styles.profilePanel}>
          <div className={styles.profileHead}>
            {/* Dropdown avatar */}
            <div className={styles.profileAvatar} style={{ padding: 0, overflow: "hidden" }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                />
              ) : (
                initial
              )}
            </div>
            <div>
              <p className={styles.profileName}>Akun BinaHub</p>
              <span className={styles.profileRoleBadge}>{ROLE_LABEL[role]}</span>
            </div>
          </div>

          <div className={styles.menuDivider} />

          <nav className={styles.menuList}>
            <Link href="/" className={styles.menuItem} onClick={() => setOpenProfile(false)}>Beranda</Link>
            <Link href={dashboardHref} className={styles.menuItem} onClick={() => setOpenProfile(false)}>Dashboard</Link>
            <Link href={profileHref} className={styles.menuItem} onClick={() => setOpenProfile(false)}>Profil Saya</Link>
            <Link href="/settings" className={styles.menuItem} onClick={() => setOpenProfile(false)}>Pengaturan</Link>
          </nav>

          <div className={styles.menuDivider} />

          <button className={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
        </div>
      )}
    </div>
  );
}
