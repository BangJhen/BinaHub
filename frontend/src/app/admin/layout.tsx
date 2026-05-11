import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminNav from "@/components/AdminNav";
import styles from "./layout.module.css";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  if (role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className={styles.layoutRoot}>
      <AdminNav initialRole={role} />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
