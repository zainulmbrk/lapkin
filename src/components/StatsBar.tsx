"use client";

import React from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface StatsBarProps {
  totalMinutes: number;
  filteredActivities: any[];
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalMinutes,
  filteredActivities,
}) => {
  const formatTotalTime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes} Menit`;
    return `${hours} Jam ${minutes > 0 ? `${minutes} Mnt` : ""}`;
  };

  const completedCount = filteredActivities.filter(
    (a) => a.status === "Selesai" && a.category !== "Istirahat",
  ).length;

  const totalNonBreak = filteredActivities.filter(
    (a) => a.category !== "Istirahat",
  ).length;

  const pendingCount = filteredActivities.filter(
    (a) => a.status !== "Selesai" && a.category !== "Istirahat",
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Total Durasi Kerja
          </p>
          <p className="text-xl font-bold text-slate-800">
            {formatTotalTime(totalMinutes)}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Kegiatan Selesai
          </p>
          <p className="text-xl font-bold text-slate-800">
            {completedCount} / {totalNonBreak}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Proses / Tertunda
          </p>
          <p className="text-xl font-bold text-slate-800">
            {pendingCount} Kegiatan
          </p>
        </div>
      </div>
    </div>
  );
};
