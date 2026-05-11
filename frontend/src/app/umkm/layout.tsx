"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import UmkmNav from "@/components/UmkmNav";
import styles from "./layout.module.css";

export default function UmkmLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const savedRole = window.localStorage.getItem("binahub-auth-role");
    const hasRole = savedRole === "umkm" || savedRole === "worker" || savedRole === "admin";

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
      <UmkmNav />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
