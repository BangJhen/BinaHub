import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/supabase/server";
import WorkerNav from "@/features/worker/components/WorkerNav";
import styles from "./layout.module.css";

export default async function WorkerLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  const hasRole = role === "worker" || role === "admin";

  if (!hasRole) {
    redirect("/auth/login");
  }

  return (
    <div className={styles.layoutRoot}>
      <WorkerNav initialRole={role} />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
