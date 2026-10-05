import { jsPDF } from "jspdf";
import { computeFee } from "../data/feeConfig";

// Builds and downloads a simple branded receipt PDF for one transaction.
// merchant: { business_name, owner_name, city, state }
// txn: { transaction_id, amount, payment_method, payment_mode, status, created_at }
export function downloadReceiptPDF(txn, merchant) {
  const doc = new jsPDF({ unit: "pt", format: [320, 480] });
  const { fee, net } = computeFee(txn.amount);
  const green = "#0B2A4A";
  const lightGreen = "#3D6EA0";
  const gray = "#6B7280";

  // Header band
  doc.setFillColor(24, 83, 56);
  doc.rect(0, 0, 320, 70, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ThiruPay", 160, 32, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#C9DAEC");
  doc.text("Payment Receipt", 160, 50, { align: "center" });

  let y = 100;
  doc.setTextColor(green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`₹${Number(txn.amount).toLocaleString("en-IN")}`, 160, y, { align: "center" });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(txn.status === "success" ? lightGreen : "#DC2626");
  doc.text((txn.status || "success").toUpperCase(), 160, y, { align: "center" });

  y += 30;
  doc.setDrawColor(235, 249, 243);
  doc.line(24, y, 296, y);
  y += 24;

  const rows = [
    ["Business", merchant?.business_name || "-"],
    ["Transaction ID", txn.transaction_id],
    ["Date & Time", new Date(txn.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })],
    ["Paid via", `${txn.payment_method}${txn.payment_mode ? " · " + txn.payment_mode : ""}`],
    ["Amount", `₹${Number(txn.amount).toLocaleString("en-IN")}`],
    ["Fee (MDR)", `₹${fee.toLocaleString("en-IN")}`],
    ["Net settled", `₹${net.toLocaleString("en-IN")}`],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setTextColor(gray);
    doc.setFont("helvetica", "normal");
    doc.text(label, 24, y);
    doc.setTextColor(green);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), 296, y, { align: "right" });
    y += 22;
  });

  y += 10;
  doc.setDrawColor(235, 249, 243);
  doc.line(24, y, 296, y);
  y += 24;

  doc.setFontSize(9);
  doc.setTextColor(lightGreen);
  doc.setFont("helvetica", "normal");
  doc.text("Powered by ThiruPay", 160, y, { align: "center" });

  doc.save(`ThiruPay_Receipt_${txn.transaction_id}.pdf`);
}
