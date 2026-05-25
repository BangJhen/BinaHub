"use client";

import { LowonganStatus } from "@/types/lowongan";
import styles from "./lowongan.module.css";

interface FilterSortProps {
  statusFilter: LowonganStatus | "Semua Status";
  sortBy: string;
  searchQuery: string;
  selectedCount?: number;
  onStatusChange: (status: LowonganStatus | "Semua Status") => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
  onBulkDelete?: () => void;
}

export default function FilterSort({
  statusFilter,
  sortBy,
  searchQuery,
  selectedCount = 0,
  onStatusChange,
  onSortChange,
  onSearchChange,
  onBulkDelete
}: FilterSortProps) {
  const statuses = ["Semua Status", LowonganStatus.AKTIF, LowonganStatus.DRAFT, LowonganStatus.DITUTUP];
  const sortOptions = ["Terbaru Ditambahkan", "Tertua", "Paling Pelamar", "Paling Views"];

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <i className={`ti ti-search ${styles.searchIcon}`} aria-hidden />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Cari posisi, kode JOB, atau lokasi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as any)}
          className={styles.toolbarSelect}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              Status: {status}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={styles.toolbarSelect}>
          {sortOptions.map((opt) => (
            <option key={opt} value={opt}>
              Urut: {opt}
            </option>
          ))}
        </select>
      </div>

      {selectedCount > 0 && (
        <div className={styles.bulkBar}>
          <i className="ti ti-checkbox" aria-hidden style={{ color: "#9a4f00" }} />
          <strong>{selectedCount}</strong>
          <span style={{ color: "#9a4f00" }}>lowongan dipilih</span>
          {onBulkDelete && (
            <button onClick={onBulkDelete} className={styles.bulkDangerBtn}>
              <i className="ti ti-trash" aria-hidden /> Hapus
            </button>
          )}
        </div>
      )}
    </>
  );
}
