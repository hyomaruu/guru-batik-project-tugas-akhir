import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

interface ExportPDFOptions {
  title: string;
  columns: string[];
  data: (string | number)[][];
  filename?: string;
  signatureRole?: string;
  signatureName?: string;
}

export async function addLetterhead(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    const img = new Image();
    img.src = "/logo.png";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    const logoHeight = 18;
    const ratio = img.width / img.height;
    const logoWidth = logoHeight * ratio;
    
    // Total block width approx 110mm
    const startX = (pageWidth - 110) / 2;
    
    doc.addImage(img, "PNG", startX, 14, logoWidth, logoHeight);
    
    // Vertical line (solid, light gray)
    const lineX = startX + logoWidth + 6;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(lineX, 14, lineX, 14 + logoHeight);
    
    // Text on the right
    const textX = lineX + 6;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SCIENCE IN TRADITIONAL WAY", textX, 17);
    
    doc.setTextColor(70, 70, 70);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Gejayan, Gang Guru, Gang Komojoyo No. 8", textX, 21.5);
    doc.text("Mrican, Caturtunggal, Depok, Sleman, Yogyakarta", textX, 25.5);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("WA:", textX, 30);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    doc.text("087881897763", textX + 6, 30);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Email:", textX + 27, 30);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    doc.text("tokogurubatik@gmail.com", textX + 36, 30);
  } catch (e) {
    console.error("Gagal memuat logo", e);
  }

  // Draw horizontal line at the bottom of header
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 36, pageWidth - 14, 36);
  doc.setLineWidth(1.5);
  doc.line(14, 37.5, pageWidth - 14, 37.5);
}

export async function exportToPDF({
  title,
  columns,
  data,
  filename = "laporan.pdf",
  signatureRole = "Guru Batik",
  signatureName,
}: ExportPDFOptions) {
  if (!signatureName && typeof window !== "undefined") {
    signatureName = localStorage.getItem("gb_username") || "Admin";
  }
  
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4"
  });
  const pageHeight = doc.internal.pageSize.getHeight();

  await addLetterhead(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), pageWidth / 2, 45, { align: "center" });

  // 3. TABEL
  const limitedData = data.slice(0, 10);
  const autoTableOptions: UserOptions = {
    startY: 55,
    head: [columns],
    body: limitedData,
    styles: { fontSize: 9, font: "helvetica" },
    headStyles: { fillColor: [30, 41, 59] }, // warna biru gelap/slate (menyesuaikan warna teks tailwind)
    alternateRowStyles: { fillColor: [241, 245, 249] }, // warna canvas-soft
    margin: { left: 14, right: 14, bottom: 40 },
  };

  autoTable(doc, autoTableOptions);

  // 4. TANDA TANGAN
  // Dapatkan posisi Y akhir dari tabel (untuk mengetahui di mana menggambar tanda tangan)
  const finalY = (doc as any).lastAutoTable.finalY || 55;

  // Tempatkan tanda tangan di pojok kanan bawah halaman
  const signatureY = pageHeight - 40;

  // Center of the signature block on the right side
  const rightCenter = pageWidth - 40;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sleman, Kamis, 23 Juli 2026", rightCenter, signatureY, { align: "center" });
  doc.text("Pemilik Usaha Guru Batik,", rightCenter, signatureY + 6, { align: "center" });

  // Ruang kosong untuk cap/tanda tangan
  doc.text("( .................................................... )", rightCenter, signatureY + 30, { align: "center" });

  // 5. SIMPAN PDF
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
