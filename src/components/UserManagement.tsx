// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Users,
//   UserPlus,
//   Shield,
//   Edit,
//   Trash2,
//   X,
//   Save,
//   Key,
// } from "lucide-react";
// import { supabase } from "@/src/lib/supabase";

// export const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState<any[]>([]);
//   const [kasubbagList, setKasubbagList] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showModal, setShowModal] = useState<boolean>(false);
//   const [editingUser, setEditingUser] = useState<any>(null);

//   // Form State
//   const [nip, setNip] = useState<string>("");
//   const [name, setName] = useState<string>("");
//   const [position, setPosition] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [role, setRole] = useState<string>("staff");
//   const [supervisorId, setSupervisorId] = useState<string>("");

//   // Ambil daftar seluruh pegawai
//   const fetchUsers = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("*")
//       .order("name", { ascending: true });

//     if (error) {
//       console.error("Gagal memuat data user:", error.message);
//     } else {
//       setUsers(data || []);
//     }
//     setLoading(false);
//   };

//   // Ambil daftar khusus Kasubbag untuk pilihan atasan
//   const fetchKasubbagList = async () => {
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("id, name, position")
//       .eq("role", "kasubbag");

//     if (!error) {
//       setKasubbagList(data || []);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//     fetchKasubbagList();
//   }, []);

//   // Buka Modal Tambah/Edit
//   const handleOpenModal = (user: any = null) => {
//     if (user) {
//       setEditingUser(user);
//       setNip(user.nip || "");
//       setName(user.name || "");
//       setPosition(user.position || "");
//       setPassword(""); // Kosongkan password saat edit agar opsional
//       setRole(user.role || "staff");
//       setSupervisorId(user.supervisor_id || "");
//     } else {
//       setEditingUser(null);
//       setNip("");
//       setName("");
//       setPosition("");
//       setPassword("");
//       setRole("staff");
//       setSupervisorId("");
//     }
//     setShowModal(true);
//   };

//   // Simpan User (Tambah / Update)
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nip || !name) {
//       alert("NIP dan Nama wajib diisi!");
//       return;
//     }

//     try {
//       if (editingUser) {
//         // Mode Edit
//         const updateData: any = {
//           nip,
//           name,
//           position,
//           role,
//           supervisor_id: supervisorId || null,
//         };
//         if (password) {
//           updateData.password = password;
//         }

//         const { error } = await supabase
//           .from("profiles")
//           .update(updateData)
//           .eq("id", editingUser.id);

//         if (error) throw error;
//         alert("Data pegawai berhasil diperbarui!");
//       } else {
//         // Mode Tambah Baru
//         if (!password) {
//           alert("Password wajib diisi untuk pegawai baru!");
//           return;
//         }

//         const { error } = await supabase.from("profiles").insert([
//           {
//             nip,
//             name,
//             position,
//             password,
//             role,
//             supervisor_id: supervisorId || null,
//           },
//         ]);

//         if (error) throw error;
//         alert("Pegawai baru berhasil ditambahkan!");
//       }

//       setShowModal(false);
//       fetchUsers();
//       fetchKasubbagList();
//     } catch (err: any) {
//       alert("Gagal menyimpan data: " + err.message);
//     }
//   };

//   // Hapus User
//   const handleDelete = async (id: string, userName: string) => {
//     if (confirm(`Apakah Anda yakin ingin menghapus pegawai "${userName}"?`)) {
//       const { error } = await supabase.from("profiles").delete().eq("id", id);
//       if (error) {
//         alert("Gagal menghapus: " + error.message);
//       } else {
//         alert("Pegawai berhasil dihapus.");
//         fetchUsers();
//         fetchKasubbagList();
//       }
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
//             <Users className="w-6 h-6" />
//           </div>
//           <div>
//             <h2 className="text-base font-bold text-slate-800">
//               Manajemen Pengguna
//             </h2>
//             <p className="text-xs text-slate-500">
//               Kelola daftar pegawai, hak akses, dan kredensial akun.
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={() => handleOpenModal()}
//           className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
//         >
//           <UserPlus className="w-4 h-4" />
//           <span>Tambah Pegawai Baru</span>
//         </button>
//       </div>

//       {/* Tabel Daftar Pegawai */}
//       <div className="overflow-x-auto border border-slate-100 rounded-xl">
//         <table className="w-full text-left text-xs">
//           <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
//             <tr>
//               <th className="p-3.5">No</th>
//               <th className="p-3.5">Nama & Jabatan</th>
//               <th className="p-3.5">NIP</th>
//               <th className="p-3.5">Role / Hak Akses</th>
//               <th className="p-3.5 text-center">Aksi</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100 text-slate-700">
//             {loading ? (
//               <tr>
//                 <td colSpan={5} className="text-center p-6 text-slate-400">
//                   Memuat data pegawai...
//                 </td>
//               </tr>
//             ) : users.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="text-center p-6 text-slate-400">
//                   Belum ada data pegawai.
//                 </td>
//               </tr>
//             ) : (
//               users.map((u, index) => (
//                 <tr key={u.id} className="hover:bg-slate-50/50">
//                   <td className="p-3.5 font-medium">{index + 1}</td>
//                   <td className="p-3.5">
//                     <p className="font-bold text-slate-800">{u.name}</p>
//                     <p className="text-[11px] text-slate-500">
//                       {u.position || "Tanpa Jabatan"}
//                     </p>
//                   </td>
//                   <td className="p-3.5 font-mono">{u.nip || "-"}</td>
//                   <td className="p-3.5">
//                     <span
//                       className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
//                         u.role === "admin" || u.role === "super_user"
//                           ? "bg-purple-100 text-purple-700"
//                           : u.role === "kasubbag"
//                             ? "bg-blue-100 text-blue-700"
//                             : u.role === "sekretaris"
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-slate-100 text-slate-600"
//                       }`}
//                     >
//                       <Shield className="w-3 h-3" />
//                       {u.role === "admin" || u.role === "super_user"
//                         ? "Admin"
//                         : u.role === "kasubbag"
//                           ? "Kasubbag"
//                           : u.role === "sekretaris"
//                             ? "Sekretaris"
//                             : "Staf"}
//                     </span>
//                   </td>
//                   <td className="p-3.5 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <button
//                         onClick={() => handleOpenModal(u)}
//                         className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
//                         title="Edit Pegawai"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(u.id, u.name)}
//                         className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
//                         title="Hapus Pegawai"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* MODAL TAMBAH / EDIT PEGAWAI */}
//       {showModal && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between border-b pb-3 border-slate-100">
//               <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
//                 <Users className="w-4 h-4" />
//                 {editingUser ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
//               </h3>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-3 text-xs">
//               <div>
//                 <label className="font-semibold text-slate-700 block mb-1">
//                   NIP (Nomor Induk Pegawai):
//                 </label>
//                 <input
//                   type="text"
//                   value={nip}
//                   onChange={(e) => setNip(e.target.value)}
//                   placeholder="Contoh: 19950101..."
//                   required
//                   className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
//                 />
//               </div>

//               <div>
//                 <label className="font-semibold text-slate-700 block mb-1">
//                   Nama Lengkap:
//                 </label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Nama beserta gelar"
//                   required
//                   className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
//                 />
//               </div>

//               <div>
//                 <label className="font-semibold text-slate-700 block mb-1">
//                   Jabatan:
//                 </label>
//                 <input
//                   type="text"
//                   value={position}
//                   onChange={(e) => setPosition(e.target.value)}
//                   placeholder="Contoh: Penata Kelola Sistem..."
//                   className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800"
//                 />
//               </div>

//               <div>
//                 <label className="font-semibold text-slate-700 block mb-1">
//                   Password {editingUser && "(Kosongkan jika tidak diubah)"}:
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="••••••••"
//                     required={!editingUser}
//                     className="w-full p-2.5 pl-9 border rounded-xl bg-slate-50 text-slate-800"
//                   />
//                   <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//                 </div>
//               </div>

//               <div>
//                 <label className="font-semibold text-slate-700 block mb-1">
//                   Hak Akses (Role):
//                 </label>
//                 <select
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
//                 >
//                   <option value="staff">Staf (Bawahan)</option>
//                   <option value="kasubbag">Kasubbag (Atasan)</option>
//                   <option value="sekretaris">Sekretaris</option>
//                   <option value="admin">Admin / Super User</option>
//                 </select>
//               </div>

//               {/* Pilihan Kasubbag Atasan muncul untuk Staf DAN Admin (selain Kasubbag & Sekretaris) */}
//               {role !== "sekretaris" && role !== "kasubbag" && (
//                 <div>
//                   <label className="font-semibold text-slate-700 block mb-1">
//                     Atasan Langsung (Kasubbag):
//                   </label>
//                   <select
//                     value={supervisorId}
//                     onChange={(e) => setSupervisorId(e.target.value)}
//                     className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
//                   >
//                     <option value="">-- Tanpa Atasan / Mandiri --</option>
//                     {kasubbagList.map((k) => (
//                       <option key={k.id} value={k.id}>
//                         {k.name} ({k.position || "Kasubbag"})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div className="flex gap-2 pt-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 py-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
//                 >
//                   Batal
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 py-2.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm flex items-center justify-center gap-1"
//                 >
//                   <Save className="w-4 h-4" />
//                   Simpan Data
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  X,
  Save,
  Key,
  Search,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [kasubbagList, setKasubbagList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // State untuk Filter, Search, dan Sort
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");

  // Form State
  const [nip, setNip] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("staff");
  const [supervisorId, setSupervisorId] = useState<string>("");

  // Ambil daftar seluruh pegawai
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Gagal memuat data user:", error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // Ambil daftar khusus Kasubbag untuk pilihan atasan
  const fetchKasubbagList = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, position")
      .eq("role", "kasubbag");

    if (!error) {
      setKasubbagList(data || []);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchKasubbagList();
  }, []);

  // Buka Modal Tambah/Edit
  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setNip(user.nip || "");
      setName(user.name || "");
      setPosition(user.position || "");
      setPassword(""); // Kosongkan password saat edit agar opsional
      setRole(user.role || "staff");
      setSupervisorId(user.supervisor_id || "");
    } else {
      setEditingUser(null);
      setNip("");
      setName("");
      setPosition("");
      setPassword("");
      setRole("staff");
      setSupervisorId("");
    }
    setShowModal(true);
  };

  // Simpan User (Tambah / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nip || !name) {
      alert("NIP dan Nama wajib diisi!");
      return;
    }

    try {
      if (editingUser) {
        // Mode Edit
        const updateData: any = {
          nip,
          name,
          position,
          role,
          supervisor_id: supervisorId || null,
        };
        if (password) {
          updateData.password = password;
        }

        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", editingUser.id);

        if (error) throw error;
        alert("Data pegawai berhasil diperbarui!");
      } else {
        // Mode Tambah Baru
        if (!password) {
          alert("Password wajib diisi untuk pegawai baru!");
          return;
        }

        const { error } = await supabase.from("profiles").insert([
          {
            nip,
            name,
            position,
            password,
            role,
            supervisor_id: supervisorId || null,
          },
        ]);

        if (error) throw error;
        alert("Pegawai baru berhasil ditambahkan!");
      }

      setShowModal(false);
      fetchUsers();
      fetchKasubbagList();
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    }
  };

  // Hapus User
  const handleDelete = async (id: string, userName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pegawai "${userName}"?`)) {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        alert("Pegawai berhasil dihapus.");
        fetchUsers();
        fetchKasubbagList();
      }
    }
  };

  // Logika Filter & Sorting
  const filteredAndSortedUsers = users
    .filter((u) => {
      const keyword = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(keyword) || false;
      const matchNip = u.nip?.toLowerCase().includes(keyword) || false;
      const matchPosition =
        u.position?.toLowerCase().includes(keyword) || false;

      const isMatchSearch = matchName || matchNip || matchPosition;

      if (roleFilter === "all") return isMatchSearch;
      if (roleFilter === "admin") {
        return isMatchSearch && (u.role === "admin" || u.role === "super_user");
      }
      return isMatchSearch && u.role === roleFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      } else if (sortBy === "nip_asc") {
        return (a.nip || "").localeCompare(b.nip || "");
      }
      return 0;
    });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Manajemen Pengguna
            </h2>
            <p className="text-xs text-slate-500">
              Kelola daftar pegawai, hak akses, dan kredensial akun.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pegawai Baru</span>
        </button>
      </div>

      {/* Toolbar Search, Filter Role, & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border text-black/50 placeholder:text-black/50 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filter Role */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700"
          >
            <option value="all">Semua Hak Akses (Role)</option>
            <option value="staff">Staf</option>
            <option value="kasubbag">Kasubbag</option>
            <option value="sekretaris">Sekretaris</option>
            <option value="admin">Admin / Super User</option>
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
            <option value="nip_asc">Urutkan: NIP</option>
          </select>
        </div>
      </div>

      {/* Tabel Daftar Pegawai */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
            <tr>
              <th className="p-3.5">No</th>
              <th className="p-3.5">Nama & Jabatan</th>
              <th className="p-3.5">NIP</th>
              <th className="p-3.5">Role / Hak Akses</th>
              <th className="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-slate-400">
                  Memuat data pegawai...
                </td>
              </tr>
            ) : filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-slate-400">
                  Tidak ada data pegawai yang sesuai dengan pencarian/filter.
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((u, index) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-medium">{index + 1}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {u.position || "Tanpa Jabatan"}
                    </p>
                  </td>
                  <td className="p-3.5 font-mono">{u.nip || "-"}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === "admin" || u.role === "super_user"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "kasubbag"
                            ? "bg-blue-100 text-blue-700"
                            : u.role === "sekretaris"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.role === "admin" || u.role === "super_user"
                        ? "Admin"
                        : u.role === "kasubbag"
                          ? "Kasubbag"
                          : u.role === "sekretaris"
                            ? "Sekretaris"
                            : "Staf"}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Edit Pegawai"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Hapus Pegawai"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH / EDIT PEGAWAI */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {editingUser ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  NIP (Nomor Induk Pegawai):
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 19950101..."
                  required
                  className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama beserta gelar"
                  required
                  className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jabatan:
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Penata Kelola Sistem..."
                  className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Password {editingUser && "(Kosongkan jika tidak diubah)"}:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!editingUser}
                    className="w-full p-2.5 pl-9 border rounded-xl bg-slate-50 text-slate-800"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hak Akses (Role):
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
                >
                  <option value="staff">Staf (Bawahan)</option>
                  <option value="kasubbag">Kasubbag (Atasan)</option>
                  <option value="sekretaris">Sekretaris</option>
                  <option value="admin">Admin / Super User</option>
                </select>
              </div>

              {role !== "sekretaris" && role !== "kasubbag" && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Atasan Langsung (Kasubbag):
                  </label>
                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="">-- Tanpa Atasan / Mandiri --</option>
                    {kasubbagList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.position || "Kasubbag"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
