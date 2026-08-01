"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/dashboard/SearchBar";
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
import RecentNotes, { Note } from "@/components/dashboard/RecentNotes";
import { get } from "idb-keyval";
import { useRouter } from "next/navigation";

// Mock data matching the screenshot exactly
const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "Daily Journal Entry",
    tasks: [
      { id: "t1", text: "Crime Report", completed: true },
      { id: "t2", text: "Submit News From USA", completed: true }
    ],
    tags: ["Note", "Idea"],
    createdAt: Date.now() - 1000 * 60 * 5, // 5 mins ago
    color: "#fef3c7"
  },
  {
    id: "2",
    title: "Grocery List",
    tasks: [
      { id: "t1", text: "Almond Milk", completed: true },
      { id: "t2", text: "Eggs", completed: false },
      { id: "t3", text: "Bread", completed: false }
    ],
    tags: ["List"],
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    color: "#e0e7ff"
  }
];

export default function ClientPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Load from IndexedDB on mount
  useEffect(() => {
    async function loadNotes() {
      const savedNotes = await get("nexus_dashboard_notes");
      if (savedNotes && Array.isArray(savedNotes)) {
        setNotes(savedNotes);
      } else {
        setNotes(MOCK_NOTES);
        set("nexus_dashboard_notes", MOCK_NOTES);
      }
    }
    loadNotes();
  }, []);

  const handlePin = async (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    setNotes(updated);
    await set("nexus_dashboard_notes", updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    await set("nexus_dashboard_notes", updated);
  };

  // Filter and Sort
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // fallback to chron as they are already ordered
  });

  return (
    <div className="flex-1 w-full text-gray-900 pb-20 relative selection:bg-brand-blue selection:text-white">
      
      {/* Background gradients for premium feel (matching standard SaaS dashboards) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#f8f9fc] via-white to-[#f0f4ff]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[50%] bg-purple-300/20 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-cyan-200/20 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full h-full">
        <div className="w-full max-w-2xl mx-auto px-5 lg:pt-10">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {!searchQuery && <QuickActionsGrid />}
          <RecentNotes 
            notes={searchQuery ? sortedNotes : sortedNotes.slice(0, 3)} 
            onPin={handlePin}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}