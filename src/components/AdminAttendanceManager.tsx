// "use client";

// import React, { useState, useEffect } from "react";
// import { supabase } from "@/src/lib/supabase";
// import { Search, Edit3, X, Users, Calendar } from "lucide-react";

// interface AdminAttendanceManagerProps {
//   selectedDate: string;
// }

// export const AdminAttendanceManager: React.FC<AdminAttendanceManagerProps> = ({
//   selectedDate: initialSelectedDate,
// }) => {
//   const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate);
//   const [attendances, setAttendances] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [searchQuery, setSearchQuery] = useState<string>("");

//   // State untuk Modal Edit/Tambah Absen Pegawai
//   const [editingRecord, setEditingRecord] = useState<any | null>(null);
//   const [editClockIn, setEditClockIn] = useState<string>("");
//   const [editClockOut, setEditClockOut] = useState<string>("");
//   const [editStatus, setEditStatus] = useState<string>("Hadir");
//   const [saving, setSaving] = useState<boolean>(false);

//   const fetchAllAttendances = async () => {
//     setLoading(true);
//     try {
//       const { data: profilesData, error: profilesError } = await supabase
//         .from("profiles")
//         .select("*");

//       if (profilesError) throw profilesError;

//       const { data: attendanceData, error: attendanceError } = await supabase
//         .from("attendances")
//         .select("*");

//       if (attendanceError) throw attendanceError;

//       const combined = (profilesData || []).map((profile) => {
//         const existingAtt = (attendanceData || []).find(
//           (att) =>
//             att.user_id === profile.id &&
//             att.date &&
//             att.date.startsWith(selectedDate),
//         );

//         return {
//           id: existingAtt ? existingAtt.id : null,
//           user_id: profile.id,
//           date: selectedDate,
//           clock_in: existingAtt ? existingAtt.clock_in : null,
//           clock_out: existingAtt ? existingAtt.clock_out : null,
//           status: existingAtt ? existingAtt.status : "Belum Absen",
//           work_type: existingAtt ? existingAtt.work_type : "-",
//           profiles: {
//             full_name: profile.full_name || profile.name || "Pegawai",
//             nip: profile.nip || "-",
//             role: profile.role || "user",
//           },
//         };
//       });

//       setAttendances(combined);
//     } catch (err: any) {
//       console.error("Gagal memuat rekap absensi:", err.message);
//       setAttendances([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllAttendances();
//   }, [selectedDate]);

//   const handleSaveEdit = async () => {
//     if (!editingRecord) return;

//     setSaving(true);
//     try {
//       // Jika status Sakit atau Izin, jam masuk dan pulang wajib null
//       const isNonHadir =
//         editStatus === "Sakit" ||
//         editStatus === "Izin" ||
//         editStatus === "Alpha";

//       const formattedClockIn = isNonHadir
//         ? null
//         : editClockIn
//           ? editClockIn.length === 5
//             ? `${editClockIn}:00`
//             : editClockIn
//           : null;

//       const formattedClockOut = isNonHadir
//         ? null
//         : editClockOut
//           ? editClockOut.length === 5
//             ? `${editClockOut}:00`
//             : editClockOut
//           : null;

//       if (editingRecord.id) {
//         const { error } = await supabase
//           .from("attendances")
//           .update({
//             clock_in: formattedClockIn,
//             clock_out: formattedClockOut,
//             status: editStatus,
//             work_type: isNonHadir ? "-" : editingRecord.work_type,
//           })
//           .eq("id", editingRecord.id);

//         if (error) throw error;
//       } else {
//         const { error } = await supabase.from("attendances").insert([
//           {
//             user_id: editingRecord.user_id,
//             date: selectedDate,
//             clock_in: formattedClockIn,
//             clock_out: formattedClockOut,
//             status: editStatus,
//             work_type: isNonHadir ? "-" : "WFO",
//           },
//         ]);

//         if (error) throw error;
//       }

//       alert("Berhasil memperbarui data absensi pegawai!");
//       setEditingRecord(null);
//       fetchAllAttendances();
//     } catch (err: any) {
//       alert("Gagal mengupdate absensi: " + err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const filteredAttendances = attendances.filter((item) => {
//     const name = item.profiles?.full_name || "";
//     return name.toLowerCase().includes(searchQuery.toLowerCase());
//   });

//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
//       <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
//             <Users className="w-6 h-6" />
//           </div>
//           <div>
//             <h2 className="text-base font-bold text-slate-800">
//               Rekapitulasi & Koreksi Absensi Pegawai
//             </h2>
//             <p className="text-xs text-slate-500">
//               Menampilkan seluruh pegawai beserta pengelolaan koreksi absensi.
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <Calendar className="w-4 h-4 text-slate-400" />
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="text-xs border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
//           />
//         </div>
//       </div>

//       <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//           <input
//             type="text"
//             placeholder="Cari nama pegawai..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>
//       </div>

//       <div className="p-4 overflow-x-auto">
//         {loading ? (
//           <div className="text-center py-10 text-xs text-slate-400">
//             Memuat data seluruh pegawai...
//           </div>
//         ) : filteredAttendances.length === 0 ? (
//           <div className="text-center py-12 text-slate-400 text-xs">
//             Belum ada data pegawai yang terdaftar di sistem.
//           </div>
//         ) : (
//           <table className="w-full text-left border-collapse text-xs">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
//                 <th className="p-3">Nama Pegawai / NIP</th>
//                 <th className="p-3">Tipe Kerja</th>
//                 <th className="p-3">Jam Masuk</th>
//                 <th className="p-3">Jam Pulang</th>
//                 <th className="p-3">Status</th>
//                 <th className="p-3 text-center">Aksi / Koreksi</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredAttendances.map((item, index) => (
//                 <tr
//                   key={item.user_id || index}
//                   className="hover:bg-slate-50/80"
//                 >
//                   <td className="p-3 font-semibold text-slate-800">
//                     {item.profiles?.full_name || "Pegawai"}
//                     <div className="text-[10px] text-slate-400 font-normal">
//                       {item.profiles?.nip || "-"}
//                     </div>
//                   </td>
//                   <td className="p-3">
//                     <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
//                       {item.work_type}
//                     </span>
//                   </td>
//                   <td className="p-3 font-mono font-medium text-blue-600">
//                     {item.status === "Hadir" && item.clock_in
//                       ? item.clock_in.substring(0, 5)
//                       : "--:--"}
//                   </td>
//                   <td className="p-3 font-mono font-medium text-emerald-600">
//                     {item.status === "Hadir" && item.clock_out
//                       ? item.clock_out.substring(0, 5)
//                       : "--:--"}
//                   </td>
//                   <td className="p-3">
//                     <span
//                       className={`px-2 py-0.5 font-medium rounded text-[10px] ${
//                         item.status === "Belum Absen"
//                           ? "bg-slate-100 text-slate-500"
//                           : item.status === "Sakit"
//                             ? "bg-amber-50 text-amber-700 font-bold"
//                             : item.status === "Izin"
//                               ? "bg-blue-50 text-blue-700 font-bold"
//                               : "bg-emerald-50 text-emerald-700"
//                       }`}
//                     >
//                       {item.status}
//                     </span>
//                   </td>
//                   <td className="p-3 text-center">
//                     <button
//                       onClick={() => {
//                         setEditingRecord(item);
//                         setEditClockIn(
//                           item.clock_in
//                             ? item.clock_in.substring(0, 5)
//                             : "08:00",
//                         );
//                         setEditClockOut(
//                           item.clock_out
//                             ? item.clock_out.substring(0, 5)
//                             : "17:00",
//                         );
//                         setEditStatus(
//                           item.status === "Belum Absen" ? "Hadir" : item.status,
//                         );
//                       }}
//                       className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-semibold transition"
//                     >
//                       <Edit3 className="w-3.5 h-3.5" />
//                       <span>{item.id ? "Edit Absen" : "Input Manual"}</span>
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {editingRecord && (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
//             <div className="flex items-center justify-between border-b pb-3">
//               <h3 className="text-xs font-bold text-slate-800">
//                 {editingRecord.id ? "Koreksi Absen" : "Input Absen Manual"}:{" "}
//                 {editingRecord.profiles?.full_name || "Pegawai"}
//               </h3>
//               <button
//                 onClick={() => setEditingRecord(null)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div>
//               <label className="text-[11px] font-semibold text-slate-600 block mb-1">
//                 Status Kehadiran:
//               </label>
//               <select
//                 value={editStatus}
//                 onChange={(e) => setEditStatus(e.target.value)}
//                 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold bg-white"
//               >
//                 <option value="Hadir">Hadir</option>
//                 <option value="Izin">Izin</option>
//                 <option value="Sakit">Sakit</option>
//                 <option value="Alpha">Alpha</option>
//               </select>
//             </div>

//             <div>
//               <label className="text-[11px] font-semibold text-slate-600 block mb-1">
//                 Jam Masuk:{" "}
//                 {editStatus !== "Hadir" && (
//                   <span className="text-slate-400 font-normal">
//                     (Tidak diperlukan untuk {editStatus})
//                   </span>
//                 )}
//               </label>
//               <input
//                 type="time"
//                 value={editClockIn}
//                 disabled={editStatus !== "Hadir"}
//                 onChange={(e) => setEditClockIn(e.target.value)}
//                 className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold ${
//                   editStatus !== "Hadir"
//                     ? "bg-slate-100 text-slate-400 cursor-not-allowed"
//                     : ""
//                 }`}
//               />
//             </div>

//             <div>
//               <label className="text-[11px] font-semibold text-slate-600 block mb-1">
//                 Jam Pulang:{" "}
//                 {editStatus !== "Hadir" && (
//                   <span className="text-slate-400 font-normal">
//                     (Tidak diperlukan untuk {editStatus})
//                   </span>
//                 )}
//               </label>
//               <input
//                 type="time"
//                 value={editClockOut}
//                 disabled={editStatus !== "Hadir"}
//                 onChange={(e) => setEditClockOut(e.target.value)}
//                 className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold ${
//                   editStatus !== "Hadir"
//                     ? "bg-slate-100 text-slate-400 cursor-not-allowed"
//                     : ""
//                 }`}
//               />
//             </div>

//             <div className="flex gap-2 pt-2">
//               <button
//                 onClick={() => setEditingRecord(null)}
//                 className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
//               >
//                 Batal
//               </button>
//               <button
//                 disabled={saving}
//                 onClick={handleSaveEdit}
//                 className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition"
//               >
//                 {saving ? "Menyimpan..." : "Simpan"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { logActivity } from "@/src/lib/logger";
import {
  Search,
  Edit3,
  X,
  Users,
  Calendar,
  Filter,
  ArrowUpDown,
} from "lucide-react";

interface AdminAttendanceManagerProps {
  selectedDate: string;
}

export const AdminAttendanceManager: React.FC<AdminAttendanceManagerProps> = ({
  selectedDate: initialSelectedDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State untuk Filter Status & Sorting
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");

  // State untuk Modal Edit/Tambah Absen Pegawai
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editClockIn, setEditClockIn] = useState<string>("");
  const [editClockOut, setEditClockOut] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("Hadir");
  const [saving, setSaving] = useState<boolean>(false);

  const fetchAllAttendances = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendances")
        .select("*");

      if (attendanceError) throw attendanceError;

      const combined = (profilesData || []).map((profile) => {
        const existingAtt = (attendanceData || []).find(
          (att) =>
            att.user_id === profile.id &&
            att.date &&
            att.date.startsWith(selectedDate),
        );

        return {
          id: existingAtt ? existingAtt.id : null,
          user_id: profile.id,
          date: selectedDate,
          clock_in: existingAtt ? existingAtt.clock_in : null,
          clock_out: existingAtt ? existingAtt.clock_out : null,
          status: existingAtt ? existingAtt.status : "Belum Absen",
          work_type: existingAtt ? existingAtt.work_type : "-",
          profiles: {
            full_name: profile.full_name || profile.name || "Pegawai",
            nip: profile.nip || "-",
            role: profile.role || "user",
          },
        };
      });

      setAttendances(combined);
    } catch (err: any) {
      console.error("Gagal memuat rekap absensi:", err.message);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendances();
  }, [selectedDate]);

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    setSaving(true);
    try {
      const isNonHadir =
        editStatus === "Sakit" ||
        editStatus === "Izin" ||
        editStatus === "Alpha";

      const formattedClockIn = isNonHadir
        ? null
        : editClockIn
          ? editClockIn.length === 5
            ? `${editClockIn}:00`
            : editClockIn
          : null;

      // Jika jam pulang kosong di input, gunakan kembali jam pulang asli dari database (editingRecord.clock_out)
      const rawClockOut = editClockOut || editingRecord.clock_out;
      const formattedClockOut = isNonHadir
        ? null
        : rawClockOut
          ? rawClockOut.length === 5
            ? `${rawClockOut}:00`
            : rawClockOut
          : null;

      const targetPegawaiName = editingRecord.profiles?.full_name || "Pegawai";
      const adminSession = localStorage.getItem("user_session");
      const adminUser = adminSession ? JSON.parse(adminSession) : null;

      const oldClockIn = editingRecord.clock_in
        ? editingRecord.clock_in.substring(0, 5)
        : "--:--";
      const oldClockOut = editingRecord.clock_out
        ? editingRecord.clock_out.substring(0, 5)
        : "--:--";
      const oldStatus = editingRecord.status || "Belum Absen";

      const newClockInDisplay = formattedClockIn
        ? formattedClockIn.substring(0, 5)
        : "--:--";
      const newClockOutDisplay = formattedClockOut
        ? formattedClockOut.substring(0, 5)
        : "--:--";

      if (editingRecord.id) {
        const { error } = await supabase
          .from("attendances")
          .update({
            clock_in: formattedClockIn,
            clock_out: formattedClockOut,
            status: editStatus,
            work_type: isNonHadir ? "-" : editingRecord.work_type,
          })
          .eq("id", editingRecord.id);

        if (error) throw error;

        await logActivity(
          adminUser?.id || editingRecord.user_id,
          "ADMIN_EDIT_ATTENDANCE",
          `Admin mengoreksi absensi ${targetPegawaiName} pada tanggal ${selectedDate} | Status: ${oldStatus} ➔ ${editStatus} | Masuk: ${oldClockIn} ➔ ${newClockInDisplay} | Pulang: ${oldClockOut} ➔ ${newClockOutDisplay}`,
        );
      } else {
        const { error } = await supabase.from("attendances").insert([
          {
            user_id: editingRecord.user_id,
            date: selectedDate,
            clock_in: formattedClockIn,
            clock_out: formattedClockOut,
            status: editStatus,
            work_type: isNonHadir ? "-" : "WFO",
          },
        ]);

        if (error) throw error;

        await logActivity(
          adminUser?.id || editingRecord.user_id,
          "ADMIN_INPUT_ATTENDANCE",
          `Admin melakukan input manual absensi untuk ${targetPegawaiName} pada tanggal ${selectedDate} | Status: ${editStatus} | Masuk: ${newClockInDisplay} | Pulang: ${newClockOutDisplay}`,
        );
      }

      alert("Berhasil memperbarui data absensi pegawai!");
      setEditingRecord(null);
      fetchAllAttendances();
    } catch (err: any) {
      alert("Gagal mengupdate absensi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Logika Filter & Sorting
  const filteredAttendances = attendances
    .filter((item) => {
      const name = item.profiles?.full_name || "";
      const nip = item.profiles?.nip || "";
      const matchSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nip.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === "all") return matchSearch;
      return matchSearch && item.status === statusFilter;
    })
    .sort((a, b) => {
      const nameA = a.profiles?.full_name || "";
      const nameB = b.profiles?.full_name || "";
      if (sortBy === "name_asc") {
        return nameA.localeCompare(nameB);
      } else if (sortBy === "name_desc") {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Rekapitulasi & Koreksi Absensi Pegawai
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan seluruh pegawai beserta pengelolaan koreksi absensi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Toolbar Search, Filter Status, & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau NIP pegawai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700"
          >
            <option value="all">Semua Status Kehadiran</option>
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
            <option value="Alpha">Alpha</option>
            <option value="Belum Absen">Belum Absen</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700"
          >
            <option value="name_asc">Urutkan: Nama (A - Z)</option>
            <option value="name_desc">Urutkan: Nama (Z - A)</option>
          </select>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Memuat data seluruh pegawai...
          </div>
        ) : filteredAttendances.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada data pegawai yang sesuai dengan filter/pencarian.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Nama Pegawai / NIP</th>
                <th className="p-3">Tipe Kerja</th>
                <th className="p-3">Jam Masuk</th>
                <th className="p-3">Jam Pulang</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi / Koreksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendances.map((item, index) => (
                <tr
                  key={item.user_id || index}
                  className="hover:bg-slate-50/80"
                >
                  <td className="p-3 font-semibold text-slate-800">
                    {item.profiles?.full_name || "Pegawai"}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {item.profiles?.nip || "-"}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                      {item.work_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-medium text-blue-600">
                    {item.status === "Hadir" && item.clock_in
                      ? item.clock_in.substring(0, 5)
                      : "--:--"}
                  </td>
                  <td className="p-3 font-mono font-medium text-emerald-600">
                    {item.status === "Hadir" && item.clock_out
                      ? item.clock_out.substring(0, 5)
                      : "--:--"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 font-medium rounded text-[10px] ${
                        item.status === "Belum Absen"
                          ? "bg-slate-100 text-slate-500"
                          : item.status === "Sakit"
                            ? "bg-amber-50 text-amber-700 font-bold"
                            : item.status === "Izin"
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setEditingRecord(item);
                        setEditClockIn(
                          item.clock_in
                            ? item.clock_in.substring(0, 5)
                            : "08:00",
                        );
                        // PERBAIKAN: Jangan paksa default ke 17:00 jika data aslinya ada atau kosong
                        setEditClockOut(
                          item.clock_out ? item.clock_out.substring(0, 5) : "",
                        );
                        setEditStatus(
                          item.status === "Belum Absen" ? "Hadir" : item.status,
                        );
                      }}
                      className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-semibold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{item.id ? "Edit Absen" : "Input Manual"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-bold text-slate-800">
                {editingRecord.id ? "Koreksi Absen" : "Input Absen Manual"}:{" "}
                {editingRecord.profiles?.full_name || "Pegawai"}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Status Kehadiran:
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold bg-white"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Jam Masuk:{" "}
                {editStatus !== "Hadir" && (
                  <span className="text-slate-400 font-normal">
                    (Tidak diperlukan untuk {editStatus})
                  </span>
                )}
              </label>
              <input
                type="time"
                value={editClockIn}
                disabled={editStatus !== "Hadir"}
                onChange={(e) => setEditClockIn(e.target.value)}
                className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold ${
                  editStatus !== "Hadir"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Jam Pulang:{" "}
                {editStatus !== "Hadir" && (
                  <span className="text-slate-400 font-normal">
                    (Tidak diperlukan untuk {editStatus})
                  </span>
                )}
              </label>
              <input
                type="time"
                value={editClockOut}
                disabled={editStatus !== "Hadir"}
                onChange={(e) => setEditClockOut(e.target.value)}
                className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold ${
                  editStatus !== "Hadir"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                disabled={saving}
                onClick={handleSaveEdit}
                className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
