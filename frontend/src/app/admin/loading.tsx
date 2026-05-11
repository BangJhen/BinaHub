import styles from "../loading.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className={styles.text}>Menyiapkan Dashboard Admin...</p>
    </div>
  );
}
