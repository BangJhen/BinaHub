import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import AuthRoleControl from "../AuthRoleControl";
import styles from "./home-nav.module.css";

export async function HomeNav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  return (
    <nav className={styles.topNav}>
      <div className={styles.brand}>BinaHub</div>
      <div className={styles.navCenter}>
        <a href="#fitur">Fitur</a>
        <a href="#alur">Alur</a>
        <a href="#peran">Peran</a>
        <a href="#faq">FAQ</a>
      </div>
      <div className={styles.navLinks}>
        <AuthRoleControl initialRole={role} />
      </div>
    </nav>
  );
}
