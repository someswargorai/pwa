"use client";

import { Search, Mic } from "lucide-react";

export default function SearchBar({ value, onChange, onVoiceClick }: { value?: string, onChange?: (val: string) => void, onVoiceClick?: () => void }) {
  return (
    <div className="w-full relative mt-4 mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" strokeWidth={2.5} />
      </div>
      
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-white text-gray-900 rounded-2xl py-3.5 pl-11 pr-12 text-[15px] font-medium outline-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-transparent focus:border-gray-200 transition-all placeholder:text-gray-400"
        placeholder="Search notes, tags..." 
      />
      
      <button 
        onClick={onVoiceClick}
        className="absolute inset-y-0 right-2 flex items-center justify-center w-10 text-gray-400 hover:text-brand-blue transition-colors"
      >
        <Mic size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
