"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer, Sparkles, Image as ImageIcon, FileText, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface EventData {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function QRAssetsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<"table" | "welcome" | "invitation" | "screen">("table");
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;
      const { data } = await supabase.from("events").select("id, name, slug, created_at").eq("id", eventId).single();
      if (data) {
        setEvent(data);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [eventId]);

  const getUploadUrl = () => {
    if (!event) return "";
    return `${window.location.origin}/mobile/${event.slug}`;
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff" });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${event?.slug || "event"}-qr-${selectedTemplate}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    }
    setIsDownloading(false);
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${event?.slug || "event"}-qr-${selectedTemplate}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setIsDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <p>Event not found.</p>
        <Link href="/dashboard" className="text-cyan-400 underline">Back to Dashboard</Link>
      </div>
    );
  }

  const uploadUrl = getUploadUrl();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 flex-wrap gap-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <h1 className="text-xl font-extrabold text-white">Printable QR Assets — {event.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CONTROLS & TEMPLATES (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-white/10 p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">1. Select Asset Template</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTemplate("table")}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedTemplate === "table" ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  🍽️ Table Card QR
                </button>
                <button
                  onClick={() => setSelectedTemplate("welcome")}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedTemplate === "welcome" ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  🚪 Welcome Sign QR
                </button>
                <button
                  onClick={() => setSelectedTemplate("invitation")}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedTemplate === "invitation" ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  💌 Invitation Insert QR
                </button>
                <button
                  onClick={() => setSelectedTemplate("screen")}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedTemplate === "screen" ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  📺 Screen Poster QR
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">2. Export Formats</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownloadPNG}
                  disabled={isDownloading}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download High-Res PNG</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText size={16} />
                  <span>Download Ready-to-Print PDF</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-400">
              <p className="font-bold text-slate-300 mb-1">💡 Print Tip:</p>
              For best scanning performance at tables, print on 300 GSM matte cardstock paper.
            </div>
          </div>

          {/* RIGHT: PREVIEW CARD (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">Print Preview</h3>

            {/* PRINTABLE CARD DESIGN CANVAS */}
            <div
              ref={cardRef}
              className="w-full max-w-[380px] bg-white text-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center border-4 border-slate-200"
              style={{ minHeight: "480px" }}
            >
              <div className="mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                  MEMENTO PHOTO MEMORIES
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-3 mb-1 leading-tight">
                {event.name}
              </h2>

              <p className="text-slate-500 text-xs font-medium mb-6">
                {selectedTemplate === "table" && "Scan with your phone camera to share your photos live!"}
                {selectedTemplate === "welcome" && "Welcome! Scan to capture and share moments with us!"}
                {selectedTemplate === "invitation" && "Save this card! Scan on event day to join our album."}
                {selectedTemplate === "screen" && "See your photos on screen! Scan & upload now."}
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner mb-6">
                <QRCodeSVG value={uploadUrl} size={180} />
              </div>

              <div className="mt-auto space-y-1">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  No App · No Login · Just Scan & Snap
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {uploadUrl}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
