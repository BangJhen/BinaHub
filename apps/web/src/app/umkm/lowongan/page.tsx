"use client";

import { useState, useEffect, useMemo } from "react";
import { Lowongan, FilterSortState, LowonganStatus } from "@/features/lowongan/types";
import {
  fetchLowonganList,
  closeLowongan,
  duplicateLowongan,
  deleteLowongan
} from "@/features/lowongan/api";
import { calculateStats, filterAndSort } from "@/features/lowongan/format";

import LowonganList from "@/features/umkm/components/LowonganList";
import LowonganPreviewPanel from "@/features/umkm/components/LowonganPreviewPanel";
import FilterSort from "@/features/umkm/components/FilterSort";
import StatisticsCard from "@/features/umkm/components/StatisticsCard";

import styles from "@/features/umkm/components/lowongan.module.css";

export default function UMKMLowonganDashboard() {
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

  const filteredLowongan = useMemo(
    () => filterAndSort(lowonganList, filterSort.statusFilter, filterSort.sortBy, filterSort.searchQuery),
    [lowonganList, filterSort]
  );

  const selectedLowongan = useMemo(
    () => lowonganList.find((l) => l.id === selectedLowonganId) || null,
    [lowonganList, selectedLowonganId]
  );

  const stats = useMemo(() => calculateStats(lowonganList), [lowonganList]);

  // Initial load + read selected from query params
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchLowonganList();
        if (!isMounted) return;
        setLowonganList(data);

        const params = new URLSearchParams(window.location.search);
        const preselected = params.get("selected");
        if (preselected && data.some((l) => l.id === preselected)) {
          setSelectedLowonganId(preselected);
        } else if (data.length > 0) {
          setSelectedLowonganId(data[0].id);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data lowongan");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-select first filtered if current selection no longer in filter
  useEffect(() => {
    if (filteredLowongan.length === 0) return;
    if (!filteredLowongan.some((l) => l.id === selectedLowonganId)) {
      setSelectedLowonganId(filteredLowongan[0].id);
    }
  }, [filteredLowongan, selectedLowonganId]);

  const handleSelectLowongan = (id: string) => setSelectedLowonganId(id);
  const handleFilterChange = (newFilter: string) =>
    setFilterSort((prev) => ({ ...prev, statusFilter: newFilter as any }));
  const handleSortChange = (newSort: string) =>
    setFilterSort((prev) => ({ ...prev, sortBy: newSort as any }));
  const handleSearchChange = (query: string) =>
    setFilterSort((prev) => ({ ...prev, searchQuery: query }));

  const handleEditLowongan = (id: string) => {
    window.location.href = `/umkm/lowongan/${id}/edit`;
  };

  const handleCloseLowongan = async (id: string) => {
    try {
      const updatedLowongan = await closeLowongan(id);
      setLowonganList((prev) => prev.map((l) => (l.id === id ? updatedLowongan : l)));
    } catch (err) {
      alert("Gagal mengubah status lowongan");
    }
  };

  const handleDuplicateLowongan = async (id: string) => {
    try {
      const newLowongan = await duplicateLowongan(id);
      setLowonganList((prev) => [newLowongan, ...prev]);
      setSelectedLowonganId(newLowongan.id);
    } catch (err) {
      alert("Gagal menduplikasi lowongan");
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredLowongan.map((l) => l.id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedIds.length} lowongan? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    try {
      await deleteLowongan(selectedIds);
      setLowonganList((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      if (selectedLowonganId && selectedIds.includes(selectedLowonganId)) {
        setSelectedLowonganId(null);
      }
      setSelectedIds([]);
    } catch (err) {
      alert("Gagal menghapus lowongan");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Dashboard UMKM</p>
          <h1>Kelola Lowongan</h1>
          <p className={styles.subtext}>
            Pantau performa lowongan, kelola pelamar, dan terhubung dengan pekerja yang siap bergabung.
            Buat lowongan baru atau optimalkan yang sudah ada.
          </p>
        </div>
        <a href="/umkm/lowongan/create" className={styles.createButton}>
          <i className="ti ti-plus" aria-hidden />
          Buat Lowongan
        </a>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            color: "#b91c1c",
            marginBottom: 16,
            fontSize: 13
          }}
        >
          <i className="ti ti-alert-circle" aria-hidden style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* KPI */}
      <StatisticsCard stats={stats as any} isLoading={isLoading} />

      {/* Filters */}
      <FilterSort
        statusFilter={filterSort.statusFilter}
        sortBy={filterSort.sortBy}
        searchQuery={filterSort.searchQuery}
        selectedCount={selectedIds.length}
        onStatusChange={handleFilterChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        onBulkDelete={handleBulkDelete}
      />

      {/* Main grid */}
      <div className={`${styles.mainGrid} ${!selectedLowongan && !isLoading && filteredLowongan.length === 0 ? styles.gridSingle : ""}`}>
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
