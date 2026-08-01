"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Image as ImageIcon, Save } from "lucide-react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";

export default function SaveImagePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!previewUrl) return;
    
    const noteObj: Note = {
      id: Date.now().toString(),
      title: title.trim() || "Captured Image",
      content: "Image Note", // We can use content or a new field for the image data
      tags: ["Image"],
      createdAt: Date.now(),
      color: "#dcfce7" // Emerald tint
    };
    
    // We append the base64 image onto the note. 
    // In a real app we might store large blobs separately, but for <500MB idb-keyval handles strings fine.
    const noteWithImage = { ...noteObj, imageUrl: previewUrl };

    const existingNotes = (await get("nexus_dashboard_notes")) || [];
    const updatedNotes = [noteWithImage, ...existingNotes];
    
    await set("nexus_dashboard_notes", updatedNotes);
    router.push("/");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 pb-20 relative flex flex-col z-50">
      
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#f8f9fc] via-white to-[#f0f4ff]">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-4 flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-6">
          <button onClick={() => router.push("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900">Image Note</h1>
          <button 
            onClick={handleSave} 
            disabled={!previewUrl}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all ${
              previewUrl ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 active:scale-95" : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <Save size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Image Dropzone / Preview */}
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/5] bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-emerald-200 transition-all shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <Camera size={28} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-[16px]">Tap to Capture</h3>
              <p className="text-gray-400 text-[14px] mt-1">Take a photo or upload from gallery</p>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <img src={previewUrl} alt="Captured preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-[13px] font-semibold hover:bg-black/70 transition-colors"
            >
              Retake
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageCapture}
          className="hidden"
        />

        {/* Title Input */}
        <div className="w-full bg-white rounded-3xl p-5 mt-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white">
          <div className="flex items-center gap-3">
            <ImageIcon size={20} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Add a title for this image..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[16px] font-semibold text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
