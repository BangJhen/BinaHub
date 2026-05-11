"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./umkm-nav.module.css";
import AuthRoleControl from "./AuthRoleControl";

const navItems = [
  { href: "/umkm/dashboard", label: "Dashboard" },
  { href: "/umkm/jobs", label: "Lowongan" },
  { href: "/umkm/matching", label: "Matching" }
];

export default function UmkmNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.navRoot} aria-label="Navigasi UMKM">
      <div className={styles.brand}>BinaHub UMKM</div>
      <div className={styles.rightCluster}>
        <div className={styles.links}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link key={item.href} href={item.href} className={isActive ? styles.linkActive : styles.link}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <AuthRoleControl />
      </div>
    </nav>
  );
}
