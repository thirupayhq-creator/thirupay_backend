import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, CheckCircle2, Download, Share2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { db, genId } from "../../data/mockData";
import { PAYMENT_MODES } from "../../data/paymentModes";
import { useToast } from "../../context/ToastContext";

export default function QRGenerate() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const merchant = db.getMerchantById(session.merchantId);
  const qrValue = `thirupay://pay?merchant=${merchant.merchant_id}`;
  const [paid, setPaid] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const qrCanvasRef = useRef(null);
  const [lastAmount, setLastAmount] = useState(null);

  const simulatePayment = (payMode) => {
    const amount = Math.floor(Math.random() * 900) + 100;
    const txn = {
      transaction_id: genId("txn"),
      merchant_id: merchant.merchant_id,
      amount,
      payment_method: "QR",
      payment_mode: payMode,
      status: "success",
      created_at: new Date().toISOString(),
    };
    db.addTxn(txn);
    // auto-generate a settlement entry pending state
    db.addSettlement({
      settlement_id: genId("st"),
      merchant_id: merchant.merchant_id,
      amount: txn.amount,
      settlement_date: new Date(Date.now() + 86400000).toISOString(),
      status: "pending",
    });
    setShowModePicker(false);
    setPaid(true);
    setLastAmount(amount);
    setTimeout(() => setPaid(false), 3500);
    showToast({
      title: `₹${txn.amount.toLocaleString("en-IN")} received!`,
      subtitle: `via ${payMode}`,
      type: "success",
    });
  };

  const [shareState, setShareState] = useState("idle"); // idle | sharing | copied | unsupported

  const buildQrCardCanvas = () => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) return null;

    const W = 440;
    const H = 620;
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d");

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    // Green header band
    ctx.fillStyle = "#0B2A4A";
    ctx.fillRect(0, 0, W, 110);

    // Logo text "ThiruPay"
    ctx.textAlign = "center";
    ctx.font = "700 28px Sora, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    const logoThiru = "Thiru ";
    const logoPay = "Pay";
    const thiruWidth = ctx.measureText(logoThiru).width;
    const payWidth = ctx.measureText(logoPay).width;
    const totalWidth = thiruWidth + payWidth;
    const startX = W / 2 - totalWidth / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(logoThiru, startX, 50);
    ctx.fillStyle = "#3D6EA0";
    ctx.fillText(logoPay, startX + thiruWidth, 50);

    ctx.textAlign = "center";
    ctx.font = "500 13px Inter, sans-serif";
    ctx.fillStyle = "#9DB9DA";
    ctx.fillText("Scan & Pay via any UPI app", W / 2, 76);

    // Merchant name
    ctx.fillStyle = "#0B2A4A";
    ctx.font = "700 20px Sora, sans-serif";
    ctx.fillText(merchant.business_name, W / 2, 150);
    ctx.font = "500 12px Inter, sans-serif";
    ctx.fillStyle = "#3D6EA0";
    ctx.fillText(merchant.owner_name, W / 2, 170);

    // QR frame
    const qrSize = 260;
    const qrX = W / 2 - qrSize / 2;
    const qrY = 195;
    ctx.strokeStyle = "#EAF1F8";
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Footer tagline
    ctx.fillStyle = "#69D3A2";
    ctx.font = "500 12px Inter, sans-serif";
    ctx.fillText("Powered by ThiruPay", W / 2, H - 24);

    return out;
  };

  const downloadQR = () => {
    const canvas = buildQrCardCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ThiruPay_QR_${merchant.business_name.replace(/\s+/g, "")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareQR = async () => {
    const canvas = buildQrCardCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileName = `ThiruPay_QR_${merchant.business_name.replace(/\s+/g, "")}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const shareText = `Scan this QR to pay ${merchant.business_name} via ThiruPay!`;

      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          setShareState("sharing");
          await navigator.share({ files: [file], title: "ThiruPay QR", text: shareText });
          setShareState("idle");
          return;
        }
        if (navigator.share) {
          setShareState("sharing");
          await navigator.share({ title: "ThiruPay QR", text: shareText });
          setShareState("idle");
          return;
        }
        throw new Error("no share api");
      } catch (err) {
        if (err?.name === "AbortError") {
          setShareState("idle");
          return;
        }
        // Fallback: copy a shareable message + trigger download so they can attach it manually
        try {
          await navigator.clipboard?.writeText(shareText);
          setShareState("copied");
        } catch {
          setShareState("unsupported");
        }
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setTimeout(() => setShareState("idle"), 2200);
      }
    }, "image/png");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">{t("generateQR")}</h1>
      <p className="text-sm text-green-300 mb-6">{t("qrSubtitle")}</p>

      <div className="card p-8 flex flex-col items-center relative overflow-hidden">
        <AnimatePresence>
          {paid && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-card"
            >
              <CheckCircle2 size={16} /> ₹{lastAmount ?? "—"} received!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 bg-white rounded-2xl border-2 border-green-100 mb-4">
          <QRCodeCanvas ref={qrCanvasRef} value={qrValue} size={220} fgColor="#0B2A4A" level="M" />
        </div>
        <p className="font-semibold text-green-700 text-sm">{merchant.business_name}</p>
        <p className="text-xs text-green-300 mt-2 flex items-center gap-1.5">
          <QrCode size={13} /> {t("scanToPay")}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {PAYMENT_MODES.map((m) => (
            <span
              key={m.key}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: m.color, borderColor: m.color + "40", backgroundColor: m.color + "0D" }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button
            onClick={downloadQR}
            className="flex items-center gap-1.5 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={13} /> {t("downloadQR")}
          </button>
          <button
            onClick={shareQR}
            disabled={shareState === "sharing"}
            className="flex items-center gap-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            <Share2 size={13} />
            {shareState === "copied" ? t("copied") : shareState === "unsupported" ? t("downloadQR") : t("shareQR")}
          </button>
          {!showModePicker ? (
            <button
              onClick={() => setShowModePicker(true)}
              className="text-xs font-semibold text-green-400 border border-green-100 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              {t("simulateScanPay")}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 border border-green-100 rounded-lg px-2 py-1.5">
              <span className="text-[11px] text-green-400 pl-1 pr-0.5">Pay via:</span>
              {PAYMENT_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => simulatePayment(m.key)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: m.color }}
                >
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => setShowModePicker(false)}
                className="text-green-300 hover:text-green-500 px-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
