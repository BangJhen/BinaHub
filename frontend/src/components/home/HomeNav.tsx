import Link from "next/link";
import styles from "./home-nav.module.css";

export function HomeNav() {
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
        <Link href="/auth/login" className={styles.ghostBtn}>
          Login
        </Link>
        <Link href="/auth/register" className={styles.primaryBtn}>
          Register
        </Link>
      </div>
    </nav>
  );
}
