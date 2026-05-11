"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./auth-role-control.module.css";

type Role = "umkm" | "worker" | "admin";

const ROLE_LABEL: Record<Role, string> = {
  umkm: "UMKM",
  worker: "Worker",
  admin: "Admin"
};

const STORAGE_KEY = "binahub-auth-role";

export default function AuthRoleControl() {
  const [role, setRole] = useState<Role | null>(null);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    const savedRole = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (savedRole === "umkm" || savedRole === "worker" || savedRole === "admin") {
      setRole(savedRole);
    }
  }, []);

  const profileInitial = useMemo(() => {
    if (!role) return "U";
    return ROLE_LABEL[role].charAt(0);
  }, [role]);

  function handleSetRole(nextRole: Role) {
    window.localStorage.setItem(STORAGE_KEY, nextRole);
    setRole(nextRole);
    setOpenProfile(false);
  }

  function handleLogout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setRole(null);
    setOpenProfile(false);
  }

  if (!role) {
    return (
      <div className={styles.authRoot}>
        <Link className={styles.authBtn} href="/auth/login">
          Login
        </Link>
        <Link className={styles.authBtnPrimary} href="/auth/register">
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.authRoot}>
      <button className={styles.profileBtn} onClick={() => setOpenProfile((prev) => !prev)} aria-label="User profile">
        {profileInitial}
      </button>

      {openProfile && (
        <div className={styles.profilePanel}>
          <p className={styles.profileRole}>Role aktif: {ROLE_LABEL[role]}</p>
          <div className={styles.roleGrid}>
            {(["umkm", "worker", "admin"] as const).map((option) => (
              <button
                key={option}
                className={option === role ? styles.roleBtnActive : styles.roleBtn}
                onClick={() => handleSetRole(option)}
              >
                {ROLE_LABEL[option]}
              </button>
            ))}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
