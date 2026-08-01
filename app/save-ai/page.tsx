"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Send } from "lucide-react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";

export default function SaveAIPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndSave = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      // Call our Next.js backend which safely uses the Gemini API key
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Write a complete, well-formatted note about: ${prompt.trim()}` }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const data = await response.json();
      
      const noteObj: Note = {
        id: Date.now().toString(),
        title: prompt.trim().substring(0, 30) + "...",
        content: data.text,
        tags: ["AI", "Generated"],
        createdAt: Date.now(),
        color: "#f3e8ff" // Purple tint for AI
      };

      const existingNotes = (await get("nexus_dashboard_notes")) || [];
      const updatedNotes = [noteObj, ...existingNotes];
      
      await set("nexus_dashboard_notes", updatedNotes);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to generate note. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 pb-20 relative flex flex-col z-50">
      
      {/* Magical Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#f8f9fc] via-[#faf5ff] to-[#f0f4ff]">
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[50%] bg-purple-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-400/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-4 flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-6">
          <button onClick={() => router.push("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            <h1 className="text-[17px] font-semibold text-gray-900">AI Note</h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* AI Prompt Area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 flex items-center justify-center text-purple-500 mb-8 shadow-inner relative">
             <div className="absolute inset-0 bg-purple-400 rounded-3xl blur-xl opacity-20"></div>
             <Sparkles size={32} strokeWidth={2} />
          </div>

          <h2 className="text-[24px] font-semibold text-gray-900 text-center mb-2">What should I write?</h2>
          <p className="text-[15px] text-gray-500 text-center mb-10 px-4">
            Type a prompt and AI will generate a complete note for you instantly.
          </p>

          <div className="w-full relative">
            <textarea 
              placeholder="e.g. Write a packing list for a 3-day beach trip..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full min-h-[140px] bg-white rounded-3xl p-6 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white resize-none leading-relaxed focus:border-purple-200 transition-colors"
            ></textarea>

            <button 
              onClick={handleGenerateAndSave}
              disabled={!prompt.trim() || isGenerating}
              className={`absolute bottom-4 right-4 w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all ${
                prompt.trim() && !isGenerating 
                  ? "bg-purple-500 text-white hover:bg-purple-600 active:scale-95 shadow-purple-500/30" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send size={18} className="ml-1" />
              )}
            </button>
          </div>
          
          {isGenerating && (
            <div className="mt-8 flex items-center gap-3 text-purple-600 animate-pulse">
               <Sparkles size={16} />
               <span className="font-medium text-[15px]">Generating your note...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
