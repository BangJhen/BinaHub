import styles from "../loading.module.css";

export default function UmkmLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className={styles.text}>Menyiapkan Dashboard UMKM...</p>
    </div>
  );
}
