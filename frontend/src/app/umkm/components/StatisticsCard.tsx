"use client";

import { DashboardStats } from "@/types/lowongan";

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
