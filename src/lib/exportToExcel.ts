// import ExcelJS from "exceljs";
// import { supabase } from "@/src/lib/supabase";

// export interface ActivityItem {
//   id: string | number;
//   date: string;
//   startTime: string;
//   endTime: string;
//   task: string;
//   output?: string;
//   status: string;
//   category: string;
// }

// export const exportMonthlyExcel = async (
//   activities: ActivityItem[],
//   selectedDate: string,
//   userInfo?: { full_name?: string; nip?: string; position?: string }
// ) => {
//   const refDate = new Date(selectedDate);
//   const year = refDate.getFullYear();
//   const month = refDate.getMonth();

//   const startDate = new Date(year, month - 1, 21);
//   const endDate = new Date(year, month, 20);

//   const startStr = startDate.toISOString().split("T")[0];
//   const endStr = endDate.toISOString().split("T")[0];

//   const rangeActivities = activities.filter(
//     (act) => act.date >= startStr && act.date <= endStr
//   );

//   if (rangeActivities.length === 0) {
//     alert(`Tidak ada data kegiatan untuk periode ${startStr} s.d. ${endStr}`);
//     return;
//   }

//   const { data: attendancesData } = await supabase
//     .from("attendances")
//     .select("*")
//     .gte("date", startStr)
//     .lte("date", endStr);

//   const attendanceMap: { [date: string]: { clock_in?: string; clock_out?: string } } = {};
//   if (attendancesData) {
//     attendancesData.forEach((att) => {
//       attendanceMap[att.date] = {
//         clock_in: att.clock_in ? att.clock_in.substring(0, 5) : "--:--",
//         clock_out: att.clock_out ? att.clock_out.substring(0, 5) : "--:--",
//       };
//     });
//   }

//   const groupedData: { [key: string]: ActivityItem[] } = {};
//   rangeActivities.forEach((act) => {
//     if (!groupedData[act.date]) groupedData[act.date] = [];
//     groupedData[act.date].push(act);
//   });

//   const sortedDates = Object.keys(groupedData).sort();

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Laporan Kinerja");

//   worksheet.pageSetup = {
//     paperSize: 9, // A4
//     orientation: "portrait",
//     fitToWidth: 1,
//     fitToHeight: 0,
//     margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
//   };

//   worksheet.views = [{ showGridLines: true }];

//   // 1. HEADER
//   worksheet.mergeCells("A1:H1");
//   const title1 = worksheet.getCell("A1");
//   title1.value = "Laporan Kinerja Pegawai Sekretariat KPU Kota Bima";
//   title1.font = { name: "Calibri", size: 12, bold: true };
//   title1.alignment = { horizontal: "center", vertical: "middle" };

//   const monthNames = [
//     "Januari", "Februari", "Maret", "April", "Mei", "Juni",
//     "Juli", "Agustus", "September", "Oktober", "November", "Desember"
//   ];
//   const monthName = monthNames[month];

//   worksheet.mergeCells("A2:H2");
//   const title2 = worksheet.getCell("A2");
//   title2.value = `Bulan ${monthName} Periode ${startStr} s/d ${endStr}`;
//   title2.font = { name: "Calibri", size: 11, bold: true };
//   title2.alignment = { horizontal: "center", vertical: "middle" };

//   worksheet.addRow([]);

//   // Identitas Pegawai
//   worksheet.mergeCells("A4:B4"); worksheet.mergeCells("C4:H4");
//   worksheet.getCell("A4").value = "NAMA"; worksheet.getCell("C4").value = `: ${userInfo?.full_name || "Muhammad Zainul Mubarok"}`;
//   worksheet.getCell("A4").font = { bold: true, name: "Calibri", size: 10 };
//   worksheet.getCell("C4").font = { bold: true, name: "Calibri", size: 10 };

//   worksheet.mergeCells("A5:B5"); worksheet.mergeCells("C5:H5");
//   worksheet.getCell("A5").value = "NIP"; worksheet.getCell("C5").value = `: ${userInfo?.nip || "199502112025061003"}`;
//   worksheet.getCell("A5").font = { bold: true, name: "Calibri", size: 10 };
//   worksheet.getCell("C5").font = { bold: true, name: "Calibri", size: 10 };

//   worksheet.mergeCells("A6:B6"); worksheet.mergeCells("C6:H6");
//   worksheet.getCell("A6").value = "JABATAN"; worksheet.getCell("C6").value = `: ${userInfo?.position || "Penata Kelola Sistem dan Teknologi Informasi"}`;
//   worksheet.getCell("A6").font = { bold: true, name: "Calibri", size: 10 };
//   worksheet.getCell("C6").font = { bold: true, name: "Calibri", size: 10 };

//   worksheet.addRow([]);

//   // 2. HEADER TABEL
//   const headers = ["NO", "Tanggal", "Absen Masuk", "Absen Pulang", "Jam Mulai", "Jam Selesai", "Deskripsi Kegiatan", "Output / Hasil"];
//   const headerRow = worksheet.addRow(headers);
//   headerRow.height = 28;

//   headerRow.eachCell((cell) => {
//     cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
//     cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF000000" } };
//     cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
//     cell.border = {
//       top: { style: "thin", color: { argb: "FF000000" } },
//       left: { style: "thin", color: { argb: "FF000000" } },
//       bottom: { style: "thin", color: { argb: "FF000000" } },
//       right: { style: "thin", color: { argb: "FF000000" } },
//     };
//   });

//   // 3. ISI DATA TABEL
//   let currentRow = 9;
//   let globalNo = 1;

//   sortedDates.forEach((dateStr) => {
//     const dayActs = groupedData[dateStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
//     const startRowDate = currentRow;
//     const attInfo = attendanceMap[dateStr] || { clock_in: "--:--", clock_out: "--:--" };

//     dayActs.forEach((act) => {
//       const isBreak = act.category === "Istirahat";
//       const descriptionText = isBreak ? `[Istirahat] ${act.task}` : act.task;
//       const outputText = isBreak ? "-" : act.output || "-";

//       const row = worksheet.addRow([
//         globalNo, dateStr, attInfo.clock_in, attInfo.clock_out,
//         act.startTime, act.endTime, descriptionText, outputText,
//       ]);
//       row.height = 22;

//       row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
//         cell.font = { name: "Calibri", size: 9 };
//         cell.border = {
//           top: { style: "thin", color: { argb: "FF000000" } },
//           left: { style: "thin", color: { argb: "FF000000" } },
//           bottom: { style: "thin", color: { argb: "FF000000" } },
//           right: { style: "thin", color: { argb: "FF000000" } },
//         };
//         if (colNumber >= 1 && colNumber <= 6) {
//           cell.alignment = { horizontal: "center", vertical: "middle" };
//         } else {
//           cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
//         }
//       });
//       currentRow++;
//     });

//     const endRowDate = currentRow - 1;
//     if (dayActs.length > 1) {
//       worksheet.mergeCells(`A${startRowDate}:A${endRowDate}`);
//       worksheet.mergeCells(`B${startRowDate}:B${endRowDate}`);
//       worksheet.mergeCells(`C${startRowDate}:C${endRowDate}`);
//       worksheet.mergeCells(`D${startRowDate}:D${endRowDate}`);
//     }

//     ["A", "B", "C", "D"].forEach((col) => {
//       const cell = worksheet.getCell(`${col}${startRowDate}`);
//       cell.alignment = { horizontal: "center", vertical: "middle" };
//       cell.font = { name: "Calibri", size: 9 };
//     });

//     globalNo++;
//   });

//   // ==================== 4. FOOTER TANDA TANGAN ====================
//   worksheet.addRow([]);
//   worksheet.addRow([]);

//   const rSigTop = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rSigTop}:D${rSigTop}`); // Kasubbag (A-D)
//   worksheet.mergeCells(`G${rSigTop}:H${rSigTop}`); // Yang Membuat (G-H)
  
//   worksheet.getCell(`A${rSigTop}`).value = "Kepala Subbagian Keuangan,\nUmum, dan Logistik";
//   worksheet.getCell(`G${rSigTop}`).value = "Yang Membuat,\nKota Bima, 21 September 2026";
  
//   worksheet.getCell(`A${rSigTop}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`G${rSigTop}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`A${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };
//   worksheet.getCell(`G${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };

//   // Spasi Tanda Tangan
//   worksheet.addRow([]);
//   worksheet.addRow([]);
//   worksheet.addRow([]);

//   const rSigName = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rSigName}:D${rSigName}`);
//   worksheet.mergeCells(`G${rSigName}:H${rSigName}`);
  
//   worksheet.getCell(`A${rSigName}`).value = "Amirullah, ST";
//   worksheet.getCell(`G${rSigName}`).value = userInfo?.full_name || "Muhammad Zainul Mubarok";
  
//   worksheet.getCell(`A${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
//   worksheet.getCell(`G${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
//   worksheet.getCell(`A${rSigName}`).alignment = { horizontal: "center" };
//   worksheet.getCell(`G${rSigName}`).alignment = { horizontal: "center" };

//   const rSigNip = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rSigNip}:D${rSigNip}`);
//   worksheet.mergeCells(`G${rSigNip}:H${rSigNip}`);
  
//   worksheet.getCell(`A${rSigNip}`).value = "NIP. 197704152014061004";
//   worksheet.getCell(`G${rSigNip}`).value = `NIP. ${userInfo?.nip || "199502112025061003"}`;
  
//   worksheet.getCell(`A${rSigNip}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`G${rSigNip}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`A${rSigNip}`).alignment = { horizontal: "center" };
//   worksheet.getCell(`G${rSigNip}`).alignment = { horizontal: "center" };

//   worksheet.addRow([]);
//   worksheet.addRow([]);

//   // Sekretaris (Kolom A sampai H)
//   const rMengetahui = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rMengetahui}:H${rMengetahui}`);
//   worksheet.getCell(`A${rMengetahui}`).value = "Mengetahui,";
//   worksheet.getCell(`A${rMengetahui}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`A${rMengetahui}`).alignment = { horizontal: "center" };

//   const rSekretaris = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rSekretaris}:H${rSekretaris}`);
//   worksheet.getCell(`A${rSekretaris}`).value = "Sekretaris KPU Kota Bima";
//   worksheet.getCell(`A${rSekretaris}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`A${rSekretaris}`).alignment = { horizontal: "center" };

//   worksheet.addRow([]);
//   worksheet.addRow([]);
//   worksheet.addRow([]);

//   const rSekNama = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rSekNama}:H${rSekNama}`);
//   worksheet.getCell(`A${rSekNama}`).value = "H. Irham";
//   worksheet.getCell(`A${rSekNama}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
//   worksheet.getCell(`A${rSekNama}`).alignment = { horizontal: "center" };

//   const rSekNip = worksheet.rowCount + 1;
//   worksheet.mergeCells(`A${rSekNip}:H${rSekNip}`);
//   worksheet.getCell(`A${rSekNip}`).value = "NIP. 196812311994031096";
//   worksheet.getCell(`A${rSekNip}`).font = { name: "Calibri", size: 9 };
//   worksheet.getCell(`A${rSekNip}`).alignment = { horizontal: "center" };

//   // ==================== 5. LEBAR KOLOM ====================
//   worksheet.getColumn(1).width = 4;   // NO
//   worksheet.getColumn(2).width = 11;  // Tanggal
//   worksheet.getColumn(3).width = 10;  // Absen Masuk
//   worksheet.getColumn(4).width = 10;  // Absen Pulang
//   worksheet.getColumn(5).width = 8;   // Jam Mulai
//   worksheet.getColumn(6).width = 8;   // Jam Selesai
//   worksheet.getColumn(7).width = 25;  // Deskripsi Kegiatan
//   worksheet.getColumn(8).width = 18;  // Output / Hasil

//   // ==================== 6. DOWNLOAD ====================
//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `Laporan_Kinerja_${startStr}_sd_${endStr}.xlsx`;
//   a.click();
//   window.URL.revokeObjectURL(url);
// };

import ExcelJS from "exceljs";
import { supabase } from "@/src/lib/supabase";

export interface ActivityItem {
  id: string | number;
  date: string;
  startTime: string;
  endTime: string;
  task: string;
  output?: string;
  status: string;
  category: string;
}

export interface UserInfo {
  full_name?: string;
  nip?: string;
  position?: string;
  role?: "staff" | "kasubbag" | "sekretaris" | "admin";
  kasubbag_name?: string;
  kasubbag_nip?: string;
  kasubbag_position?: string;
}

export const exportMonthlyExcel = async (
  activities: ActivityItem[],
  selectedDate: string,
  userInfo?: UserInfo
) => {
  const refDate = new Date(selectedDate);
  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  // Helper untuk format YYYY-MM-DD aman dari pergeseran timezone (supaya pas sampai tanggal 20)
  const padZero = (num: number) => String(num).padStart(2, "0");

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const startStr = `${prevYear}-${padZero(prevMonth + 1)}-21`;
  const endStr = `${year}-${padZero(month + 1)}-20`;

  const rangeActivities = activities.filter(
    (act) => act.date >= startStr && act.date <= endStr
  );

  if (rangeActivities.length === 0) {
    alert(`Tidak ada data kegiatan untuk periode ${startStr} s.d. ${endStr}`);
    return;
  }

  const { data: attendancesData } = await supabase
    .from("attendances")
    .select("*")
    .gte("date", startStr)
    .lte("date", endStr);

  const attendanceMap: { [date: string]: { clock_in?: string; clock_out?: string } } = {};
  if (attendancesData) {
    attendancesData.forEach((att) => {
      attendanceMap[att.date] = {
        clock_in: att.clock_in ? att.clock_in.substring(0, 5) : "--:--",
        clock_out: att.clock_out ? att.clock_out.substring(0, 5) : "--:--",
      };
    });
  }

  const groupedData: { [key: string]: ActivityItem[] } = {};
  rangeActivities.forEach((act) => {
    if (!groupedData[act.date]) groupedData[act.date] = [];
    groupedData[act.date].push(act);
  });

  const sortedDates = Object.keys(groupedData).sort();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Laporan Kinerja");

  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "portrait",
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
  };

  worksheet.views = [{ showGridLines: true }];

  // 1. HEADER
  worksheet.mergeCells("A1:H1");
  const title1 = worksheet.getCell("A1");
  title1.value = "Laporan Kinerja Pegawai Sekretariat KPU Kota Bima";
  title1.font = { name: "Calibri", size: 12, bold: true };
  title1.alignment = { horizontal: "center", vertical: "middle" };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = monthNames[month];

  worksheet.mergeCells("A2:H2");
  const title2 = worksheet.getCell("A2");
  title2.value = `Bulan ${monthName} Periode ${startStr} s/d ${endStr}`;
  title2.font = { name: "Calibri", size: 11, bold: true };
  title2.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]);

  // Identitas Pegawai
  worksheet.mergeCells("A4:B4"); worksheet.mergeCells("C4:H4");
  worksheet.getCell("A4").value = "NAMA"; worksheet.getCell("C4").value = `: ${userInfo?.full_name || "Muhammad Zainul Mubarok"}`;
  worksheet.getCell("A4").font = { bold: true, name: "Calibri", size: 10 };
  worksheet.getCell("C4").font = { bold: true, name: "Calibri", size: 10 };

  worksheet.mergeCells("A5:B5"); worksheet.mergeCells("C5:H5");
  worksheet.getCell("A5").value = "NIP"; worksheet.getCell("C5").value = `: ${userInfo?.nip || "199502112025061003"}`;
  worksheet.getCell("A5").font = { bold: true, name: "Calibri", size: 10 };
  worksheet.getCell("C5").font = { bold: true, name: "Calibri", size: 10 };

  worksheet.mergeCells("A6:B6"); worksheet.mergeCells("C6:H6");
  worksheet.getCell("A6").value = "JABATAN"; worksheet.getCell("C6").value = `: ${userInfo?.position || "Penata Kelola Sistem dan Teknologi Informasi"}`;
  worksheet.getCell("A6").font = { bold: true, name: "Calibri", size: 10 };
  worksheet.getCell("C6").font = { bold: true, name: "Calibri", size: 10 };

  worksheet.addRow([]);

  // 2. HEADER TABEL
  const headers = ["NO", "Tanggal", "Absen Masuk", "Absen Pulang", "Jam Mulai", "Jam Selesai", "Deskripsi Kegiatan", "Output / Hasil"];
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF000000" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // 3. ISI DATA TABEL
  let currentRow = 9;
  let globalNo = 1;

  sortedDates.forEach((dateStr) => {
    const dayActs = groupedData[dateStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const startRowDate = currentRow;
    const attInfo = attendanceMap[dateStr] || { clock_in: "--:--", clock_out: "--:--" };

    dayActs.forEach((act) => {
      const isBreak = act.category === "Istirahat";
      const descriptionText = isBreak ? `[Istirahat] ${act.task}` : act.task;
      const outputText = isBreak ? "-" : act.output || "-";

      const row = worksheet.addRow([
        globalNo, dateStr, attInfo.clock_in, attInfo.clock_out,
        act.startTime, act.endTime, descriptionText, outputText,
      ]);
      row.height = 22;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: "Calibri", size: 9 };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
        if (colNumber >= 1 && colNumber <= 6) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        }
      });
      currentRow++;
    });

    const endRowDate = currentRow - 1;
    if (dayActs.length > 1) {
      worksheet.mergeCells(`A${startRowDate}:A${endRowDate}`);
      worksheet.mergeCells(`B${startRowDate}:B${endRowDate}`);
      worksheet.mergeCells(`C${startRowDate}:C${endRowDate}`);
      worksheet.mergeCells(`D${startRowDate}:D${endRowDate}`);
    }

    ["A", "B", "C", "D"].forEach((col) => {
      const cell = worksheet.getCell(`${col}${startRowDate}`);
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { name: "Calibri", size: 9 };
    });

    globalNo++;
  });

  // ==================== 4. FOOTER TANDA TANGAN DINAMIS BERDASARKAN ROLE ====================
  worksheet.addRow([]);
  worksheet.addRow([]);

  const userRole = userInfo?.role || "staff";
  const currentDateStr = `Kota Bima, ${new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`;

  if (userRole === "staff") {
    const rSigTop = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSigTop}:D${rSigTop}`);
    worksheet.mergeCells(`G${rSigTop}:H${rSigTop}`);
    
    worksheet.getCell(`A${rSigTop}`).value = userInfo?.kasubbag_position || "Kasubbag Atasan";
    worksheet.getCell(`G${rSigTop}`).value = `Yang Membuat,\n${currentDateStr}`;
    
    worksheet.getCell(`A${rSigTop}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`G${rSigTop}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };
    worksheet.getCell(`G${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };

    worksheet.addRow([]); worksheet.addRow([]); worksheet.addRow([]);

    const rSigName = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSigName}:D${rSigName}`);
    worksheet.mergeCells(`G${rSigName}:H${rSigName}`);
    
    worksheet.getCell(`A${rSigName}`).value = userInfo?.kasubbag_name || "(Belum ada Kasubbag)";
    worksheet.getCell(`G${rSigName}`).value = userInfo?.full_name;
    
    worksheet.getCell(`A${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
    worksheet.getCell(`G${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
    worksheet.getCell(`A${rSigName}`).alignment = { horizontal: "center" };
    worksheet.getCell(`G${rSigName}`).alignment = { horizontal: "center" };

    const rSigNip = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSigNip}:D${rSigNip}`);
    worksheet.mergeCells(`G${rSigNip}:H${rSigNip}`);
    
    worksheet.getCell(`A${rSigNip}`).value = `NIP. ${userInfo?.kasubbag_nip || "-"}`;
    worksheet.getCell(`G${rSigNip}`).value = `NIP. ${userInfo?.nip || "-"}`;
    
    worksheet.getCell(`A${rSigNip}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`G${rSigNip}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rSigNip}`).alignment = { horizontal: "center" };
    worksheet.getCell(`G${rSigNip}`).alignment = { horizontal: "center" };

    worksheet.addRow([]); worksheet.addRow([]);

    const rMengetahui = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rMengetahui}:H${rMengetahui}`);
    worksheet.getCell(`A${rMengetahui}`).value = "Mengetahui,";
    worksheet.getCell(`A${rMengetahui}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rMengetahui}`).alignment = { horizontal: "center" };

    const rSekretaris = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSekretaris}:H${rSekretaris}`);
    worksheet.getCell(`A${rSekretaris}`).value = "Sekretaris KPU Kota Bima";
    worksheet.getCell(`A${rSekretaris}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rSekretaris}`).alignment = { horizontal: "center" };

    worksheet.addRow([]); worksheet.addRow([]); worksheet.addRow([]);

    const rSekNama = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSekNama}:H${rSekNama}`);
    worksheet.getCell(`A${rSekNama}`).value = "H. Irham";
    worksheet.getCell(`A${rSekNama}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
    worksheet.getCell(`A${rSekNama}`).alignment = { horizontal: "center" };

    const rSekNip = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSekNip}:H${rSekNip}`);
    worksheet.getCell(`A${rSekNip}`).value = "NIP. 196812311994031096";
    worksheet.getCell(`A${rSekNip}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rSekNip}`).alignment = { horizontal: "center" };

  } else if (userRole === "kasubbag") {
    const rSigTop = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSigTop}:D${rSigTop}`);
    worksheet.mergeCells(`G${rSigTop}:H${rSigTop}`);
    
    worksheet.getCell(`A${rSigTop}`).value = "Mengetahui,\nSekretaris KPU Kota Bima";
    worksheet.getCell(`G${rSigTop}`).value = `Yang Membuat,\n${currentDateStr}`;
    
    worksheet.getCell(`A${rSigTop}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`G${rSigTop}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };
    worksheet.getCell(`G${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };

    worksheet.addRow([]); worksheet.addRow([]); worksheet.addRow([]);

    const rSigName = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSigName}:D${rSigName}`);
    worksheet.mergeCells(`G${rSigName}:H${rSigName}`);
    
    worksheet.getCell(`A${rSigName}`).value = "H. Irham";
    worksheet.getCell(`G${rSigName}`).value = userInfo?.full_name;
    
    worksheet.getCell(`A${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
    worksheet.getCell(`G${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
    worksheet.getCell(`A${rSigName}`).alignment = { horizontal: "center" };
    worksheet.getCell(`G${rSigName}`).alignment = { horizontal: "center" };

    const rSigNip = worksheet.rowCount + 1;
    worksheet.mergeCells(`A${rSigNip}:D${rSigNip}`);
    worksheet.mergeCells(`G${rSigNip}:H${rSigNip}`);
    
    worksheet.getCell(`A${rSigNip}`).value = "NIP. 196812311994031096";
    worksheet.getCell(`G${rSigNip}`).value = `NIP. ${userInfo?.nip}`;
    
    worksheet.getCell(`A${rSigNip}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`G${rSigNip}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`A${rSigNip}`).alignment = { horizontal: "center" };
    worksheet.getCell(`G${rSigNip}`).alignment = { horizontal: "center" };

  } else if (userRole === "sekretaris") {
    const rSigTop = worksheet.rowCount + 1;
    worksheet.mergeCells(`G${rSigTop}:H${rSigTop}`);
    
    worksheet.getCell(`G${rSigTop}`).value = `Sekretaris KPU Kota Bima,\n${currentDateStr}`;
    worksheet.getCell(`G${rSigTop}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`G${rSigTop}`).alignment = { horizontal: "center", vertical: "top", wrapText: true };

    worksheet.addRow([]); worksheet.addRow([]); worksheet.addRow([]);

    const rSigName = worksheet.rowCount + 1;
    worksheet.mergeCells(`G${rSigName}:H${rSigName}`);
    
    worksheet.getCell(`G${rSigName}`).value = userInfo?.full_name || "H. Irham";
    worksheet.getCell(`G${rSigName}`).font = { name: "Calibri", size: 9, bold: true, underline: true };
    worksheet.getCell(`G${rSigName}`).alignment = { horizontal: "center" };

    const rSigNip = worksheet.rowCount + 1;
    worksheet.mergeCells(`G${rSigNip}:H${rSigNip}`);
    
    worksheet.getCell(`G${rSigNip}`).value = `NIP. ${userInfo?.nip}`;
    worksheet.getCell(`G${rSigNip}`).font = { name: "Calibri", size: 9 };
    worksheet.getCell(`G${rSigNip}`).alignment = { horizontal: "center" };
  }

  // ==================== 5. LEBAR KOLOM ====================
  worksheet.getColumn(1).width = 4;   // NO
  worksheet.getColumn(2).width = 11;  // Tanggal
  worksheet.getColumn(3).width = 10;  // Absen Masuk
  worksheet.getColumn(4).width = 10;  // Absen Pulang
  worksheet.getColumn(5).width = 8;   // Jam Mulai
  worksheet.getColumn(6).width = 8;   // Jam Selesai
  worksheet.getColumn(7).width = 25;  // Deskripsi Kegiatan
  worksheet.getColumn(8).width = 18;  // Output / Hasil

  // ==================== 6. DOWNLOAD ====================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_Kinerja_${startStr}_sd_${endStr}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};