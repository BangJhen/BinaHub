"use client";

import { Lowongan } from "@/features/lowongan/types";
import LowonganCard from "./LowonganCard";
import styles from "./lowongan.module.css";

interface LowonganListProps {
  lowonganList: Lowongan[];
  selectedId: string | null;
  selectedIds?: string[];
  onSelect: (id: string) => void;
  onToggleSelect?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  isLoading?: boolean;
}

export default function LowonganList({
  lowonganList,
  selectedId,
  selectedIds = [],
  onSelect,
  onToggleSelect,
  onSelectAll,
  isLoading
}: LowonganListProps) {
  if (isLoading) {
    return (
      <div className={styles.listPanel}>
        <div className={styles.listHeader}>
          <p className={styles.listCount}>Memuat lowongan...</p>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        ))}
      </div>
    );
  }

  if (lowonganList.length === 0) {
    return (
      <div className={styles.listPanel}>
        <div className={styles.listHeader}>
          <p className={styles.listCount}>0 lowongan ditemukan</p>
        </div>
        <div className={styles.emptyPanel}>
          <div className={styles.emptyIcon}>
            <i className="ti ti-briefcase-off" aria-hidden />
          </div>
          <h3>Belum ada lowongan</h3>
          <p>Buat lowongan pertama Anda untuk mulai menjangkau pekerja yang sesuai.</p>
          <a href="/umkm/lowongan/create" className={styles.emptyAction}>
            <i className="ti ti-plus" aria-hidden /> Buat Lowongan Baru
          </a>
        </div>
      </div>
    );
  }

  const allChecked = onSelectAll && selectedIds.length === lowonganList.length;
  const someChecked = onSelectAll && selectedIds.length > 0 && !allChecked;

  return (
    <div className={styles.listPanel}>
      <div className={styles.listHeader}>
        <div className={styles.selectAllRow}>
          {onSelectAll && (
            <input
              type="checkbox"
              checked={Boolean(allChecked)}
              ref={(el) => {
                if (el) el.indeterminate = Boolean(someChecked);
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              aria-label="Pilih semua lowongan"
              style={{ width: 16, height: 16, accentColor: "#0f6e99", cursor: "pointer" }}
            />
          )}
          <p className={styles.listCount}>
            {lowonganList.length} lowongan{selectedIds.length > 0 ? ` • ${selectedIds.length} dipilih` : ""}
          </p>
        </div>
      </div>

      {lowonganList.map((lowongan) => (
        <LowonganCard
          key={lowongan.id}
          lowongan={lowongan}
          isSelected={selectedId === lowongan.id}
          isChecked={selectedIds.includes(lowongan.id)}
          onToggleCheck={onToggleSelect}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
