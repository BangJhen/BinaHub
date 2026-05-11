"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin-nav.module.css";
import AuthRoleControl from "./AuthRoleControl";

const navItems = [{ href: "/admin/dashboard", label: "Dashboard" }];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.navRoot} aria-label="Navigasi Admin">
      <div className={styles.brand}>BinaHub Admin</div>
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
    </nav>
  );
}
