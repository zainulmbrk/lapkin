// "use client";

// import React from "react";
// import {
//   FileText,
//   Calendar,
//   Loader2,
//   FileSpreadsheet,
//   Check,
//   Copy,
//   Printer,
// } from "lucide-react";

// interface HeaderBarProps {
//   selectedDate: string;
//   setSelectedDate: (date: string) => void;
//   handleExportExcel: () => void;
//   isExporting: boolean;
//   copyToWhatsApp: () => void;
//   copied: boolean;
// }

// export const HeaderBar: React.FC<HeaderBarProps> = ({
//   selectedDate,
//   setSelectedDate,
//   handleExportExcel,
//   isExporting,
//   copyToWhatsApp,
//   copied,
// }) => {
//   return (
//     <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
//           <FileText className="w-8 h-8 text-blue-600" />
//           Laporan Kegiatan Harian
//         </h1>
//         <p className="text-slate-500 text-sm mt-1">
//           Tersambung ke Supabase Database (Cloud Storage)
//         </p>
//       </div>

//       <div className="flex items-center gap-3 flex-wrap">
//         <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
//           <Calendar className="w-4 h-4 text-slate-500" />
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
//           />
//         </div>

//         <button
//           onClick={handleExportExcel}
//           disabled={isExporting}
//           className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50"
//         >
//           {isExporting ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             <FileSpreadsheet className="w-4 h-4" />
//           )}
//           <span>{isExporting ? "Mengunduh..." : "Export Excel"}</span>
//         </button>

//         <button
//           onClick={copyToWhatsApp}
//           className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
//         >
//           {copied ? (
//             <Check className="w-4 h-4" />
//           ) : (
//             <Copy className="w-4 h-4" />
//           )}
//           <span>{copied ? "Tersalin!" : "Salin WA"}</span>
//         </button>

//         <button
//           onClick={() => window.print()}
//           className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
//         >
//           <Printer className="w-4 h-4" />
//           <span>Cetak</span>
//         </button>
//       </div>
//     </header>
//   );
// };

"use client";

import React from "react";
import { Calendar, Download, Copy, Printer, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderBarProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  handleExportExcel: () => void;
  isExporting: boolean;
  copyToWhatsApp: () => void;
  copied: boolean;
  user: any;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedDate,
  setSelectedDate,
  handleExportExcel,
  isExporting,
  copyToWhatsApp,
  copied,
  user,
}) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* JUDUL DAN USER PROFILE */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Laporan Kegiatan Harian
          </h1>
          {user && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                <User className="w-3.5 h-3.5" />
                <strong>{user.name}</strong> ({user.nip})
              </span>
              <span>-</span>
              <span>{user.position || "Pegawai"}</span>
            </div>
          )}
        </div>

        {/* TANGGAL & ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Tanggal Picker */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Memproses..." : "Export Excel"}</span>
          </button>

          {/* Salin WA */}
          <button
            onClick={copyToWhatsApp}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? "Tersalin!" : "Salin WA"}</span>
          </button>

          {/* Cetak */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Keluar / Logout"
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
