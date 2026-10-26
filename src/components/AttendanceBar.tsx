"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LogIn,
  LogOut,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Camera,
  X,
  MapPin,
  RefreshCw,
  UserCheck,
  FileText,
  Upload,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import { logActivity } from "@/src/lib/logger";

// Koordinat Latitude & Longitude KPU Kota Bima
const OFFICE_LAT = -8.474722;
const OFFICE_LNG = 118.740278;
const MAX_RADIUS_METERS = 10000; // Batas radius WFO (meter)

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

interface AttendanceBarProps {
  selectedDate: string;
  activities: any[];
  user: any;
  onOpenAdminModal?: () => void;
}

export const AttendanceBar: React.FC<AttendanceBarProps> = ({
  selectedDate,
  activities,
  user,
  onOpenAdminModal,
}) => {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State Modal, Status Absen (Hadir/Sakit/Izin), WFO/WFA, Foto, & Surat Sakit
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [attendanceStatus, setAttendanceStatus] = useState<
    "Hadir" | "Sakit" | "Izin"
  >("Hadir");
  const [workType, setWorkType] = useState<"WFO" | "WFA">("WFO");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [attachmentBase64, setAttachmentBase64] = useState<string>(""); // Untuk surat sakit/izin
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  const isSuperUser =
    user?.role === "super_user" ||
    user?.role === "admin" ||
    user?.is_super_user === true;

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setIsCameraActive(false);
      alert("Gagal mengakses kamera. Mohon izinkan akses kamera pada browser.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 200, 200);
      const compressed = canvas.toDataURL("image/jpeg", 0.4);
      setPhotoBase64(compressed);
      stopCamera();
    }
  };

  // Handler Upload File Surat Sakit / Izin dari Perangkat User
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Absen Mandiri (Hadir / Sakit / Izin)
  const handleSubmitAttendance = async () => {
    if (!isToday) {
      alert("❌ Absensi mandiri hanya dapat dilakukan untuk tanggal HARI INI!");
      return;
    }

    if (!user || !user.id) {
      alert("Sesi pengguna tidak valid. Silakan re-login.");
      return;
    }

    if (attendanceStatus === "Hadir" && !photoBase64) {
      alert(
        "Wajib mengambil foto wajah terlebih dahulu untuk kehadiran Hadir!",
      );
      return;
    }

    if (
      (attendanceStatus === "Sakit" || attendanceStatus === "Izin") &&
      !attachmentBase64
    ) {
      alert("Wajib mengunggah bukti surat sakit / surat izin!");
      return;
    }

    setSubmitting(true);

    const processSubmission = async (
      userLat: number | null,
      userLng: number | null,
      distance: number | null,
    ) => {
      const now = new Date();
      const currentTime = now.toTimeString().split(" ")[0];

      try {
        const payload: any = {
          user_id: user.id,
          date: todayStr,
          status: attendanceStatus,
          work_type: attendanceStatus === "Hadir" ? workType : "-",
          latitude: userLat,
          longitude: userLng,
          distance_meters: distance,
        };

        if (attendanceStatus === "Hadir") {
          payload.clock_in = currentTime;
          payload.photo_url = photoBase64;
        } else {
          payload.notes = `Pengajuan ${attendanceStatus} oleh user.`;
          payload.attachment_url = attachmentBase64;
        }

        const { data, error } = await supabase
          .from("attendances")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        await logActivity(
          user.id,
          attendanceStatus === "Hadir"
            ? "CLOCK_IN"
            : `SUBMIT_${attendanceStatus.toUpperCase()}`,
          `Pegawai ${user.name || "User"} melakukan absen ${attendanceStatus} (${attendanceStatus === "Hadir" ? workType : "Pengajuan Surat"})`,
        );

        alert(`Berhasil mengirim data absensi (${attendanceStatus})`);
        setAttendance(data);
        setShowModal(false);
        setPhotoBase64("");
        setAttachmentBase64("");
      } catch (err: any) {
        alert("Gagal Mengirim Absensi: " + err.message);
      } finally {
        setSubmitting(false);
      }
    };

    if (attendanceStatus === "Hadir") {
      if (!navigator.geolocation) {
        alert("Browser tidak mendukung Geolocation.");
        setSubmitting(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const distance = calculateDistance(
            userLat,
            userLng,
            OFFICE_LAT,
            OFFICE_LNG,
          );

          if (workType === "WFO" && distance > MAX_RADIUS_METERS) {
            alert(
              `❌ Gagal Absen WFO!\n\nJarak Anda ${distance} meter dari kantor (Maks: ${MAX_RADIUS_METERS}m).`,
            );
            setSubmitting(false);
            return;
          }

          processSubmission(userLat, userLng, distance);
        },
        (err) => {
          setSubmitting(false);
          alert("Gagal mendapatkan lokasi GPS: " + err.message);
        },
        { enableHighAccuracy: true },
      );
    } else {
      processSubmission(null, null, null);
    }
  };

  // Fungsi Absen Pulang (Clock Out) dengan Perhitungan Kelebihan/Kekurangan Jam
  const handleClockOut = async () => {
    if (!isToday) {
      alert("❌ Absensi pulang hanya dapat dilakukan untuk tanggal HARI INI!");
      return;
    }

    if (!attendance || !attendance.id) {
      alert("Data absensi masuk tidak ditemukan.");
      return;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0]; // Format "HH:mm:ss"

    // Tentukan jam standar pulang (Senin-Kamis 16:00, Jumat 16:30)
    const dateObj = new Date(selectedDate);
    const isFridayCheck = dateObj.getDay() === 5;
    const targetClockOutTime = isFridayCheck ? "16:30:00" : "16:00:00";

    const [currH, currM] = currentTime.split(":").map(Number);
    const [targetH, targetM] = targetClockOutTime.split(":").map(Number);

    const currentTotalMinutes = currH * 60 + currM;
    const targetTotalMinutes = targetH * 60 + targetM;
    const diffMinutes = currentTotalMinutes - targetTotalMinutes;

    let timeNote = "";
    if (diffMinutes < 0) {
      const absDiff = Math.abs(diffMinutes);
      const hours = Math.floor(absDiff / 60);
      const mins = absDiff % 60;
      timeNote = ` (Kurang ${hours > 0 ? `${hours} jam ` : ""}${mins} menit)`;
    } else if (diffMinutes > 0) {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      timeNote = ` (Lembur / Kelebihan ${hours > 0 ? `${hours} jam ` : ""}${mins} menit)`;
    } else {
      timeNote = " (Tepat Waktu)";
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("attendances")
        .update({ clock_out: currentTime })
        .eq("id", attendance.id);

      if (error) throw error;

      await logActivity(
        user.id,
        "CLOCK_OUT",
        `Pegawai ${user.name || "User"} melakukan absen pulang pada pukul ${currentTime}${timeNote}`,
      );

      alert(`Berhasil melakukan absen pulang!${timeNote}`);
      fetchAttendance();
    } catch (err: any) {
      alert("Gagal Melakukan Absen Pulang: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const dateObj = new Date(selectedDate);
  const isFriday = dateObj.getDay() === 5;

  const fetchAttendance = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("date", selectedDate)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setAttendance(null);
      } else {
        setAttendance(data);
      }
    } catch (err: any) {
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, user]);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "--:--";
    return timeStr.substring(0, 5);
  };

  // Label badge kelebihan/kekurangan jam pada UI
  const renderTimeSummary = () => {
    if (!attendance?.clock_out) return null;

    const [outH, outM] = attendance.clock_out
      .substring(0, 5)
      .split(":")
      .map(Number);
    const targetH = isFriday ? 16 : 16;
    const targetM = isFriday ? 30 : 0;

    const currentTotalMinutes = outH * 60 + outM;
    const targetTotalMinutes = targetH * 60 + targetM;
    const diffMinutes = currentTotalMinutes - targetTotalMinutes;

    if (diffMinutes < 0) {
      const absDiff = Math.abs(diffMinutes);
      const h = Math.floor(absDiff / 60);
      const m = absDiff % 60;
      return (
        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-semibold border border-red-100">
          ⚠️ Kurang {h > 0 ? `${h}j ` : ""}
          {m}m
        </span>
      );
    } else if (diffMinutes > 0) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      return (
        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-semibold border border-purple-100">
          ⭐ Lembur +{h > 0 ? `${h}j ` : ""}
          {m}m
        </span>
      );
    }
    return (
      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
        ✨ Tepat Waktu
      </span>
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">
                Absensi / Jam Kerja
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {isFriday
                  ? "Jumat (07:30 - 16:30)"
                  : "Senin-Kamis (07:30 - 16:00)"}
              </span>
              {attendance?.status && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    attendance.status === "Hadir"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {attendance.status}{" "}
                  {attendance.work_type !== "-"
                    ? `(${attendance.work_type})`
                    : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-600 flex-wrap">
              <span>
                Masuk:{" "}
                <strong className="text-blue-600">
                  {formatTime(attendance?.clock_in)}
                </strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                Pulang:{" "}
                <strong className="text-emerald-600">
                  {formatTime(attendance?.clock_out)}
                </strong>
                {renderTimeSummary()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isSuperUser && onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Kelola Absen Pegawai</span>
            </button>
          )}

          {loading ? (
            <span className="text-xs text-slate-400 font-medium">
              Memuat status...
            </span>
          ) : !isToday ? (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200">
              {selectedDate < todayStr
                ? "📅 Tanggal Lampau"
                : "📅 Tanggal Mendatang"}
            </span>
          ) : !attendance?.clock_in &&
            attendance?.status !== "Sakit" &&
            attendance?.status !== "Izin" ? (
            <button
              onClick={() => {
                setShowModal(true);
                setAttendanceStatus("Hadir");
                setPhotoBase64("");
                setAttachmentBase64("");
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm w-full md:w-auto justify-center"
            >
              <LogIn className="w-4 h-4" />
              <span>Absen / Izin Masuk</span>
            </button>
          ) : attendance?.clock_in &&
            !attendance?.clock_out &&
            attendance?.status === "Hadir" ? (
            <button
              disabled={submitting}
              onClick={handleClockOut}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm w-full md:w-auto justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{submitting ? "Memproses..." : "Absen Pulang"}</span>
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2.5 rounded-xl border">
              Status Hari Ini: {attendance?.status}{" "}
              {attendance?.clock_out ? "(Selesai)" : ""}
            </span>
          )}
        </div>
      </div>

      {/* MODAL ABSEN / IZIN / SAKIT MANDIRI */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Form Kehadiran /
                Izin
              </h3>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setShowModal(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pilihan Status Kehadiran */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Pilih Status:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Hadir", "Sakit", "Izin"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setAttendanceStatus(st);
                      if (st !== "Hadir") stopCamera();
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      attendanceStatus === st
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Jika Status HADIR */}
            {attendanceStatus === "Hadir" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Lokasi Kerja:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWorkType("WFO")}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        workType === "WFO"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      WFO (Kantor)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkType("WFA")}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        workType === "WFA"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      WFA (Remote)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                  {photoBase64 ? (
                    <div className="text-center space-y-2">
                      <img
                        src={photoBase64}
                        alt="Selfie"
                        className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoBase64("");
                          startCamera();
                        }}
                        className="text-xs text-blue-600 font-semibold flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Foto Ulang
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 w-full flex flex-col items-center">
                      <video
                        ref={videoRef}
                        className={`w-32 h-32 object-cover rounded-full border-4 border-blue-500 bg-black ${isCameraActive ? "block" : "hidden"}`}
                        autoPlay
                        playsInline
                        muted
                      />
                      {isCameraActive ? (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                        >
                          📸 Ambil Foto
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
                        >
                          <Camera className="w-4 h-4" /> Buka Kamera Wajah
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Jika Status SAKIT / IZIN (Upload Surat) */}
            {(attendanceStatus === "Sakit" || attendanceStatus === "Izin") && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">
                  Upload Surat {attendanceStatus} (Foto/PDF):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                  {attachmentBase64 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold">
                        <FileText className="w-4 h-4" /> Surat berhasil diunggah
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachmentBase64("")}
                        className="text-xs text-red-500 hover:underline font-medium"
                      >
                        Ganti File
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-xs text-slate-600 font-medium">
                        Klik untuk pilih file surat
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setShowModal(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  submitting ||
                  (attendanceStatus === "Hadir" && !photoBase64) ||
                  ((attendanceStatus === "Sakit" ||
                    attendanceStatus === "Izin") &&
                    !attachmentBase64)
                }
                onClick={handleSubmitAttendance}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {submitting ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
