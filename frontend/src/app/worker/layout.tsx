"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import WorkerNav from "@/components/WorkerNav";
import styles from "./layout.module.css";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      const hasRole = role === "worker" || role === "admin";

      if (!hasRole) {
        setIsAuthorized(false);
        router.replace("/auth/login");
        return;
      }

      setIsAuthorized(true);
    }

    checkAuth();
  }, [router, pathname, supabase.auth]);

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
