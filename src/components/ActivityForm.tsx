"use client";

import React from "react";
import { Plus, Edit3 } from "lucide-react";

interface FormData {
  startTime: string;
  endTime: string;
  task: string;
  output: string;
  status: string;
  category: string;
}

interface ActivityFormProps {
  formData: FormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  editingId: string | number | null;
  cancelEdit: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  editingId,
  cancelEdit,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        {editingId ? (
          <Edit3 className="w-5 h-5 text-amber-500" />
        ) : (
          <Plus className="w-5 h-5 text-blue-600" />
        )}
        {editingId ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Jam Mulai
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Jam Selesai
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Kategori
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Rutin">Rutin</option>
            <option value="Utama">Utama</option>
            <option value="Rapat">Rapat</option>
            <option value="Tambahan">Tambahan</option>
            <option value="Istirahat">☕ Istirahat</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Deskripsi Kegiatan
          </label>
          <textarea
            name="task"
            rows={3}
            placeholder={
              formData.category === "Istirahat"
                ? "Contoh: Istirahat Makan Siang & Sholat"
                : "Contoh: Memperbaiki bug halaman checkout"
            }
            value={formData.task}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none "
          />
        </div>

        {formData.category !== "Istirahat" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Output / Hasil
              </label>
              <textarea
                name="output"
                rows={2}
                placeholder="Contoh: Bug resolved & deployed to staging"
                value={formData.output}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Selesai">Selesai</option>
                <option value="Proses">Dalam Proses</option>
                <option value="Pending">Tertunda</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {editingId ? (
              <Edit3 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {editingId ? "Simpan Perubahan" : "Tambah Kegiatan"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
