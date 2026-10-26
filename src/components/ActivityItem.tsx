"use client";

import React from "react";
import { Coffee, Edit3, Trash2 } from "lucide-react";

interface ActivityItemProps {
  act: any;
  handleEdit: (act: any) => void;
  handleDelete: (id: any) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  act,
  handleEdit,
  handleDelete,
}) => {
  const isBreak = act.category === "Istirahat";

  return (
    <div
      className={`p-5 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
        isBreak ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-slate-50/60"
      }`}
    >
      <div className="flex items-start gap-4 flex-1">
        <div
          className={`flex flex-col items-center px-3 py-2 rounded-xl border min-w-[100px] ${
            isBreak
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-blue-50 text-blue-700 border-blue-100"
          }`}
        >
          <span className="text-xs font-bold tracking-wide">
            {act.startTime} - {act.endTime}
          </span>
          <span className="text-[10px] uppercase font-semibold mt-1 flex items-center gap-1">
            {isBreak && <Coffee className="w-3 h-3" />}
            {act.category}
          </span>
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-base leading-snug">
              {act.task}
            </h3>
            {!isBreak && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  act.status === "Selesai"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : act.status === "Proses"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {act.status}
              </span>
            )}
          </div>

          {!isBreak && act.output && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
              <span className="font-semibold text-slate-600">Output:</span>
              <span>{act.output}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-start">
        <button
          onClick={() => handleEdit(act)}
          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(act.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Hapus"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
