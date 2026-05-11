"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import styles from "./layout.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const savedRole = window.localStorage.getItem("binahub-auth-role");
    const hasRole = savedRole === "admin";

    if (!hasRole) {
      setIsAuthorized(false);
      router.replace("/");
      return;
    }

    setIsAuthorized(true);
  }, [router, pathname]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.layoutRoot}>
      <AdminNav />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
