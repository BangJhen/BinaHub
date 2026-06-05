"use client";

import { DashboardStats } from "@/features/lowongan/types";
import styles from "./lowongan.module.css";

interface StatisticsCardProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number | null | undefined;
  hint?: string;
  icon?: string;
  variant?: "active" | "warn" | "success" | "info";
  isLoading?: boolean;
}

function StatCard({ label, value, hint, icon, variant = "active", isLoading }: StatCardProps) {
  const variantClass = {
    active: styles.kpiCardActive,
    warn: styles.kpiCardWarn,
    success: styles.kpiCardSuccess,
    info: styles.kpiCardInfo
  }[variant];

  const display =
    value === null || value === undefined || (typeof value === "number" && Number.isNaN(value)) ? "-" : value;

  return (
    <div className={`${styles.kpiCard} ${variantClass}`}>
      <p className={styles.kpiLabel}>{label}</p>
      <h3 className={styles.kpiValue}>{isLoading ? "..." : display}</h3>
      {hint && <p className={styles.kpiHint}>{hint}</p>}
      {icon && (
        <div className={styles.kpiIcon}>
          <i className={`ti ti-${icon}`} aria-hidden />
        </div>
      )}
    </div>
  );
}

export default function StatisticsCard({ stats, isLoading = false }: StatisticsCardProps) {
  return (
    <div className={styles.kpiGrid}>
      <StatCard
        label="Lowongan Aktif"
        value={stats?.activeLowongan}
        hint="Status terbuka"
        icon="briefcase"
        variant="active"
        isLoading={isLoading}
      />
      <StatCard
        label="Total Pelamar"
        value={stats?.totalApplicants}
        hint="Sepanjang waktu"
        icon="users"
        variant="warn"
        isLoading={isLoading}
      />
      <StatCard
        label="Total Views"
        value={stats?.totalViews}
        hint="Estimasi sesi pencari"
        icon="eye"
        variant="info"
        isLoading={isLoading}
      />
      <StatCard
        label="Lowongan Terisi"
        value={stats?.withPekerja}
        hint="Sudah ada pekerja diterima"
        icon="user-check"
        variant="success"
        isLoading={isLoading}
      />
    </div>
  );
}
