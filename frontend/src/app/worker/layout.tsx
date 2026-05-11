"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import WorkerNav from "@/components/WorkerNav";
import styles from "./layout.module.css";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const savedRole = window.localStorage.getItem("binahub-auth-role");
    const hasRole = savedRole === "worker" || savedRole === "admin";

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
      <WorkerNav />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
