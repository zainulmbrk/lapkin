// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { AlertCircle, RefreshCw } from "lucide-react";
// import { supabase } from "@/src/lib/supabase";
// import { exportMonthlyExcel } from "@/src/lib/exportToExcel";
// import { logActivity } from "@/src/lib/logger";

// import { HeaderBar } from "@/src/components/HeaderBar";
// import { StatsBar } from "@/src/components/StatsBar";
// import { AttendanceBar } from "@/src/components/AttendanceBar";
// import { ActivityForm } from "@/src/components/ActivityForm";
// import { FilterBar } from "@/src/components/FilterBar";
// import { ActivityList } from "@/src/components/ActivityList";
// import { AdminDashboard } from "@/src/components/AdminDashboard"; // <-- TAMBAHKAN IMPORT INI

// const normalizeCategory = (category: string) => {
//   const c = category.toLowerCase().trim();
//   if (c === "utama" || c === "kegiatan utama") return "Utama";
//   if (c === "rutin" || c === "kegiatan rutin") return "Rutin";
//   if (c === "tambahan" || c === "kegiatan tambahan") return "Tambahan";
//   if (c === "istirahat" || c === "ishoma") return "Istirahat";
//   return category;
// };

// export default function Home() {
//   const router = useRouter();
//   const [currentUser, setCurrentUser] = useState<any>(null);
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0],
//   );
//   const [activities, setActivities] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [isExporting, setIsExporting] = useState<boolean>(false);
//   const [copied, setCopied] = useState<boolean>(false);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("Semua");
//   const [statusFilter, setStatusFilter] = useState("Semua");

//   const [viewMode, setViewMode] = useState<"admin" | "staff">("staff");

//   const [editingId, setEditingId] = useState<string | number | null>(null);
//   const [formData, setFormData] = useState({
//     startTime: "08:00",
//     endTime: "09:00",
//     category: "Utama",
//     task: "",
//     output: "",
//     status: "Selesai",
//   });

//   // CEK AUTH / SESSION USER & ROLE
//   useEffect(() => {
//     const session = localStorage.getItem("user_session");
//     if (!session) {
//       router.push("/login");
//     } else {
//       try {
//         const parsedUser = JSON.parse(session);
//         setCurrentUser(parsedUser);
//       } catch (e) {
//         router.push("/login");
//       }
//     }
//     setCheckingAuth(false);
//   }, [router]);

//   // Fungsi Logout untuk Admin/User
//   const handleLogout = () => {
//     localStorage.removeItem("user_session");
//     router.push("/login");
//   };

//   // FETCH ACTIVITIES BY USER_ID
//   const fetchActivities = async () => {
//     if (!currentUser?.id) return;
//     setLoading(true);
//     setErrorMessage("");
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
//       setErrorMessage(err.message || "Gagal mengambil data dari Supabase.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (
//       currentUser &&
//       currentUser.role !== "super_user" &&
//       currentUser.role !== "admin"
//     ) {
//       fetchActivities();
//     }
//   }, [selectedDate, currentUser]);

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
//       // 1. Ambil data profil user yang sedang login
//       const { data: userProfile, error: profileError } = await supabase
//         .from("profiles")
//         .select("name, nip, position, role, supervisor_id")
//         .eq("id", currentUser.id)
//         .single();

//       if (profileError) throw profileError;

//       // 2. Jika punya supervisor_id, ambil data profil atasannya secara terpisah (Aman dari error relasi)
//       let supervisorData: any = null;
//       if (userProfile?.supervisor_id) {
//         const { data: supData } = await supabase
//           .from("profiles")
//           .select("name, nip, position")
//           .eq("id", userProfile.supervisor_id)
//           .single();
//         supervisorData = supData;
//       }

//       // 3. Ambil data reports milik user
//       const { data: reportsData, error: reportsError } = await supabase
//         .from("reports")
//         .select("*")
//         .eq("user_id", currentUser.id);

//       if (reportsError) throw reportsError;

//       const mapped = (reportsData || []).map((item) => ({
//         id: item.id,
//         date: item.date,
//         startTime: item.start_time ? item.start_time.substring(0, 5) : "",
//         endTime: item.end_time ? item.end_time.substring(0, 5) : "",
//         category: normalizeCategory(item.category || "Utama"),
//         task: item.task || "",
//         output: item.output || "",
//         status: item.status || "Selesai",
//       }));

//       // 4. Kirim ke fungsi export Excel dengan data yang sudah pasti bersih
//       await exportMonthlyExcel(mapped, selectedDate, {
//         full_name: userProfile.name || currentUser?.name,
//         nip: userProfile.nip || currentUser?.nip || "-", // Mengambil langsung dari kolom 'nip' tabel profiles
//         position: userProfile.position || currentUser?.position,
//         role: userProfile.role || "staff",

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

//   if (checkingAuth) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500">
//         Memeriksa sesi login...
//       </div>
//     );
//   }

//   // JIKA YANG LOGIN ADALAH ADMIN / SUPER USER
//   if (
//     currentUser &&
//     (currentUser.role === "super_user" || currentUser.role === "admin")
//   ) {
//     return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
//   }

//   // JIKA PEGAWAI BIASA, TAMPILKAN DASHBOARD LAPORAN HARIAN
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
//       <div className="max-w-6xl mx-auto space-y-6">
//         <HeaderBar
//           selectedDate={selectedDate}
//           setSelectedDate={setSelectedDate}
//           handleExportExcel={handleExportExcel}
//           isExporting={isExporting}
//           copyToWhatsApp={copyToWhatsApp}
//           copied={copied}
//           user={currentUser}
//         />

//         {errorMessage && (
//           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-sm">
//                   Gagal terhubung ke Database Supabase
//                 </p>
//                 <p className="text-xs text-amber-700 mt-0.5">{errorMessage}</p>
//               </div>
//             </div>
//             <button
//               onClick={fetchActivities}
//               className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
//             >
//               <RefreshCw className="w-3.5 h-3.5" />
//               Coba Lagi
//             </button>
//           </div>
//         )}

//         <StatsBar
//           totalMinutes={totalMinutes}
//           filteredActivities={filteredActivities}
//         />

//         <AttendanceBar
//           selectedDate={selectedDate}
//           activities={filteredActivities}
//           user={currentUser}
//         />

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <div className="lg:col-span-4">
//             <ActivityForm
//               formData={formData}
//               handleChange={handleChange}
//               handleSubmit={handleSubmit}
//               editingId={editingId}
//               cancelEdit={cancelEdit}
//             />
//           </div>

//           <div className="lg:col-span-8 space-y-4">
//             <FilterBar
//               searchQuery={searchQuery}
//               setSearchQuery={setSearchQuery}
//               categoryFilter={categoryFilter}
//               setCategoryFilter={setCategoryFilter}
//               statusFilter={statusFilter}
//               setStatusFilter={setStatusFilter}
//             />

//             <ActivityList
//               loading={loading}
//               filteredActivities={filteredActivities}
//               handleEdit={handleEdit}
//               handleDelete={handleDelete}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import { exportMonthlyExcel } from "@/src/lib/exportToExcel";
import { logActivity } from "@/src/lib/logger"; // <-- 1. IMPORT LOGGER

import { HeaderBar } from "@/src/components/HeaderBar";
import { StatsBar } from "@/src/components/StatsBar";
import { AttendanceBar } from "@/src/components/AttendanceBar";
import { ActivityForm } from "@/src/components/ActivityForm";
import { FilterBar } from "@/src/components/FilterBar";
import { ActivityList } from "@/src/components/ActivityList";
import { AdminDashboard } from "@/src/components/AdminDashboard";

const normalizeCategory = (category: string) => {
  const c = category.toLowerCase().trim();
  if (c === "utama" || c === "kegiatan utama") return "Utama";
  if (c === "rutin" || c === "kegiatan rutin") return "Rutin";
  if (c === "tambahan" || c === "kegiatan tambahan") return "Tambahan";
  if (c === "istirahat" || c === "ishoma") return "Istirahat";
  return category;
};

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [viewMode, setViewMode] = useState<"admin" | "staff">("staff");

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    startTime: "08:00",
    endTime: "09:00",
    category: "Utama",
    task: "",
    output: "",
    status: "Selesai",
  });

  // CEK AUTH / SESSION USER & ROLE
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
    } else {
      try {
        const parsedUser = JSON.parse(session);
        setCurrentUser(parsedUser);
      } catch (e) {
        router.push("/login");
      }
    }
    setCheckingAuth(false);
  }, [router]);

  // Fungsi Logout untuk Admin/User
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  // FETCH ACTIVITIES BY USER_ID
  const fetchActivities = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setErrorMessage("");
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
      setErrorMessage(err.message || "Gagal mengambil data dari Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      currentUser &&
      currentUser.role !== "super_user" &&
      currentUser.role !== "admin"
    ) {
      fetchActivities();
    }
  }, [selectedDate, currentUser]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. TAMBAHKAN LOG ACTIVITY PADA HANDLE SUBMIT (TAMBAH & EDIT)
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

        // Catat Log Edit Laporan
        await logActivity(
          currentUser.id,
          "UPDATE_REPORT",
          `Pegawai ${currentUser.name || "User"} memperbarui laporan: "${formData.task}"`,
        );
      } else {
        const { error } = await supabase.from("reports").insert([payload]);
        if (error) throw error;

        // Catat Log Tambah Laporan
        await logActivity(
          currentUser.id,
          "ADD_REPORT",
          `Pegawai ${currentUser.name || "User"} menambahkan laporan (${formData.category}): "${formData.task}"`,
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

  // 3. TAMBAHKAN LOG ACTIVITY PADA HANDLE DELETE (HAPUS LAPORAN)
  const handleDelete = async (id: string | number) => {
    if (!confirm("Yakin ingin menghapus kegiatan ini?")) return;
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;

      // Catat Log Hapus Laporan
      await logActivity(
        currentUser.id,
        "DELETE_REPORT",
        `Pegawai ${currentUser.name || "User"} menghapus laporan kinerja (ID: ${id})`,
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

      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", currentUser.id);

      if (reportsError) throw reportsError;

      const mapped = (reportsData || []).map((item) => ({
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
        role: userProfile.role || "staff",

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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500">
        Memeriksa sesi login...
      </div>
    );
  }

  if (
    currentUser &&
    (currentUser.role === "super_user" || currentUser.role === "admin")
  ) {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <HeaderBar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          handleExportExcel={handleExportExcel}
          isExporting={isExporting}
          copyToWhatsApp={copyToWhatsApp}
          copied={copied}
          user={currentUser}
        />

        {errorMessage && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  Gagal terhubung ke Database Supabase
                </p>
                <p className="text-xs text-amber-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={fetchActivities}
              className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

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
    </div>
  );
}
