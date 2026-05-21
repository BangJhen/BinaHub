# 🚀 UMKM Lowongan Dashboard - Execution Roadmap (Step by Step)

## 📚 Table of Contents
1. [Phase 1: Data Modeling & API Setup](#phase-1)
2. [Phase 2: Component Structure](#phase-2)
3. [Phase 3: Main Dashboard Page](#phase-3)
4. [Phase 4: Create Page Migration](#phase-4)
5. [Phase 5: Styling & Polish](#phase-5)
6. [Timeline & Milestones](#timeline)

---

## <a name="phase-1"></a>Phase 1: Data Modeling & API Setup (1-2 days)

### **Step 1.1: Define TypeScript Types**

**File**: `types/lowongan.ts`

```typescript
// Enums
export enum LowonganStatus {
  AKTIF = 'Aktif',
  DRAFT = 'Draft',
  DITUTUP = 'Ditutup',
}

export enum JobType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract',
  FREELANCE = 'Freelance',
}

export enum PekerjaStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
}

// Main Types
export interface Lowongan {
  id: string;
  title: string;
  jobCode: string;              // e.g., J-201
  location: string;
  type: JobType;
  salary: string;               // e.g., "2500000-3500000"
  description?: string;
  requirements?: string;
  status: LowonganStatus;
  positions: number;            // How many positions needed
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  
  // Stats
  views: number;
  viewsThisWeek: number;
  applicants: number;
  hired: number;
  
  // Relations
  umkmId: string;
  pekerjaList?: Pekerja[];
}

export interface Pekerja {
  id: string;
  lowonganId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedAt: Date;
  status: PekerjaStatus;
  salary?: number;
  notes?: string;
}

export interface LowonganView {
  id: string;
  lowonganId: string;
  viewedBy?: string;            // User ID or anonymous
  viewedAt: Date;
  isInternal: boolean;          // UMKM sendiri atau user lain
  userAgent?: string;           // Browser info
}

export interface DashboardStats {
  activeLowongan: number;
  totalApplicants: number;
  totalViews: number;
  withPekerja: number;
  viewsTrend: number;           // Percentage change from last week
}

export interface FilterSortState {
  statusFilter: LowonganStatus | 'Semua Status';
  sortBy: 'Terbaru Ditambahkan' | 'Tertua' | 'Paling Views' | 'Paling Pelamar';
  searchQuery: string;
}
```

---

### **Step 1.2: API Endpoints Contract**

**File**: `lib/api/lowongan.ts`

```typescript
import { Lowongan, Pekerja, DashboardStats, LowonganView } from '@/types/lowongan';

/**
 * GET /api/umkm/lowongan
 * Fetch all lowongan untuk UMKM yang login
 */
export async function fetchLowonganList(): Promise<Lowongan[]> {
  const response = await fetch('/api/umkm/lowongan', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to fetch lowongan list');
  const data = await response.json();
  
  // Convert string dates to Date objects
  return data.data.map(item => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    closedAt: item.closedAt ? new Date(item.closedAt) : undefined,
  }));
}

/**
 * GET /api/umkm/lowongan/:id
 * Fetch single lowongan with full details
 */
export async function fetchLowonganDetail(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to fetch lowongan detail');
  const data = await response.json();
  
  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
    closedAt: data.data.closedAt ? new Date(data.data.closedAt) : undefined,
    pekerjaList: data.data.pekerjaList?.map(p => ({
      ...p,
      joinedAt: new Date(p.joinedAt),
    })) || [],
  };
}

/**
 * GET /api/umkm/lowongan/stats
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/umkm/lowongan/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

/**
 * POST /api/umkm/lowongan/:id/close
 * Close a lowongan
 */
export async function closeLowongan(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to close lowongan');
  const data = await response.json();
  
  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
    closedAt: new Date(data.data.closedAt),
  };
}

/**
 * POST /api/umkm/lowongan/:id/duplicate
 * Duplicate a lowongan
 */
export async function duplicateLowongan(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to duplicate lowongan');
  const data = await response.json();
  
  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
  };
}

/**
 * POST /api/umkm/lowongan/:id/view
 * Track lowongan view (call when user views the listing)
 */
export async function trackLowonganView(lowonganId: string, isInternal: boolean = false): Promise<void> {
  await fetch(`/api/umkm/lowongan/${lowonganId}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isInternal }),
  });
}
```

---

### **Step 1.3: Utility Functions**

**File**: `lib/utils/lowongan.ts`

```typescript
import { Lowongan } from '@/types/lowongan';

/**
 * Get relative time (e.g., "2 hari lalu")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  if (diffInWeeks === 1) return '1 minggu lalu';
  if (diffInWeeks < 4) return `${diffInWeeks} minggu lalu`;
  if (diffInMonths === 1) return '1 bulan lalu';
  if (diffInMonths < 12) return `${diffInMonths} bulan lalu`;
  
  return `${Math.floor(diffInMonths / 12)} tahun lalu`;
}

/**
 * Format date untuk display
 */
export function formatDate(date: Date, format: 'full' | 'short' = 'full'): string {
  const d = new Date(date);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (format === 'short') {
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string) {
  switch (status) {
    case 'Aktif':
      return { bg: '#E1F5EE', text: '#0F6E56' };
    case 'Draft':
      return { bg: '#FAEEDA', text: '#854F0B' };
    case 'Ditutup':
      return { bg: '#F5F5F5', text: '#666' };
    default:
      return { bg: '#F5F5F5', text: '#666' };
  }
}

/**
 * Filter and sort lowongan list
 */
export function filterAndSort(
  lowongan: Lowongan[],
  statusFilter: string,
  sortBy: string,
  searchQuery: string
): Lowongan[] {
  let filtered = lowongan;

  // Filter by status
  if (statusFilter !== 'Semua Status') {
    filtered = filtered.filter(l => l.status === statusFilter);
  }

  // Filter by search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.jobCode.includes(query) ||
      l.location.toLowerCase().includes(query)
    );
  }

  // Sort
  switch (sortBy) {
    case 'Terbaru Ditambahkan':
      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'Tertua':
      return filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'Paling Views':
      return filtered.sort((a, b) => b.views - a.views);
    case 'Paling Pelamar':
      return filtered.sort((a, b) => b.applicants - a.applicants);
    default:
      return filtered;
  }
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(lowongan: Lowongan[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const stats = {
    activeLowongan: lowongan.filter(l => l.status === 'Aktif').length,
    totalApplicants: lowongan.reduce((sum, l) => sum + l.applicants, 0),
    totalViews: lowongan.reduce((sum, l) => sum + l.views, 0),
    withPekerja: lowongan.filter(l => l.hired > 0).length,
  };

  return stats;
}

/**
 * Get hiring progress percentage
 */
export function getHiringProgress(hired: number, positions: number): number {
  if (positions === 0) return 0;
  return Math.round((hired / positions) * 100);
}
```

---

## <a name="phase-2"></a>Phase 2: Create New Components (2-3 days)

### **Step 2.1: LowonganCard Component**

**File**: `app/umkm/components/LowonganCard.tsx`

```typescript
'use client';

import { Lowongan } from '@/types/lowongan';
import { getRelativeTime, getStatusColor } from '@/lib/utils/lowongan';

interface LowonganCardProps {
  lowongan: Lowongan;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default function LowonganCard({ lowongan, isSelected, onClick }: LowonganCardProps) {
  const statusColor = getStatusColor(lowongan.status);

  return (
    <div
      onClick={() => onClick(lowongan.id)}
      style={{
        padding: '1rem',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        cursor: 'pointer',
        background: isSelected ? 'var(--color-background-info)' : 'var(--color-background-primary)',
        borderLeft: isSelected ? '3px solid var(--color-background-info)' : 'none',
        transition: 'background 0.2s',
      }}
      onMouseOver={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-background-secondary)';
        }
      }}
      onMouseOut={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-background-primary)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>
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
          }}
        >
          {lowongan.status}
        </span>
      </div>

      <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        {lowongan.jobCode} • {lowongan.location}
      </p>

      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
        <span>
          <i className="ti ti-users" style={{ fontSize: '13px', marginRight: '4px', verticalAlign: '-1px' }} aria-hidden="true" />
          {lowongan.applicants} pelamar
        </span>
        <span>
          <i className="ti ti-eye" style={{ fontSize: '13px', marginRight: '4px', verticalAlign: '-1px' }} aria-hidden="true" />
          {lowongan.views} views
        </span>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        <i className="ti ti-calendar" style={{ fontSize: '13px', marginRight: '4px', verticalAlign: '-1px' }} aria-hidden="true" />
        Ditambahkan {getRelativeTime(lowongan.createdAt)}
      </div>
    </div>
  );
}
```

---

### **Step 2.2: LowonganList Component**

**File**: `app/umkm/components/LowonganList.tsx`

```typescript
'use client';

import { Lowongan } from '@/types/lowongan';
import LowonganCard from './LowonganCard';

interface LowonganListProps {
  lowonganList: Lowongan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export default function LowonganList({ lowonganList, selectedId, onSelect, isLoading }: LowonganListProps) {
  if (isLoading) {
    return (
      <div
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Loading...
          </p>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading lowongan...
        </div>
      </div>
    );
  }

  if (lowonganList.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            0 lowongan
          </p>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Belum ada lowongan. <br /> <a href="/umkm/create" style={{ color: 'var(--color-background-info)', textDecoration: 'none' }}>Buat lowongan baru</a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {lowonganList.length} lowongan
        </p>
      </div>

      {lowonganList.map((lowongan) => (
        <LowonganCard
          key={lowongan.id}
          lowongan={lowongan}
          isSelected={selectedId === lowongan.id}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
```

---

### **Step 2.3: LowonganPreviewPanel Component**

**File**: `app/umkm/components/LowonganPreviewPanel.tsx`

```typescript
'use client';

import { Lowongan } from '@/types/lowongan';
import { formatDate, getRelativeTime, getStatusColor, getHiringProgress } from '@/lib/utils/lowongan';
import { useState } from 'react';

interface LowonganPreviewPanelProps {
  lowongan: Lowongan;
  onEdit: (id: string) => void;
  onClose: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function LowonganPreviewPanel({ lowongan, onEdit, onClose, onDuplicate }: LowonganPreviewPanelProps) {
  const [isClosing, setIsClosing] = useState(false);
  const statusColor = getStatusColor(lowongan.status);
  const hiringProgress = getHiringProgress(lowongan.hired, lowongan.positions);

  const handleClose = async () => {
    if (confirm('Apakah Anda yakin ingin menutup lowongan ini?')) {
      setIsClosing(true);
      try {
        await onClose(lowongan.id);
      } finally {
        setIsClosing(false);
      }
    }
  };

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '1.5rem',
        overflow: 'auto',
        maxHeight: '600px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {lowongan.jobCode}
            </p>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 500 }}>
              {lowongan.title}
            </h2>
          </div>
          <span
            style={{
              background: statusColor.bg,
              color: statusColor.text,
              padding: '6px 12px',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {lowongan.status}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {lowongan.location} • {lowongan.type} • Rp {lowongan.salary}
        </p>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 500 }}>Timeline</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <i className="ti ti-calendar-plus" style={{ fontSize: '16px' }} aria-hidden="true" />
          <span>Dibuat:</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {formatDate(lowongan.createdAt)} • {getRelativeTime(lowongan.createdAt)}
          </span>
        </div>
      </div>

      {/* Statistik Views */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 500 }}>Statistik Views</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'var(--color-background-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Views</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>{lowongan.views}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>All time</p>
          </div>
          <div style={{ background: 'var(--color-background-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Views Minggu Ini</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>{lowongan.viewsThisWeek}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>7 hari terakhir</p>
          </div>
        </div>
      </div>

      {/* Pelamar & Hired */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 500 }}>Pelamar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--color-background-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Pelamar</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>{lowongan.applicants}</p>
          </div>
          <div style={{ background: 'var(--color-background-info)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Terisi</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 500, color: 'var(--color-text-info)' }}>
              {lowongan.hired}/{lowongan.positions}
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <i className="ti ti-info-circle" style={{ fontSize: '14px', marginRight: '6px', verticalAlign: '-1px' }} aria-hidden="true" />
          {lowongan.hired}/{lowongan.positions} posisi terisi
        </p>
      </div>

      {/* Pekerja Terisi */}
      {lowongan.pekerjaList && lowongan.pekerjaList.length > 0 && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 500 }}>Pekerja Terisi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lowongan.pekerjaList.map((pekerja) => (
              <div key={pekerja.id} style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#B5D4F4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 500,
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {pekerja.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{pekerja.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Bergabung {getRelativeTime(pekerja.joinedAt)}
                    </p>
                  </div>
                  <span style={{ background: '#E1F5EE', color: '#0F6E56', padding: '4px 8px', borderRadius: 'var(--border-radius-md)', fontSize: '11px', fontWeight: 500 }}>
                    {pekerja.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
        >
          <i className="ti ti-eye" style={{ fontSize: '16px', marginRight: '6px', verticalAlign: '-2px' }} aria-hidden="true" />
          Lihat Semua Pelamar
        </button>
        <button
          onClick={() => onEdit(lowongan.id)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
        >
          <i className="ti ti-edit" style={{ fontSize: '16px', marginRight: '6px', verticalAlign: '-2px' }} aria-hidden="true" />
          Edit Lowongan
        </button>
        <button
          onClick={() => onDuplicate(lowongan.id)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
        >
          <i className="ti ti-copy" style={{ fontSize: '16px', marginRight: '6px', verticalAlign: '-2px' }} aria-hidden="true" />
          Duplikasi Lowongan
        </button>
        <button
          onClick={handleClose}
          disabled={isClosing}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: '0.5px solid var(--color-border-danger)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isClosing ? 'not-allowed' : 'pointer',
            color: 'var(--color-text-danger)',
            opacity: isClosing ? 0.6 : 1,
          }}
        >
          <i className="ti ti-x" style={{ fontSize: '16px', marginRight: '6px', verticalAlign: '-2px' }} aria-hidden="true" />
          {isClosing ? 'Menutup...' : 'Tutup Lowongan'}
        </button>
      </div>
    </div>
  );
}
```

---

### **Step 2.4: FilterSort & Statistics Components** (Sisa komponen)

Buat 3 file ini dengan struktur serupa:

- **File**: `app/umkm/components/FilterSort.tsx` 
- **File**: `app/umkm/components/StatisticsCard.tsx`
- **File**: `app/umkm/components/TimestampDisplay.tsx`

(Code terlalu panjang untuk ditampilkan di sini, tapi structure-nya mirip dengan components di atas)

---

## <a name="phase-3"></a>Phase 3: Main Dashboard Page (1-2 days)

### **Step 3.1: Refactor Main Page**

**File**: `app/umkm/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Lowongan, FilterSortState } from '@/types/lowongan';
import { fetchLowonganList, fetchDashboardStats, closeLowongan, duplicateLowongan } from '@/lib/api/lowongan';
import { calculateStats, filterAndSort } from '@/lib/utils/lowongan';

import LowonganList from './components/LowonganList';
import LowonganPreviewPanel from './components/LowonganPreviewPanel';
import FilterSort from './components/FilterSort';
import StatisticsCard from './components/StatisticsCard';

export default function UMKMDashboard() {
  // State
  const [lowonganList, setLowonganList] = useState<Lowongan[]>([]);
  const [selectedLowonganId, setSelectedLowonganId] = useState<string | null>(null);
  const [filterSort, setFilterSort] = useState<FilterSortState>({
    statusFilter: 'Semua Status',
    sortBy: 'Terbaru Ditambahkan',
    searchQuery: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const selectedLowongan = lowonganList.find(l => l.id === selectedLowonganId);
  const filteredLowongan = filterAndSort(
    lowonganList,
    filterSort.statusFilter,
    filterSort.sortBy,
    filterSort.searchQuery
  );
  const stats = calculateStats(lowonganList);

  // Fetch data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchLowonganList();
        setLowonganList(data);
        if (data.length > 0) {
          setSelectedLowonganId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lowongan');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handlers
  const handleSelectLowongan = (id: string) => {
    setSelectedLowonganId(id);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterSort(prev => ({ ...prev, statusFilter: newFilter }));
  };

  const handleSortChange = (newSort: string) => {
    setFilterSort(prev => ({ ...prev, sortBy: newSort }));
  };

  const handleSearchChange = (query: string) => {
    setFilterSort(prev => ({ ...prev, searchQuery: query }));
  };

  const handleEditLowongan = (id: string) => {
    // Navigate to edit page
    window.location.href = `/umkm/${id}/edit`;
  };

  const handleCloseLowongan = async (id: string) => {
    try {
      const updatedLowongan = await closeLowongan(id);
      setLowonganList(prev => prev.map(l => l.id === id ? updatedLowongan : l));
    } catch (err) {
      alert('Gagal menutup lowongan');
    }
  };

  const handleDuplicateLowongan = async (id: string) => {
    try {
      const newLowongan = await duplicateLowongan(id);
      setLowonganList(prev => [...prev, newLowongan]);
      setSelectedLowonganId(newLowongan.id);
    } catch (err) {
      alert('Gagal menduplikasi lowongan');
    }
  };

  // Render
  return (
    <div style={{ background: 'var(--color-background-tertiary)', padding: '1.5rem', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              DASHBOARD UMKM
            </p>
            <h1 style={{ margin: '0.5rem 0 0', fontSize: '28px' }}>Kelola Lowongan</h1>
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="ti ti-plus" style={{ fontSize: '16px' }} aria-hidden="true" />
            Buat Lowongan
          </a>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Pantau performa lowongan dan data pelamar Anda
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ padding: '12px', marginBottom: '1rem', background: '#FCEBEB', color: '#A32D2D', borderRadius: 'var(--border-radius-md)' }}>
          {error}
        </div>
      )}

      {/* Statistics */}
      <StatisticsCard stats={stats} />

      {/* Filters */}
      <FilterSort
        statusFilter={filterSort.statusFilter}
        sortBy={filterSort.sortBy}
        searchQuery={filterSort.searchQuery}
        onStatusChange={handleFilterChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
      />

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
        <LowonganList
          lowonganList={filteredLowongan}
          selectedId={selectedLowonganId}
          onSelect={handleSelectLowongan}
          isLoading={isLoading}
        />
        {selectedLowongan && (
          <LowonganPreviewPanel
            lowongan={selectedLowongan}
            onEdit={handleEditLowongan}
            onClose={handleCloseLowongan}
            onDuplicate={handleDuplicateLowongan}
          />
        )}
      </div>
    </div>
  );
}
```

---

## <a name="phase-4"></a>Phase 4: Create Page Migration (1 day)

### **Step 4.1: Create Page Structure**

**File**: `app/umkm/create/page.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import LowonganForm from './components/LowonganForm';

export default function CreateLowonganPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/umkm/lowongan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create lowongan');

      const data = await response.json();
      router.push(`/umkm?selected=${data.data.id}`);
    } catch (error) {
      alert('Gagal membuat lowongan');
    }
  };

  return (
    <div style={{ background: 'var(--color-background-tertiary)', padding: '2rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <a
          href="/umkm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-background-info)',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontSize: '14px',
          }}
        >
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Kembali ke Dashboard
        </a>

        <div style={{ background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', padding: '2rem' }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>Buat Lowongan Baru</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Isi informasi lengkap tentang lowongan yang ingin Anda buat
          </p>

          <LowonganForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
```

---

## <a name="phase-5"></a>Phase 5: Styling & Polish (1-2 days)

- [ ] Add CSS modules untuk component-specific styling
- [ ] Implement responsive breakpoints
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Test dark mode
- [ ] Add animations & transitions

---

## <a name="timeline"></a>Timeline & Milestones

### **Week 1: Foundation**
- **Day 1-2**: Phase 1 (Data Modeling + API Setup)
- **Day 3-4**: Phase 2 (Components Creation)
- **Day 5**: Phase 3 (Main Dashboard Page)

### **Week 2: Refinement**
- **Day 1**: Phase 4 (Create Page Migration)
- **Day 2-3**: Phase 5 (Styling & Polish)
- **Day 4-5**: Testing & Bug Fixes

---

**Total Estimated Time**: 7-10 working days

---

Siap lanjut ke phase mana? 🚀
