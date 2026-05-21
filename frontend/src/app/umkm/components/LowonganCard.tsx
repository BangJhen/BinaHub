"use client";

import { Lowongan } from "@/types/lowongan";
import { getRelativeTime, getStatusColor } from "@/lib/utils/lowongan";
import styles from "./lowongan.module.css";
import { useState } from 'react';

interface LowonganCardProps {
  lowongan: Lowongan;
  isSelected: boolean;
  isChecked?: boolean;
  onToggleCheck?: (id: string, checked: boolean) => void;
  onClick: (id: string) => void;
}

export default function LowonganCard({ lowongan, isSelected, isChecked = false, onToggleCheck, onClick }: LowonganCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const statusColor = getStatusColor(lowongan.status);

  return (
    <div
      className={styles.cardTransition}
      style={{
        padding: "1rem",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        cursor: "pointer",
        background: isSelected
          ? 'var(--color-background-info)'
          : isHovering || isChecked
          ? 'var(--color-background-secondary)'
          : 'var(--color-background-primary)',
        borderLeft: isSelected ? '3px solid var(--color-background-info)' : '3px solid transparent',
        transition: "all 0.2s ease",
        position: 'relative',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      {onToggleCheck && (
        <div style={{ paddingTop: '2px' }} onClick={(e) => e.stopPropagation()}>
          <input 
            type="checkbox" 
            checked={isChecked}
            onChange={(e) => onToggleCheck(lowongan.id, e.target.checked)}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
        </div>
      )}
      
      <div 
        style={{ flex: 1 }}
        onClick={() => onClick(lowongan.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(lowongan.id);
          }
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 500, flex: 1, color: 'var(--color-text-primary)' }}>{lowongan.title}</h3>
        <span
          style={{
            background: statusColor.bg,
            color: statusColor.text,
            padding: "4px 8px",
            borderRadius: "var(--border-radius-md)",
            fontSize: "11px",
            fontWeight: 500,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {lowongan.status}
        </span>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
        {lowongan.jobCode} • {lowongan.location}
      </p>

      <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "8px", flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i
            className="ti ti-users"
            style={{ fontSize: "13px" }}
            aria-hidden="true"
          />
          {lowongan.applicants} pelamar
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i className="ti ti-eye" style={{ fontSize: "13px" }} aria-hidden="true" />
          {lowongan.views} views
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i className="ti ti-briefcase" style={{ fontSize: "13px" }} aria-hidden="true" />
          {lowongan.type}
        </span>
      </div>

      <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", display: 'flex', alignItems: 'center', gap: '4px' }}>
        <i
          className="ti ti-calendar"
          style={{ fontSize: "13px" }}
          aria-hidden="true"
        />
        Ditambahkan {getRelativeTime(lowongan.createdAt)}
      </div>
      </div>
    </div>
  );
}
