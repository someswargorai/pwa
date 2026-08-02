"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, ImageIcon, Save, X, Upload, Sparkles, RotateCcw } from "lucide-react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";

export default function SaveImagePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) processFile(file);
  };

  const handleSave = async () => {
    if (!previewUrl) return;
    setIsSaving(true);
    const noteObj: Note = {
      id: Date.now().toString(),
      title: title.trim() || "Captured Image",
      content: "Image Note",
      tags: ["Image"],
      createdAt: Date.now(),
      color: "#dcfce7",
      imageUrl: previewUrl,
    };
    const existing = (await get("nexus_dashboard_notes")) || [];
    await set("nexus_dashboard_notes", [noteObj, ...existing]);
    setTimeout(() => router.push("/"), 400);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] flex flex-col z-50 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] right-[-5%] w-[60%] h-[55%] rounded-full blur-[140px] transition-all duration-1000 ${previewUrl ? 'bg-emerald-200/30' : 'bg-blue-100/20'}`} />
        <div className={`absolute bottom-[-10%] left-[-5%] w-[50%] h-[45%] rounded-full blur-[120px] transition-all duration-1000 ${previewUrl ? 'bg-teal-200/20' : 'bg-purple-100/15'}`} />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-30 w-full bg-[#f8f9fc]/80 backdrop-blur-xl border-b border-gray-100/80 px-5 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors active:scale-95">
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="text-[14px] font-semibold">Back</span>
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-[15px] font-bold text-gray-900">Image Note</h1>
            {previewUrl && <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-widest">Ready to save</span>}
          </div>

          <button
            onClick={handleSave}
            disabled={!previewUrl || isSaving}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-bold transition-all active:scale-95 ${
              previewUrl && !isSaving
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isSaving
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <Save size={13} strokeWidth={2.5} />
            }
            Save
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 w-full max-w-xl mx-auto px-5 pt-8">

        {!previewUrl ? (
          /* ── DROP ZONE ── */
          <>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full rounded-[32px] border-2 border-dashed transition-all duration-300 overflow-hidden relative ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-50/50 scale-[1.01]'
                  : 'border-gray-200 bg-white'
              }`}
              style={{ minHeight: '340px' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
                {/* Icon */}
                <div className={`w-24 h-24 rounded-[28px] flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                  <ImageIcon size={36} className={`transition-colors ${isDragging ? 'text-emerald-500' : 'text-gray-300'}`} strokeWidth={1.5} />
                </div>

                <div className="text-center">
                  <p className="text-[18px] font-bold text-gray-800 mb-1">
                    {isDragging ? 'Drop it here' : 'Add a photo'}
                  </p>
                  <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
                    Drag & drop an image, or choose an option below
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Camera size={22} className="text-blue-500" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-gray-900">Camera</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Take a photo</p>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <Upload size={22} className="text-violet-500" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-gray-900">Gallery</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Upload from device</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          /* ── PREVIEW ── */
          <>
            {/* Image preview */}
            <div className="w-full rounded-[28px] overflow-hidden relative shadow-[0_12px_40px_rgba(0,0,0,0.14)] mb-5">
              <img src={previewUrl} alt="Preview" className="w-full object-cover" style={{ maxHeight: '55vh' }} />

              {/* Overlay controls */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[12px] font-bold hover:bg-black/70 active:scale-95 transition-all"
                >
                  <RotateCcw size={12} strokeWidth={2.5} />
                  Retake
                </button>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Bottom gradient scrim */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>

            {/* Title input */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center px-5 py-4 gap-3">
                <Sparkles size={16} className="text-gray-300 shrink-0" />
                <input
                  type="text"
                  placeholder="Add a title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                  className="flex-1 text-[16px] font-semibold text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-2 mt-3 px-1">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Tagged as</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">#Image</span>
            </div>
          </>
        )}

        {/* Hidden inputs */}
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>

      {/* Floating save bar */}
      {previewUrl && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-5 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[12px] font-semibold text-gray-400">Image ready</span>
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-gray-900 text-white text-[12px] font-bold active:scale-95 transition-all disabled:opacity-60"
            >
              {isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={12} strokeWidth={2.5} />}
              Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
