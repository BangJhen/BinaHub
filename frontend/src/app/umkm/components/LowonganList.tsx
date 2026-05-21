"use client";

import { Lowongan } from "@/types/lowongan";
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
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            background: "var(--color-background-secondary)",
            display: "flex", justifyContent: "space-between"
          }}
        >
          <div className={`${styles.skeletonLine} ${styles.skeletonText}`} style={{ margin: 0, width: "100px" }} />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ padding: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonBadge}`} />
            </div>
            <div className={`${styles.skeletonLine} ${styles.skeletonText}`} style={{ width: "30%" }} />
            <div className={`${styles.skeletonLine} ${styles.skeletonText}`} style={{ width: "50%", marginTop: "12px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (lowonganList.length === 0) {
    return (
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            background: "var(--color-background-secondary)",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            0 lowongan ditemukan
          </p>
        </div>
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-tertiary)'
          }}>
            <i className="ti ti-search" style={{ fontSize: '24px' }} aria-hidden="true" />
          </div>
          <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-primary)' }}>
            Tidak ada hasil
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: "var(--color-text-secondary)", maxWidth: '250px' }}>
            Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan lowongan.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: 'transparent',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Reset Filter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "1rem",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onSelectAll && lowonganList.length > 0 && (
            <input 
              type="checkbox"
              checked={selectedIds.length === lowonganList.length}
              onChange={(e) => onSelectAll(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
          )}
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            {lowonganList.length} lowongan
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
