import styles from "./home-footer.module.css";

export function HomeFooter() {
  return (
    <footer className={styles.footerBand}>
      <span>© {new Date().getFullYear()} BinaHub Prototype</span>
      <span>Inklusi kerja dengan monitoring yang humanis, terukur, dan berkelanjutan.</span>
    </footer>
  );
}
