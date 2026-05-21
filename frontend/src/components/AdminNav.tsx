import Link from "next/link";
import Image from "next/image";
import styles from "./admin-nav.module.css";
import AuthRoleControl from "./AuthRoleControl";

export default function AdminNav({ initialRole }: { initialRole?: any }) {
  return (
    <nav className={styles.navRoot} aria-label="Navigasi Admin">
      <Link href="/" className={styles.brand} aria-label="BinaHub Home">
        <Image src="/logo-binahub.svg" alt="Logo BinaHub" width={120} height={20} className={styles.brandLogo} priority />
      </Link>
      <div className={styles.rightCluster}>
        <AuthRoleControl initialRole={initialRole} />
      </div>
    </nav>
  );
}
