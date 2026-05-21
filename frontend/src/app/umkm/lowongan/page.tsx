"use client";

import { useState, useEffect } from "react";
import { Lowongan, FilterSortState } from "@/types/lowongan";
import { fetchLowonganList, fetchDashboardStats, closeLowongan, duplicateLowongan, deleteLowongan } from "@/lib/api/lowongan";
import { calculateStats, filterAndSort } from "@/lib/utils/lowongan";

import LowonganList from "../components/LowonganList";
import LowonganPreviewPanel from "../components/LowonganPreviewPanel";
import FilterSort from "../components/FilterSort";
import StatisticsCard from "../components/StatisticsCard";

import styles from "../components/lowongan.module.css";

export default function UMKMDashboard() {
  // State
  const [lowonganList, setLowonganList] = useState<Lowongan[]>([]);
  const [selectedLowonganId, setSelectedLowonganId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterSort, setFilterSort] = useState<FilterSortState>({
    statusFilter: "Semua Status",
    sortBy: "Terbaru Ditambahkan",
    searchQuery: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const selectedLowongan = lowonganList.find((l) => l.id === selectedLowonganId);
  const filteredLowongan = filterAndSort(lowonganList, filterSort.statusFilter, filterSort.sortBy, filterSort.searchQuery);
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
        setError(err instanceof Error ? err.message : "Failed to load lowongan");
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
    setFilterSort((prev) => ({ ...prev, statusFilter: newFilter as any }));
  };

  const handleSortChange = (newSort: string) => {
    setFilterSort((prev) => ({ ...prev, sortBy: newSort as any }));
  };

  const handleSearchChange = (query: string) => {
    setFilterSort((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleEditLowongan = (id: string) => {
    // Navigate to edit page
    window.location.href = `/umkm/lowongan/${id}/edit`;
  };

  const handleCloseLowongan = async (id: string) => {
    try {
      const updatedLowongan = await closeLowongan(id);
      setLowonganList((prev) => prev.map((l) => (l.id === id ? updatedLowongan : l)));
    } catch (err) {
      alert("Gagal menutup lowongan");
    }
  };

  const handleDuplicateLowongan = async (id: string) => {
    try {
      const newLowongan = await duplicateLowongan(id);
      setLowonganList((prev) => [...prev, newLowongan]);
      setSelectedLowonganId(newLowongan.id);
    } catch (err) {
      alert("Gagal menduplikasi lowongan");
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => 
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredLowongan.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} lowongan?`)) {
      try {
        await deleteLowongan(selectedIds);
        setLowonganList((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
        setSelectedIds([]);
        if (selectedLowonganId && selectedIds.includes(selectedLowonganId)) {
          setSelectedLowonganId(null);
        }
      } catch (err) {
        alert("Gagal menghapus lowongan");
      }
    }
  };

  // Render
  return (
    <div className={styles.container}>
      {/* Header */}
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
            href="/umkm/lowongan/create"
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
            <i className="ti ti-plus" style={{ fontSize: "16px" }} aria-hidden="true" />
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

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "1rem",
            background: "#FCEBEB",
            color: "#A32D2D",
            borderRadius: "var(--border-radius-md)"
          }}
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <StatisticsCard stats={stats as any} />

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <FilterSort
          statusFilter={filterSort.statusFilter}
          sortBy={filterSort.sortBy}
          searchQuery={filterSort.searchQuery}
          onStatusChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
        />
        
        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 16px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-md)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {selectedIds.length} lowongan terpilih
            </span>
            <button
              onClick={handleBulkDelete}
              style={{
                padding: '6px 12px',
                background: 'var(--color-text-danger)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="ti ti-trash" style={{ fontSize: '14px' }} />
              Hapus Terpilih
            </button>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className={styles.mainGrid}>
        <LowonganList
          lowonganList={filteredLowongan}
          selectedId={selectedLowonganId}
          selectedIds={selectedIds}
          onSelect={handleSelectLowongan}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
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
