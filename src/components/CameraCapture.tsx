"use client";

import React, { useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    // Buat canvas berukuran sangat kecil (misal: 200x200 px) untuk kompresi maksimal
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 200, 200);
      // Kompres ke JPEG dengan kualitas 0.4 (ukuran < 30KB)
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.4);
      setPhoto(compressedBase64);
      onCapture(compressedBase64);

      // Matikan stream kamera setelah foto diambil
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 my-3">
      {!isCameraActive && !photo && (
        <button
          type="button"
          onClick={startCamera}
          className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
        >
          📷 Buka Kamera Wajah
        </button>
      )}

      {isCameraActive && (
        <div className="flex flex-col items-center gap-2">
          <video
            ref={videoRef}
            className="w-48 h-48 object-cover rounded-full border-2 border-blue-500"
            autoPlay
            playsInline
          />
          <button
            type="button"
            onClick={capturePhoto}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            📸 Ambil Foto
          </button>
        </div>
      )}

      {photo && (
        <div className="flex flex-col items-center gap-2">
          <img
            src={photo}
            alt="Foto Absen"
            className="w-24 h-24 object-cover rounded-full border-2 border-green-500"
          />
          <button
            type="button"
            onClick={() => {
              setPhoto(null);
              startCamera();
            }}
            className="text-xs text-blue-600 underline"
          >
            Foto Ulang
          </button>
        </div>
      )}
    </div>
  );
}
