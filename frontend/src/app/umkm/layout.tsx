import type { ReactNode } from "react";
import UmkmNav from "@/components/UmkmNav";
import styles from "./layout.module.css";

export default function UmkmLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layoutRoot}>
      <UmkmNav />
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
