"use client";

import { LowonganStatus } from "@/types/lowongan";

interface FilterSortProps {
  statusFilter: LowonganStatus | "Semua Status";
  sortBy: string;
  searchQuery: string;
  onStatusChange: (status: LowonganStatus | "Semua Status") => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
}

export default function FilterSort({
  statusFilter,
  sortBy,
  searchQuery,
  onStatusChange,
  onSortChange,
  onSearchChange
}: FilterSortProps) {
  const statuses = ["Semua Status", LowonganStatus.AKTIF, LowonganStatus.DRAFT, LowonganStatus.DITUTUP];
  const sortOptions = ["Terbaru Ditambahkan", "Tertua", "Paling Views", "Paling Pelamar"];

  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
      {/* Search Input */}
      <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
        <i
          className="ti ti-search"
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Cari posisi, kode absensi, atau lokasi..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            fontSize: "14px"
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as any)}
          style={{
            padding: "10px 12px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              Status: {status}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: "10px 12px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt} value={opt}>
              Urut: {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
