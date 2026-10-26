"use client";

import React from "react";
import { Loader2, Clock } from "lucide-react";
import { ActivityItem } from "./ActivityItem";

interface ActivityListProps {
  loading: boolean;
  filteredActivities: any[];
  handleEdit: (act: any) => void;
  handleDelete: (id: any) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  loading,
  filteredActivities,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Memuat data dari database...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">
            Belum ada aktivitas tercatat untuk tanggal ini.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredActivities.map((act) => (
            <ActivityItem
              key={act.id}
              act={act}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
