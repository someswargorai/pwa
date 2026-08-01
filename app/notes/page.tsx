"use client";

import { useEffect, useState, useMemo } from "react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";
import RecentNotes from "@/components/dashboard/RecentNotes";

export default function AllNotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    async function fetchNotes() {
      const savedNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
      setAllNotes(savedNotes);
    }
    fetchNotes();
  }, []);

  const handlePin = async (id: string) => {
    const updated = allNotes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    setAllNotes(updated);
    await set("nexus_dashboard_notes", updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const updated = allNotes.filter(n => n.id !== id);
    setAllNotes(updated);
    await set("nexus_dashboard_notes", updated);
  };

  // Extract all unique categories/tags dynamically from the database
  const dynamicTabs = useMemo(() => {
    const uniqueTags = new Set<string>();
    allNotes.forEach(note => {
      note.tags?.forEach(tag => {
        uniqueTags.add(tag);
      });
    });
    return ["All", ...Array.from(uniqueTags)];
  }, [allNotes]);

  // Filter notes by Tab
  const filteredNotes = useMemo(() => {
    let filtered = allNotes;
    
    if (activeTab !== "All") {
      filtered = allNotes.filter(n => n.tags?.includes(activeTab));
    }
    
    // Sort pinned to top
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [allNotes, activeTab]);

  // Paginate notes
  const paginatedNotes = filteredNotes.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginatedNotes.length < filteredNotes.length;

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 pb-32 relative">
      <div className="w-full max-w-2xl mx-auto px-5 pt-10">
        <h1 className="text-[28px] font-bold text-gray-900 mb-6 tracking-tight">Your Notes</h1>
        
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {dynamicTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-5 py-2.5 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeTab === tab 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {tab === 'Note' ? 'Text' : tab}
            </button>
          ))}
        </div>

        {paginatedNotes.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400">
             <p>No {activeTab.toLowerCase()} notes found.</p>
          </div>
        ) : (
          <div className="-mx-1">
            <RecentNotes 
              notes={paginatedNotes} 
              onPin={handlePin}
              onDelete={handleDelete}
            />
          </div>
        )}

        {hasMore && (
          <button 
            onClick={() => setPage(p => p + 1)}
            className="w-full py-4 rounded-2xl bg-white border border-gray-100 text-brand-blue font-semibold mt-[-20px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            Load More Notes
          </button>
        )}
      </div>
    </div>
  );
}
