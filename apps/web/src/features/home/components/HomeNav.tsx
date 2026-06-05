import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/supabase/server";
import AuthRoleControl from "@/features/auth/components/AuthRoleControl";
import styles from "./home-nav.module.css";

export async function HomeNav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  return (
    <nav className={styles.topNav}>
      <Link href="/" className={styles.brand} aria-label="BinaHub Home">
        <Image src="/logo-binahub.svg" alt="Logo BinaHub" width={120} height={20} className={styles.brandLogo} priority />
      </Link>
      <div className={styles.navCenter}>
        <a href="#fitur">Fitur</a>
        <a href="#alur">Alur</a>
        <a href="#peran">Peran</a>
        <a href="#faq">FAQ</a>
        <a href="#founders">Pendiri</a>
      </div>
      <div className={styles.navLinks}>
        <AuthRoleControl initialRole={role} />
      </div>
    </nav>
  );
}
