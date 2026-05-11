import styles from "./admin-nav.module.css";
import AuthRoleControl from "./AuthRoleControl";

export default function AdminNav({ initialRole }: { initialRole?: any }) {
  return (
    <nav className={styles.navRoot} aria-label="Navigasi Admin">
      <div className={styles.brand}>BinaHub Admin</div>
      <div className={styles.rightCluster}>
        <AuthRoleControl initialRole={initialRole} />
      </div>
    </nav>
  );
}
