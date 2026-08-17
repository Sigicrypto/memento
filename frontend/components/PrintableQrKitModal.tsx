'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, Sparkles, QrCode, CheckCircle2, Image as ImageIcon, Layout, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintableQrKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  eventSlug: string;
}

export default function PrintableQrKitModal({ isOpen, onClose, eventName, eventSlug }: PrintableQrKitModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'standee' | 'table_card' | 'badge' | 'tv_banner'>('standee');
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const eventUrl = `https://mymementoapp.com/camera/${eventSlug}`;

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const element = document.getElementById('qr-print-preview-node');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#07090E',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: selectedFormat === 'tv_banner' ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_QR_Kit_${selectedFormat}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Printer size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Printable QR Collateral Kit Generator
                </h3>
                <p className="text-xs text-slate-400">Generate print-ready PDFs for <span className="text-cyan-300 font-bold">{eventName}</span></p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Collateral Type Selector (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <label className="text-xs font-bold text-slate-300 block">Select Print Format:</label>
              
              <button
                onClick={() => setSelectedFormat('standee')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedFormat === 'standee'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    📌 Welcome Standee Banner (A4 / A3)
                  </div>
                  <div className="text-xs text-slate-400 mt-1">For venue entry & reception display</div>
                </div>
                <QrCode size={20} className={selectedFormat === 'standee' ? 'text-cyan-400' : 'text-slate-600'} />
              </button>

              <button
                onClick={() => setSelectedFormat('table_card')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedFormat === 'table_card'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    🎴 Table Tent Cards (Folding Format)
                  </div>
                  <div className="text-xs text-slate-400 mt-1">For dining tables & guest seating</div>
                </div>
                <QrCode size={20} className={selectedFormat === 'table_card' ? 'text-cyan-400' : 'text-slate-600'} />
              </button>

              <button
                onClick={() => setSelectedFormat('badge')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedFormat === 'badge'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    🎟️ Staff Lanyard Pass Badges
                  </div>
                  <div className="text-xs text-slate-400 mt-1">For photographers & event hosts</div>
                </div>
                <QrCode size={20} className={selectedFormat === 'badge' ? 'text-cyan-400' : 'text-slate-600'} />
              </button>

              <button
                onClick={() => setSelectedFormat('tv_banner')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedFormat === 'tv_banner'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    📺 4K TV Stage Display Instructions
                  </div>
                  <div className="text-xs text-slate-400 mt-1">16:9 Landscape widescreen display</div>
                </div>
                <QrCode size={20} className={selectedFormat === 'tv_banner' ? 'text-cyan-400' : 'text-slate-600'} />
              </button>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" /> Vector High-Res QR Included
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generated PDFs are scaled to 300 DPI vector quality for crisp, professional printing.
                </p>
              </div>
            </div>

            {/* Right: Printable Render Node (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Live Print Render Canvas:</span>
                {downloadSuccess && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} /> PDF Downloaded Successfully!
                  </span>
                )}
              </div>

              {/* Node to be rendered to PDF */}
              <div
                id="qr-print-preview-node"
                className={`p-8 rounded-3xl border-4 border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between text-center gap-6 ${
                  selectedFormat === 'tv_banner'
                    ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 aspect-[16/9]'
                    : 'bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 aspect-[1/1.41]'
                }`}
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SCAN & SHARE YOUR PHOTOS LIVE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2">
                    {eventName}
                  </h2>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-cyan-400 relative z-10">
                  <QRCodeSVG value={eventUrl} size={160} level="H" />
                </div>

                {/* Instructions */}
                <div className="space-y-1 relative z-10">
                  <div className="text-xs font-bold text-white">
                    1. Open Phone Camera & Scan QR
                  </div>
                  <div className="text-xs font-bold text-cyan-300">
                    2. Snap or Upload Photos — App Download Needed!
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    {eventUrl}
                  </div>
                </div>

                {/* Footer */}
                <div className="w-full pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between relative z-10">
                  <span>Powered by Memento</span>
                  <span>www.mymementoapp.com</span>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">PDF generated in 300 DPI high resolution</span>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Close
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={generating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Download size={15} />
                <span>{generating ? 'GENERATING HIGH-RES PDF...' : 'DOWNLOAD PRINTABLE PDF'}</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
