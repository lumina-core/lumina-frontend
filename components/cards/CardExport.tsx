"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";

interface CardExportProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function CardExport({ cardRef, filename = "card" }: CardExportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // 高清导出
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      {exporting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Download className="w-5 h-5" />
      )}
      {exporting ? "导出中..." : "导出图片"}
    </button>
  );
}
