"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./umkm-nav.module.css";
import AuthRoleControl from "./AuthRoleControl";

const navItems = [
  { href: "/umkm/dashboard", label: "Dashboard" },
  { href: "/umkm/lowongan", label: "Lowongan" },
  { href: "/umkm/matching", label: "Matching" }
];

export default function UmkmNav({ initialRole }: { initialRole?: any }) {
  const pathname = usePathname();

  return (
    <nav className={styles.navRoot} aria-label="Navigasi UMKM">
      <Link href="/" className={styles.brand} aria-label="BinaHub Home">
        <Image src="/logo-binahub.svg" alt="Logo BinaHub" width={120} height={20} className={styles.brandLogo} priority />
      </Link>
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
        <AuthRoleControl initialRole={initialRole} />
      </div>
    </nav>
  );
}
