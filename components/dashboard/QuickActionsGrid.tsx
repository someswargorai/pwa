"use client";

import { Type, AudioLines, Image as ImageIcon, BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionsGrid() {
  const router = useRouter();
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-8 w-full">
      {/* Text Note */}
      <button onClick={() => router.push('/save-text')} className="flex flex-col items-start bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:bg-gray-50/50 transition-all active:scale-95 group text-left border border-gray-100">
        <div className="w-10 h-10 rounded-2xl bg-[#f4f5f8] flex items-center justify-center text-gray-700 mb-6 group-hover:bg-gray-100 transition-colors">
          <Type size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-1">Text Note</h3>
          <p className="text-[13px] text-gray-400 font-medium leading-snug">Write and save your thoughts</p>
        </div>
      </button>

      {/* Voice Note (Solid Blue, Rotated) */}
      <button 
        onClick={() => router.push('/save-voice')}
        className="flex flex-col items-start bg-[#4d94ff] rounded-3xl p-4 shadow-[0_8px_20px_rgba(77,148,255,0.25)] hover:shadow-[0_12px_25px_rgba(77,148,255,0.35)] transition-all active:scale-95 text-left rotate-3 hover:rotate-0"
      >
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#4d94ff] mb-6 shadow-sm">
          <AudioLines size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-white mb-1">Voice Note</h3>
          <p className="text-[13px] text-blue-100 font-medium leading-snug">Record and save your voice</p>
        </div>
      </button>

      {/* Image Note */}
      <button onClick={() => router.push('/save-image')} className="flex flex-col items-start bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:bg-gray-50/50 transition-all active:scale-95 group text-left border border-gray-100">
        <div className="w-10 h-10 rounded-2xl bg-[#f4f5f8] flex items-center justify-center text-gray-700 mb-6 group-hover:bg-gray-100 transition-colors">
          <ImageIcon size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-1">Image Note</h3>
          <p className="text-[13px] text-gray-400 font-medium leading-snug">Capture notes from images</p>
        </div>
      </button>

      {/* AI Note */}
      <button onClick={() => router.push('/save-ai')} className="flex flex-col items-start bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:bg-gray-50/50 transition-all active:scale-95 group text-left border border-gray-100">
        <div className="w-10 h-10 rounded-2xl bg-[#f4f5f8] flex items-center justify-center text-gray-700 mb-6 group-hover:bg-gray-100 transition-colors">
          <BookOpenText size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-1">AI Note</h3>
          <p className="text-[13px] text-gray-400 font-medium leading-snug">Create notes with AI assistance</p>
        </div>
      </button>
    </div>
  );
}
