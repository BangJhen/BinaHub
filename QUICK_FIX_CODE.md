# 🚀 Quick Fix Code - Ready to Use

Kumpulan code snippets untuk memperbaiki issues yang ditemukan dari evaluasi.

---

## Fix 1: Hero Section dengan Border

**File**: `app/umkm/page.tsx`

Ganti section header dengan kode ini:

```tsx
// ❌ BEFORE - Tidak ada border
<div style={{ marginBottom: '2rem' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <h1>Kelola Lowongan</h1>
    <button>Buat Lowongan</button>
  </div>
</div>

// ✅ AFTER - Dengan proper border
<div style={{
  background: 'var(--color-background-primary)',
  border: '1px solid var(--color-border-secondary)',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '2rem'
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  }}>
    <div>
      <p style={{
        margin: 0,
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        fontWeight: 500
      }}>
        DASHBOARD UMKM
      </p>
      <h1 style={{
        margin: '0.5rem 0 0',
        fontSize: '28px',
        fontWeight: 500
      }}>
        Kelola Lowongan
      </h1>
    </div>
    <a
      href="/umkm/create"
      style={{
        background: 'var(--color-background-info)',
        color: 'var(--color-text-info)',
        border: 'none',
        padding: '10px 16px',
        borderRadius: 'var(--border-radius-md)',
        fontWeight: 500,
        cursor: 'pointer',
        fontSize: '14px',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.opacity = '1';
      }}
    >
      <i className="ti ti-plus" style={{ fontSize: '16px' }} aria-hidden="true" />
      Buat Lowongan
    </a>
  </div>
  <p style={{
    margin: 0,
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5'
  }}>
    Pantau performa lowongan dan data pelamar Anda
  </p>
</div>
```

---

## Fix 2: Handle NaN Values di Statistics

**File**: `app/umkm/components/StatisticsCard.tsx`

```tsx
'use client';

import { DashboardStats } from '@/types/lowongan';

interface StatisticsCardProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

// Helper function untuk format value
function formatStatValue(value: any): string | number {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  return value;
}

// Skeleton loader
function StatSkeleton() {
  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '1rem',
      height: '80px',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />
  );
}

// Individual stat card component
interface StatCardProps {
  label: string;
  value: number | null | undefined;
  isLoading?: boolean;
}

function StatCard({ label, value, isLoading }: StatCardProps) {
  if (isLoading) {
    return <StatSkeleton />;
  }

  const displayValue = formatStatValue(value);

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '1rem',
      transition: 'all 0.2s ease'
    }}>
      <p style={{
        margin: '0 0 8px',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        fontWeight: 500,
        letterSpacing: '0.5px'
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: '28px',
        fontWeight: 600,
        color: 'var(--color-text-primary)'
      }}>
        {displayValue}
      </p>
    </div>
  );
}

// Main component
export default function StatisticsCard({ stats, isLoading = false }: StatisticsCardProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '2rem'
    }}>
      <StatCard
        label="Lowongan Aktif"
        value={stats?.activeLowongan}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Pelamar"
        value={stats?.totalApplicants}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Views"
        value={stats?.totalViews}
        isLoading={isLoading}
      />
      <StatCard
        label="Dengan Pekerja"
        value={stats?.withPekerja}
        isLoading={isLoading}
      />

      {/* CSS untuk pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
```

---

## Fix 3: Improve Filter/Sort Bar Styling

**File**: `app/umkm/components/FilterSort.tsx`

```tsx
'use client';

interface FilterSortProps {
  statusFilter: string;
  sortBy: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
}

export default function FilterSort({
  statusFilter,
  sortBy,
  searchQuery,
  onStatusChange,
  onSortChange,
  onSearchChange,
}: FilterSortProps) {
  const selectStyle = {
    padding: '10px 12px',
    borderRadius: 'var(--border-radius-md)',
    border: '0.5px solid var(--color-border-tertiary)',
    fontSize: '13px',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const inputStyle = {
    padding: '10px 12px',
    borderRadius: 'var(--border-radius-md)',
    border: '0.5px solid var(--color-border-tertiary)',
    fontSize: '13px',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    fontWeight: 500,
    flex: 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '1.5rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          whiteSpace: 'nowrap'
        }}>
          Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          style={selectStyle}
          onFocus={(e) => {
            (e.target as HTMLSelectElement).style.borderColor = 'var(--color-background-info)';
          }}
          onBlur={(e) => {
            (e.target as HTMLSelectElement).style.borderColor = 'var(--color-border-tertiary)';
          }}
        >
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Draft</option>
          <option>Ditutup</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          whiteSpace: 'nowrap'
        }}>
          Sortir:
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={selectStyle}
          onFocus={(e) => {
            (e.target as HTMLSelectElement).style.borderColor = 'var(--color-background-info)';
          }}
          onBlur={(e) => {
            (e.target as HTMLSelectElement).style.borderColor = 'var(--color-border-tertiary)';
          }}
        >
          <option>Terbaru Ditambahkan</option>
          <option>Tertua</option>
          <option>Paling Views</option>
          <option>Paling Pelamar</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: '0 1 300px' }}>
        <i
          className="ti ti-search"
          style={{
            position: 'absolute',
            left: '12px',
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Cari lowongan..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            ...inputStyle,
            paddingLeft: '36px',
            width: '100%'
          } as React.CSSProperties}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--color-background-info)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--color-border-tertiary)';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Clear search"
          >
            <i className="ti ti-x" style={{ fontSize: '16px' }} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Fix 4: Improved List Item Card dengan Selected State

**File**: `app/umkm/components/LowonganCard.tsx`

```tsx
'use client';

import { Lowongan } from '@/types/lowongan';
import { getRelativeTime, getStatusColor } from '@/lib/utils/lowongan';
import { useState } from 'react';

interface LowonganCardProps {
  lowongan: Lowongan;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default function LowonganCard({ lowongan, isSelected, onClick }: LowonganCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const statusColor = getStatusColor(lowongan.status);

  return (
    <div
      onClick={() => onClick(lowongan.id)}
      style={{
        padding: '1rem',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        cursor: 'pointer',
        background: isSelected
          ? 'var(--color-background-info)'
          : isHovering
          ? 'var(--color-background-secondary)'
          : 'var(--color-background-primary)',
        borderLeft: isSelected ? '3px solid var(--color-background-info)' : '3px solid transparent',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(lowongan.id);
        }
      }}
    >
      {/* Header dengan title dan status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
        gap: '8px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          flex: 1
        }}>
          {lowongan.title}
        </h3>
        <span
          style={{
            background: statusColor.bg,
            color: statusColor.text,
            padding: '4px 8px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {lowongan.status}
        </span>
      </div>

      {/* Job code & location */}
      <p style={{
        margin: '0 0 8px',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        fontWeight: 500
      }}>
        {lowongan.jobCode} • {lowongan.location}
      </p>

      {/* Info row: applicants, views, type */}
      <div style={{
        display: 'flex',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i
            className="ti ti-users"
            style={{ fontSize: '13px' }}
            aria-hidden="true"
          />
          {lowongan.applicants} pelamar
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i
            className="ti ti-eye"
            style={{ fontSize: '13px' }}
            aria-hidden="true"
          />
          {lowongan.views} views
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i
            className="ti ti-briefcase"
            style={{ fontSize: '13px' }}
            aria-hidden="true"
          />
          {lowongan.type}
        </span>
      </div>

      {/* Timestamp */}
      <div style={{
        fontSize: '12px',
        color: 'var(--color-text-tertiary)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <i
          className="ti ti-calendar"
          style={{ fontSize: '13px' }}
          aria-hidden="true"
        />
        Ditambahkan {getRelativeTime(lowongan.createdAt)}
      </div>
    </div>
  );
}
```

---

## Fix 5: Better Empty State Handling

**File**: `app/umkm/components/LowonganList.tsx`

```tsx
'use client';

import { Lowongan } from '@/types/lowongan';
import LowonganCard from './LowonganCard';

interface LowonganListProps {
  lowonganList: Lowongan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

// Loading skeleton
function LowonganCardSkeleton() {
  return (
    <div style={{
      padding: '1rem',
      borderBottom: '0.5px solid var(--color-border-tertiary)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
      <div style={{
        height: '20px',
        background: 'var(--color-background-secondary)',
        borderRadius: '4px',
        marginBottom: '8px'
      }} />
      <div style={{
        height: '16px',
        background: 'var(--color-background-secondary)',
        borderRadius: '4px',
        marginBottom: '8px',
        width: '80%'
      }} />
      <div style={{
        height: '14px',
        background: 'var(--color-background-secondary)',
        borderRadius: '4px',
        width: '70%'
      }} />
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div style={{
      padding: '3rem 1rem',
      textAlign: 'center',
      color: 'var(--color-text-secondary)'
    }}>
      <i
        className="ti ti-inbox"
        style={{ fontSize: '48px', marginBottom: '1rem', display: 'block', opacity: 0.5 }}
        aria-hidden="true"
      />
      <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 500 }}>
        Belum ada lowongan
      </h3>
      <p style={{ margin: 0, fontSize: '13px', marginBottom: '1rem' }}>
        Mulai buat lowongan pertama Anda sekarang
      </p>
      <a
        href="/umkm/create"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--color-background-info)',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '13px'
        }}
      >
        <i className="ti ti-plus" aria-hidden="true" />
        Buat Lowongan
      </a>
    </div>
  );
}

export default function LowonganList({
  lowonganList,
  selectedId,
  onSelect,
  isLoading
}: LowonganListProps) {
  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        maxHeight: '600px'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-secondary)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-text-secondary)'
        }}>
          {isLoading ? 'Loading...' : `${lowonganList.length} lowongan`}
        </p>
      </div>

      {/* Content */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <LowonganCardSkeleton key={i} />
            ))}
          </>
        ) : lowonganList.length === 0 ? (
          <EmptyState />
        ) : (
          lowonganList.map((lowongan) => (
            <LowonganCard
              key={lowongan.id}
              lowongan={lowongan}
              isSelected={selectedId === lowongan.id}
              onClick={onSelect}
            />
          ))
        )}
      </div>

      {/* CSS untuk pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
```

---

## Fix 6: Add Global Animations CSS

**File**: `app/globals.css` (tambahkan ke yang sudah ada)

```css
/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Smooth transitions */
button,
input,
select,
a {
  transition: all 0.2s ease;
}

/* Focus styles untuk accessibility */
button:focus,
input:focus,
select:focus,
a:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Remove default focus untuk browser yang sudah support :focus-visible */
button:focus:not(:focus-visible),
input:focus:not(:focus-visible),
select:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-tertiary);
}
```

---

## Implementation Checklist

Urutan pengerjaan (untuk hasil optimal):

```
□ Fix 1: Hero Section Border (15 min)
  - Update header div styling
  - Add border + borderRadius
  - Test styling

□ Fix 2: Handle NaN Values (30 min)
  - Create formatStatValue helper
  - Create StatCard component
  - Update StatisticsCard component
  - Test with null/undefined values

□ Fix 3: Filter/Sort Styling (30 min)
  - Update FilterSort component
  - Add labels
  - Improve focus states
  - Add search icon

□ Fix 4: List Item Card (30 min)
  - Improve styling
  - Add hover effects
  - Better selected state
  - Add keyboard support

□ Fix 5: Empty State (30 min)
  - Create EmptyState component
  - Create skeleton loader
  - Update LowonganList
  - Test loading states

□ Fix 6: Global Animations (15 min)
  - Add to globals.css
  - Test transitions
  - Test scrollbar

TOTAL TIME: ~2.5 hours untuk semua fixes
```

---

**Status**: ✅ Ready to implement
**Priority**: Critical → Medium fixes first
**Testing**: Test setiap fix sebelum lanjut ke fix berikutnya
