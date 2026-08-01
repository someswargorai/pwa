"use client";

import { Home, FileText, Plus, CheckCircle, MoreHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const activeTab = pathname === "/save-text" ? "add" : 
                    pathname === "/notes" ? "notes" : 
                    pathname === "/tasks" ? "tasks" : 
                    pathname === "/settings" ? "settings" : "home";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[32px] px-2 py-2 flex items-center gap-1 z-50">
      
      <button onClick={() => router.push("/")} className="relative w-[52px] h-[52px] flex items-center justify-center rounded-full group">
        {activeTab === "home" && (
          <div className="absolute inset-0 bg-brand-blue rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.3)]"></div>
        )}
        <Home size={22} className={`relative z-10 ${activeTab === "home" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={2.5} />
      </button>

      <button onClick={() => router.push("/notes")} className="relative w-[52px] h-[52px] flex items-center justify-center rounded-full group">
        {activeTab === "notes" && (
          <div className="absolute inset-0 bg-brand-blue rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.3)]"></div>
        )}
        <FileText size={22} className={`relative z-10 ${activeTab === "notes" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={2.5} />
      </button>

      <button onClick={() => router.push("/save-text")} className="relative w-[52px] h-[52px] flex items-center justify-center rounded-full group">
        {activeTab === "add" && (
          <div className="absolute inset-0 bg-brand-blue rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.3)]"></div>
        )}
        <Plus size={24} className={`relative z-10 ${activeTab === "add" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={3} />
      </button>

      <button onClick={() => router.push("/tasks")} className="relative w-[52px] h-[52px] flex items-center justify-center rounded-full group">
        {activeTab === "tasks" && (
          <div className="absolute inset-0 bg-brand-blue rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.3)]"></div>
        )}
        <CheckCircle size={22} className={`relative z-10 ${activeTab === "tasks" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={2.5} />
      </button>
      
      <button onClick={() => router.push("/settings")} className="relative w-[52px] h-[52px] flex items-center justify-center rounded-full group">
        {activeTab === "settings" && (
          <div className="absolute inset-0 bg-brand-blue rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.3)]"></div>
        )}
        <MoreHorizontal size={22} className={`relative z-10 ${activeTab === "settings" ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={2.5} />
      </button>

    </div>
  );
}
