// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Users,
//   ClipboardList,
//   Shield,
//   LogOut,
//   FileText,
//   Activity,
// } from "lucide-react";
// import { UserManagement } from "./UserManagement";
// import { AdminActivityLog } from "./AdminActivityLog"; // Impor komponen log aktivitas
// import { supabase } from "@/src/lib/supabase";
// import { exportMonthlyExcel } from "@/src/lib/exportToExcel";

// import { HeaderBar } from "@/src/components/HeaderBar";
// import { StatsBar } from "@/src/components/StatsBar";
// import { AttendanceBar } from "@/src/components/AttendanceBar";
// import { ActivityForm } from "@/src/components/ActivityForm";
// import { FilterBar } from "@/src/components/FilterBar";
// import { ActivityList } from "@/src/components/ActivityList";
// import { AdminAttendanceManager } from "./AdminAttendanceManager";

// const normalizeCategory = (category: string) => {
//   const c = category.toLowerCase().trim();
//   if (c === "utama" || c === "kegiatan utama") return "Utama";
//   if (c === "rutin" || c === "kegiatan rutin") return "Rutin";
//   if (c === "tambahan" || c === "kegiatan tambahan") return "Tambahan";
//   if (c === "istirahat" || c === "ishoma") return "Istirahat";
//   return category;
// };

// export const AdminDashboard: React.FC<{
//   currentUser: any;
//   onLogout: () => void;
// }> = ({ currentUser, onLogout }) => {
//   const [activeTab, setActiveTab] = useState<string>("my_attendance");

//   // State untuk Absensi Pribadi Admin
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0],
//   );
//   const [activities, setActivities] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isExporting, setIsExporting] = useState<boolean>(false);
//   const [copied, setCopied] = useState<boolean>(false);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("Semua");
//   const [statusFilter, setStatusFilter] = useState("Semua");

//   const [editingId, setEditingId] = useState<string | number | null>(null);
//   const [formData, setFormData] = useState({
//     startTime: "08:00",
//     endTime: "09:00",
//     category: "Utama",
//     task: "",
//     output: "",
//     status: "Selesai",
//   });

//   // Fetch aktivitas pribadi admin
//   const fetchActivities = async () => {
//     if (!currentUser?.id) return;
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("reports")
//         .select("*")
//         .eq("user_id", currentUser.id)
//         .eq("date", selectedDate)
//         .order("start_time", { ascending: true });

//       if (error) throw error;

//       const mapped = (data || []).map((item) => ({
//         id: item.id,
//         date: item.date,
//         startTime: item.start_time ? item.start_time.substring(0, 5) : "",
//         endTime: item.end_time ? item.end_time.substring(0, 5) : "",
//         category: normalizeCategory(item.category || "Utama"),
//         task: item.task || "",
//         output: item.output || "",
//         status: item.status || "Selesai",
//       }));

//       setActivities(mapped);
//     } catch (err: any) {
//       console.error("Error fetching activities:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "my_attendance" && currentUser) {
//       fetchActivities();
//     }
//   }, [selectedDate, currentUser, activeTab]);

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!currentUser?.id) return;

//     const payload = {
//       user_id: currentUser.id,
//       date: selectedDate,
//       start_time: formData.startTime,
//       end_time: formData.endTime,
//       category: formData.category,
//       task: formData.task,
//       output: formData.category === "Istirahat" ? "" : formData.output,
//       status: formData.status,
//     };

//     try {
//       if (editingId) {
//         const { error } = await supabase
//           .from("reports")
//           .update(payload)
//           .eq("id", editingId);
//         if (error) throw error;
//       } else {
//         const { error } = await supabase.from("reports").insert([payload]);
//         if (error) throw error;
//       }

//       setFormData({
//         startTime: "08:00",
//         endTime: "09:00",
//         category: "Utama",
//         task: "",
//         output: "",
//         status: "Selesai",
//       });
//       setEditingId(null);
//       fetchActivities();
//     } catch (err: any) {
//       alert("Gagal menyimpan data: " + err.message);
//     }
//   };

//   const handleEdit = (act: any) => {
//     setEditingId(act.id);
//     setFormData({
//       startTime: act.startTime,
//       endTime: act.endTime,
//       category: act.category,
//       task: act.task,
//       output: act.output,
//       status: act.status,
//     });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setFormData({
//       startTime: "08:00",
//       endTime: "09:00",
//       category: "Utama",
//       task: "",
//       output: "",
//       status: "Selesai",
//     });
//   };

//   const handleDelete = async (id: string | number) => {
//     if (!confirm("Yakin ingin menghapus kegiatan ini?")) return;
//     try {
//       const { error } = await supabase.from("reports").delete().eq("id", id);
//       if (error) throw error;
//       fetchActivities();
//     } catch (err: any) {
//       alert("Gagal menghapus: " + err.message);
//     }
//   };

//   const filteredActivities = activities.filter((act) => {
//     const matchesSearch =
//       act.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       act.output.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory =
//       categoryFilter === "Semua" || act.category === categoryFilter;
//     const matchesStatus =
//       statusFilter === "Semua" || act.status === statusFilter;
//     return matchesSearch && matchesCategory && matchesStatus;
//   });

//   const totalMinutes = filteredActivities.reduce((acc, act) => {
//     if (act.category === "Istirahat") return acc;
//     const [h1, m1] = act.startTime.split(":").map(Number);
//     const [h2, m2] = act.endTime.split(":").map(Number);
//     const diff = h2 * 60 + m2 - (h1 * 60 + m1);
//     return acc + (diff > 0 ? diff : 0);
//   }, 0);

//   const handleExportExcel = async () => {
//     if (!currentUser?.id) return;
//     setIsExporting(true);
//     try {
//       const { data: userProfile, error: profileError } = await supabase
//         .from("profiles")
//         .select("name, nip, position, role, supervisor_id")
//         .eq("id", currentUser.id)
//         .single();

//       if (profileError) throw profileError;

//       let supervisorData: any = null;
//       if (userProfile?.supervisor_id) {
//         const { data: supData } = await supabase
//           .from("profiles")
//           .select("name, nip, position")
//           .eq("id", userProfile.supervisor_id)
//           .single();
//         supervisorData = supData;
//       }

//       const { data, error } = await supabase
//         .from("reports")
//         .select("*")
//         .eq("user_id", currentUser.id);

//       if (error) throw error;

//       const mapped = (data || []).map((item) => ({
//         id: item.id,
//         date: item.date,
//         startTime: item.start_time ? item.start_time.substring(0, 5) : "",
//         endTime: item.end_time ? item.end_time.substring(0, 5) : "",
//         category: normalizeCategory(item.category || "Utama"),
//         task: item.task || "",
//         output: item.output || "",
//         status: item.status || "Selesai",
//       }));

//       await exportMonthlyExcel(mapped, selectedDate, {
//         full_name: userProfile.name || currentUser?.name,
//         nip: userProfile.nip || currentUser?.nip || "-",
//         position: userProfile.position || currentUser?.position,
//         role: "staff",

//         kasubbag_name: supervisorData?.name || "Eka Wahyuni Dewi S, S.Sos",
//         kasubbag_nip: supervisorData?.nip || "-",
//         kasubbag_position:
//           supervisorData?.position || "Kepala Subbagian Perencanaan Data",
//       });
//     } catch (err: any) {
//       alert("Gagal mengunduh Excel: " + err.message);
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const copyToWhatsApp = () => {
//     let text = `*LAPORAN KEGIATAN HARIAN*\n`;
//     text += `Nama: ${currentUser?.name || "-"}\n`;
//     text += `NIP: ${currentUser?.nip || "-"}\n`;
//     text += `Tanggal: ${selectedDate}\n\n`;

//     filteredActivities.forEach((act, idx) => {
//       text += `${idx + 1}. [${act.startTime} - ${act.endTime}] (${act.category})\n`;
//       text += `   Kegiatan: ${act.task}\n`;
//       if (act.category !== "Istirahat" && act.output) {
//         text += `   Output: ${act.output}\n`;
//       }
//       text += `   Status: ${act.status}\n\n`;
//     });

//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
//       {/* SIDEBAR ADMIN */}
//       <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col justify-between shadow-sm flex-shrink-0">
//         <div className="space-y-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md">
//               <Shield className="w-5 h-5" />
//             </div>
//             <div>
//               <h1 className="text-sm font-bold text-slate-800">Panel Admin</h1>
//               <p className="text-[11px] text-slate-400">
//                 {currentUser?.name || "Administrator"}
//               </p>
//             </div>
//           </div>

//           <nav className="space-y-1.5 text-xs font-semibold">
//             <button
//               onClick={() => setActiveTab("my_attendance")}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//                 activeTab === "my_attendance"
//                   ? "bg-purple-50 text-purple-700 shadow-sm"
//                   : "text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               <FileText className="w-4 h-4" />
//               <span>Absensi & Laporan Saya</span>
//             </button>

//             <button
//               onClick={() => setActiveTab("users")}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//                 activeTab === "users"
//                   ? "bg-purple-50 text-purple-700 shadow-sm"
//                   : "text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               <Users className="w-4 h-4" />
//               <span>Manajemen Pengguna</span>
//             </button>

//             <button
//               onClick={() => setActiveTab("all_attendance")}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//                 activeTab === "all_attendance"
//                   ? "bg-purple-50 text-purple-700 shadow-sm"
//                   : "text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               <ClipboardList className="w-4 h-4" />
//               <span>Rekap Semua Pegawai</span>
//             </button>

//             {/* Menu Baru: Log Aktivitas Sistem */}
//             <button
//               onClick={() => setActiveTab("activity_logs")}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//                 activeTab === "activity_logs"
//                   ? "bg-purple-50 text-purple-700 shadow-sm"
//                   : "text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               <Activity className="w-4 h-4" />
//               <span>Log Aktivitas Sistem</span>
//             </button>
//           </nav>
//         </div>

//         <div className="pt-6 border-t border-slate-100">
//           <button
//             onClick={onLogout}
//             className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition"
//           >
//             <LogOut className="w-4 h-4" />
//             <span>Keluar Akun</span>
//           </button>
//         </div>
//       </aside>

//       {/* KONTEN UTAMA */}
//       <main className="flex-1 p-4 md:p-8 overflow-y-auto">
//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* TAB 1: ABSENSI & LAPORAN PRIBADI ADMIN */}
//           {activeTab === "my_attendance" && (
//             <div className="space-y-6">
//               <HeaderBar
//                 selectedDate={selectedDate}
//                 setSelectedDate={setSelectedDate}
//                 handleExportExcel={handleExportExcel}
//                 isExporting={isExporting}
//                 copyToWhatsApp={copyToWhatsApp}
//                 copied={copied}
//                 user={currentUser}
//               />

//               <StatsBar
//                 totalMinutes={totalMinutes}
//                 filteredActivities={filteredActivities}
//               />

//               <AttendanceBar
//                 selectedDate={selectedDate}
//                 activities={filteredActivities}
//                 user={currentUser}
//               />

//               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//                 <div className="lg:col-span-4">
//                   <ActivityForm
//                     formData={formData}
//                     handleChange={handleChange}
//                     handleSubmit={handleSubmit}
//                     editingId={editingId}
//                     cancelEdit={cancelEdit}
//                   />
//                 </div>

//                 <div className="lg:col-span-8 space-y-4">
//                   <FilterBar
//                     searchQuery={searchQuery}
//                     setSearchQuery={setSearchQuery}
//                     categoryFilter={categoryFilter}
//                     setCategoryFilter={setCategoryFilter}
//                     statusFilter={statusFilter}
//                     setStatusFilter={setStatusFilter}
//                   />

//                   <ActivityList
//                     loading={loading}
//                     filteredActivities={filteredActivities}
//                     handleEdit={handleEdit}
//                     handleDelete={handleDelete}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* TAB 2: MANAJEMEN USER */}
//           {activeTab === "users" && <UserManagement />}

//           {/* TAB 3: REKAP SEMUA PEGAWAI */}
//           {activeTab === "all_attendance" && (
//             <AdminAttendanceManager selectedDate={selectedDate} />
//           )}

//           {/* TAB 4: LOG AKTIVITAS SISTEM */}
//           {activeTab === "activity_logs" && <AdminActivityLog />}
//         </div>
//       </main>
//     </div>
//   );
// };

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  Shield,
  LogOut,
  FileText,
  Activity,
} from "lucide-react";
import { UserManagement } from "./UserManagement";
import { AdminActivityLog } from "./AdminActivityLog";
import { supabase } from "@/src/lib/supabase";
import { logActivity } from "@/src/lib/logger"; // 1. Impor fungsi logger
import { exportMonthlyExcel } from "@/src/lib/exportToExcel";

import { HeaderBar } from "@/src/components/HeaderBar";
import { StatsBar } from "@/src/components/StatsBar";
import { AttendanceBar } from "@/src/components/AttendanceBar";
import { ActivityForm } from "@/src/components/ActivityForm";
import { FilterBar } from "@/src/components/FilterBar";
import { ActivityList } from "@/src/components/ActivityList";
import { AdminAttendanceManager } from "./AdminAttendanceManager";

const normalizeCategory = (category: string) => {
  const c = category.toLowerCase().trim();
  if (c === "utama" || c === "kegiatan utama") return "Utama";
  if (c === "rutin" || c === "kegiatan rutin") return "Rutin";
  if (c === "tambahan" || c === "kegiatan tambahan") return "Tambahan";
  if (c === "istirahat" || c === "ishoma") return "Istirahat";
  return category;
};

export const AdminDashboard: React.FC<{
  currentUser: any;
  onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>("my_attendance");

  // State untuk Absensi Pribadi Admin
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    startTime: "08:00",
    endTime: "09:00",
    category: "Utama",
    task: "",
    output: "",
    status: "Selesai",
  });

  // Fetch aktivitas pribadi admin
  const fetchActivities = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("date", selectedDate)
        .order("start_time", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((item) => ({
        id: item.id,
        date: item.date,
        startTime: item.start_time ? item.start_time.substring(0, 5) : "",
        endTime: item.end_time ? item.end_time.substring(0, 5) : "",
        category: normalizeCategory(item.category || "Utama"),
        task: item.task || "",
        output: item.output || "",
        status: item.status || "Selesai",
      }));

      setActivities(mapped);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my_attendance" && currentUser) {
      fetchActivities();
    }
  }, [selectedDate, currentUser, activeTab]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    const payload = {
      user_id: currentUser.id,
      date: selectedDate,
      start_time: formData.startTime,
      end_time: formData.endTime,
      category: formData.category,
      task: formData.task,
      output: formData.category === "Istirahat" ? "" : formData.output,
      status: formData.status,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("reports")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;

        // 👉 2. Catat log saat memperbarui kegiatan
        await logActivity(
          currentUser.id,
          "UPDATE_REPORT",
          `Admin ${currentUser.name} memperbarui kegiatan: "${formData.task.substring(0, 30)}..."`,
        );
      } else {
        const { error } = await supabase.from("reports").insert([payload]);
        if (error) throw error;

        // 👉 3. Catat log saat menambah kegiatan baru
        await logActivity(
          currentUser.id,
          "ADD_REPORT",
          `Admin ${currentUser.name} menambahkan kegiatan baru: "${formData.task.substring(0, 30)}..."`,
        );
      }

      setFormData({
        startTime: "08:00",
        endTime: "09:00",
        category: "Utama",
        task: "",
        output: "",
        status: "Selesai",
      });
      setEditingId(null);
      fetchActivities();
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    }
  };

  const handleEdit = (act: any) => {
    setEditingId(act.id);
    setFormData({
      startTime: act.startTime,
      endTime: act.endTime,
      category: act.category,
      task: act.task,
      output: act.output,
      status: act.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      startTime: "08:00",
      endTime: "09:00",
      category: "Utama",
      task: "",
      output: "",
      status: "Selesai",
    });
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Yakin ingin menghapus kegiatan ini?")) return;
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;

      // 👉 4. Catat log saat menghapus kegiatan
      await logActivity(
        currentUser?.id,
        "DELETE_REPORT",
        `Admin ${currentUser?.name} menghapus laporan kegiatan (ID: ${id})`,
      );

      fetchActivities();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.output.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "Semua" || act.category === categoryFilter;
    const matchesStatus =
      statusFilter === "Semua" || act.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalMinutes = filteredActivities.reduce((acc, act) => {
    if (act.category === "Istirahat") return acc;
    const [h1, m1] = act.startTime.split(":").map(Number);
    const [h2, m2] = act.endTime.split(":").map(Number);
    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  const handleExportExcel = async () => {
    if (!currentUser?.id) return;
    setIsExporting(true);
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("name, nip, position, role, supervisor_id")
        .eq("id", currentUser.id)
        .single();

      if (profileError) throw profileError;

      let supervisorData: any = null;
      if (userProfile?.supervisor_id) {
        const { data: supData } = await supabase
          .from("profiles")
          .select("name, nip, position")
          .eq("id", userProfile.supervisor_id)
          .single();
        supervisorData = supData;
      }

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", currentUser.id);

      if (error) throw error;

      const mapped = (data || []).map((item) => ({
        id: item.id,
        date: item.date,
        startTime: item.start_time ? item.start_time.substring(0, 5) : "",
        endTime: item.end_time ? item.end_time.substring(0, 5) : "",
        category: normalizeCategory(item.category || "Utama"),
        task: item.task || "",
        output: item.output || "",
        status: item.status || "Selesai",
      }));

      await exportMonthlyExcel(mapped, selectedDate, {
        full_name: userProfile.name || currentUser?.name,
        nip: userProfile.nip || currentUser?.nip || "-",
        position: userProfile.position || currentUser?.position,
        role: "staff",

        kasubbag_name: supervisorData?.name || "Eka Wahyuni Dewi S, S.Sos",
        kasubbag_nip: supervisorData?.nip || "-",
        kasubbag_position:
          supervisorData?.position || "Kepala Subbagian Perencanaan Data",
      });
    } catch (err: any) {
      alert("Gagal mengunduh Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToWhatsApp = () => {
    let text = `*LAPORAN KEGIATAN HARIAN*\n`;
    text += `Nama: ${currentUser?.name || "-"}\n`;
    text += `NIP: ${currentUser?.nip || "-"}\n`;
    text += `Tanggal: ${selectedDate}\n\n`;

    filteredActivities.forEach((act, idx) => {
      text += `${idx + 1}. [${act.startTime} - ${act.endTime}] (${act.category})\n`;
      text += `   Kegiatan: ${act.task}\n`;
      if (act.category !== "Istirahat" && act.output) {
        text += `   Output: ${act.output}\n`;
      }
      text += `   Status: ${act.status}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR ADMIN */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col justify-between shadow-sm flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Panel Admin</h1>
              <p className="text-[11px] text-slate-400">
                {currentUser?.name || "Administrator"}
              </p>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("my_attendance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "my_attendance"
                  ? "bg-purple-50 text-purple-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Absensi & Laporan Saya</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "users"
                  ? "bg-purple-50 text-purple-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen Pengguna</span>
            </button>

            <button
              onClick={() => setActiveTab("all_attendance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "all_attendance"
                  ? "bg-purple-50 text-purple-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Rekap Semua Pegawai</span>
            </button>

            {/* Menu Baru: Log Aktivitas Sistem */}
            <button
              onClick={() => setActiveTab("activity_logs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === "activity_logs"
                  ? "bg-purple-50 text-purple-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Log Aktivitas Sistem</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* TAB 1: ABSENSI & LAPORAN PRIBADI ADMIN */}
          {activeTab === "my_attendance" && (
            <div className="space-y-6">
              <HeaderBar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                handleExportExcel={handleExportExcel}
                isExporting={isExporting}
                copyToWhatsApp={copyToWhatsApp}
                copied={copied}
                user={currentUser}
              />

              <StatsBar
                totalMinutes={totalMinutes}
                filteredActivities={filteredActivities}
              />

              <AttendanceBar
                selectedDate={selectedDate}
                activities={filteredActivities}
                user={currentUser}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <ActivityForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    editingId={editingId}
                    cancelEdit={cancelEdit}
                  />
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                  />

                  <ActivityList
                    loading={loading}
                    filteredActivities={filteredActivities}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAJEMEN USER */}
          {activeTab === "users" && <UserManagement />}

          {/* TAB 3: REKAP SEMUA PEGAWAI */}
          {activeTab === "all_attendance" && (
            <AdminAttendanceManager selectedDate={selectedDate} />
          )}

          {/* TAB 4: LOG AKTIVITAS SISTEM */}
          {activeTab === "activity_logs" && <AdminActivityLog />}
        </div>
      </main>
    </div>
  );
};
