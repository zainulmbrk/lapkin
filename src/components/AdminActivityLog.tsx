"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { Activity, Search, Filter, RefreshCw, Calendar } from "lucide-react";

export const AdminActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          id,
          activity_type,
          description,
          created_at,
          profiles:user_id (
            name,
            nip,
            role
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(100); // Ambil 100 log terbaru

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error("Gagal memuat log aktivitas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Opsional: Realtime subscription agar log langsung muncul tanpa refresh
    const channel = supabase
      .channel("realtime-activity-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        () => {
          fetchLogs();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter & Search Log
  const filteredLogs = logs.filter((log) => {
    const userName = log.profiles?.name || "Sistem / Pengguna";
    const description = log.description || "";
    const type = log.activity_type || "";

    const matchSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    if (typeFilter === "all") return matchSearch;
    return matchSearch && type === typeFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Log Aktivitas Sistem (Audit Trail)
            </h2>
            <p className="text-xs text-slate-500">
              Mencatat seluruh rekam jejak aktivitas dan aksi yang dilakukan
              pengguna.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* Toolbar Pencarian & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="relative text-black">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama user atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700"
          >
            <option value="all">Semua Jenis Aktivitas</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CLOCK_IN">CLOCK_IN</option>
            <option value="CLOCK_OUT">CLOCK_OUT</option>
            <option value="MANAGE_USER">MANAGE_USER</option>
            <option value="KOREKSI_ABSEN">KOREKSI_ABSEN</option>
          </select>
        </div>
      </div>

      {/* Tabel Log */}
      <div className="p-4 overflow-x-auto">
        {loading && logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Memuat riwayat log aktivitas...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Belum ada catatan aktivitas yang sesuai.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Aktivitas</th>
                <th className="p-3">Deskripsi / Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.created_at);
                const formattedDate = isNaN(dateObj.getTime())
                  ? log.created_at
                  : dateObj.toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {log.profiles?.name || "Sistem / Tamu"}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {log.profiles?.nip || "-"} •{" "}
                        <span className="capitalize">
                          {log.profiles?.role || "user"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded text-[10px]">
                        {log.activity_type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {log.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
