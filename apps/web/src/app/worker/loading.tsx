import styles from "../loading.module.css";

export default function WorkerLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className={styles.text}>Menyiapkan Dashboard Pekerja...</p>
    </div>
  );
}
