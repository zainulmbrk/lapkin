"use client";

import React from "react";
import { Search, Filter } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center text-black">
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari kegiatan/output..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">Semua Kategori</option>
          <option value="Rutin">Rutin</option>
          <option value="Utama">Utama</option>
          <option value="Rapat">Rapat</option>
          <option value="Tambahan">Tambahan</option>
          <option value="Istirahat">Istirahat</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">Semua Status</option>
          <option value="Selesai">Selesai</option>
          <option value="Proses">Dalam Proses</option>
          <option value="Pending">Tertunda</option>
        </select>
      </div>
    </div>
  );
};
