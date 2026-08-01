"use client";

import { Type, AudioLines, Image as ImageIcon, BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionsGrid() {
  const router = useRouter();
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-8 w-full">
      {/* Text Note */}
      <button onClick={() => router.push('/save-text')} className="flex flex-col items-start justify-between bg-orange-500/5 backdrop-blur-md rounded-3xl p-5 aspect-[1.1] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:bg-orange-500/10 transition-all active:scale-95 group text-left border border-orange-500/10">
        <div className="w-10 h-10 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-500 mb-2 group-hover:bg-orange-100 transition-colors">
          <Type size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-0.5 group-hover:text-orange-600 transition-colors">Text Note</h3>
          <p className="text-[12px] text-gray-400 font-medium leading-snug">Write and save your thoughts</p>
        </div>
      </button>

      {/* Voice Note (Accent Blue) */}
      <button 
        onClick={() => router.push('/save-voice')}
        className="flex flex-col items-start justify-between bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl p-5 aspect-[1.1] shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.45)] transition-all active:scale-95 text-left rotate-2 hover:rotate-0"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2 backdrop-blur-md border border-white/10">
          <AudioLines size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-white mb-0.5">Voice Note</h3>
          <p className="text-[12px] text-blue-100 font-medium leading-snug">Record and save your voice</p>
        </div>
      </button>

      {/* Image Note */}
      <button onClick={() => router.push('/save-image')} className="flex flex-col items-start justify-between bg-emerald-500/5 backdrop-blur-md rounded-3xl p-5 aspect-[1.1] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:bg-emerald-500/10 transition-all active:scale-95 group text-left border border-emerald-500/10">
        <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-500 mb-2 group-hover:bg-emerald-100 transition-colors">
          <ImageIcon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-0.5 group-hover:text-emerald-600 transition-colors">Image Note</h3>
          <p className="text-[12px] text-gray-400 font-medium leading-snug">Capture notes from images</p>
        </div>
      </button>

      {/* AI Note */}
      <button onClick={() => router.push('/save-ai')} className="flex flex-col items-start justify-between bg-purple-500/5 backdrop-blur-md rounded-3xl p-5 aspect-[1.1] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:bg-purple-500/10 transition-all active:scale-95 group text-left border border-purple-500/10">
        <div className="w-10 h-10 rounded-xl bg-purple-100/80 flex items-center justify-center text-purple-500 mb-2 group-hover:bg-purple-100 transition-colors">
          <BookOpenText size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 mb-0.5 group-hover:text-purple-600 transition-colors">AI Note</h3>
          <p className="text-[12px] text-gray-400 font-medium leading-snug">Create notes with AI assistance</p>
        </div>
      </button>
    </div>
  );
}
