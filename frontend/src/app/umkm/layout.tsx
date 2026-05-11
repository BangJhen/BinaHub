import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import UmkmNav from "@/components/UmkmNav";
import styles from "./layout.module.css";

export default async function UmkmLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  const hasRole = role === "umkm" || role === "worker" || role === "admin";

  if (!hasRole) {
    redirect("/auth/login");
  }

  return (
    <div className={styles.layoutRoot}>
      <UmkmNav initialRole={role} />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
