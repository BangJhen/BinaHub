"use client";

import { Lowongan } from "@/features/lowongan/types";
import { getRelativeTime, getStatusColor, formatRupiah } from "@/features/lowongan/format";
import styles from "./lowongan.module.css";

interface LowonganCardProps {
  lowongan: Lowongan;
  isSelected: boolean;
  isChecked?: boolean;
  onToggleCheck?: (id: string, checked: boolean) => void;
  onClick: (id: string) => void;
}

function getSalaryDisplay(l: Lowongan) {
  if (l.salaryMin && l.salaryMax) {
    return `${formatRupiah(l.salaryMin)} - ${formatRupiah(l.salaryMax)}`;
  }
  if (l.salaryMin) return `Mulai ${formatRupiah(l.salaryMin)}`;
  if (l.salaryMax) return `Hingga ${formatRupiah(l.salaryMax)}`;
  return l.salary || "Gaji dirahasiakan";
}

export default function LowonganCard({
  lowongan,
  isSelected,
  isChecked = false,
  onToggleCheck,
  onClick
}: LowonganCardProps) {
  const statusColor = getStatusColor(lowongan.status as string);

  return (
    <div
      className={`${styles.cardItem} ${isSelected ? styles.cardItemSelected : ""}`}
      onClick={() => onClick(lowongan.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(lowongan.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      {onToggleCheck && (
        <div className={styles.cardCheckbox} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onToggleCheck(lowongan.id, e.target.checked)}
            aria-label={`Pilih ${lowongan.title}`}
          />
        </div>
      )}

      <div className={styles.cardBody}>
        <div className={styles.cardTopRow}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className={styles.cardTitle}>{lowongan.title}</h3>
            <p className={styles.cardCode}>{lowongan.jobCode}</p>
          </div>
          <span
            className={styles.statusBadge}
            style={{
              background: statusColor.bg,
              color: statusColor.text,
              borderColor: statusColor.border
            }}
          >
            {lowongan.status}
          </span>
        </div>

        <div className={styles.cardLocationRow}>
          <span><i className="ti ti-map-pin" aria-hidden /> {lowongan.location}</span>
          <span><i className="ti ti-briefcase" aria-hidden /> {lowongan.type}</span>
        </div>

        <div className={styles.cardSalary}>{getSalaryDisplay(lowongan)}</div>

        <div className={styles.cardMetricsRow}>
          <span className="metric"><i className="ti ti-users" aria-hidden /> <strong>{lowongan.applicants}</strong> pelamar</span>
          <span className="metric"><i className="ti ti-eye" aria-hidden /> <strong>{lowongan.views}</strong> dilihat</span>
          <span className="metric"><i className="ti ti-user-check" aria-hidden /> <strong>{lowongan.hired}</strong> diterima</span>
          <span className="metric" style={{ marginLeft: "auto" }}>
            <i className="ti ti-calendar" aria-hidden /> {getRelativeTime(lowongan.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
