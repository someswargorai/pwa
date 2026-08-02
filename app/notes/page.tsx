"use client";

import { useEffect, useState, useMemo } from "react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";
import RecentNotes from "@/components/dashboard/RecentNotes";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import ReminderModal from "@/components/dashboard/ReminderModal";
import { FileText, Pin, Hash, Search, SlidersHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AllNotesPage() {
  const router = useRouter();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [noteToNotify, setNoteToNotify] = useState<Note | null>(null);

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

  const openDeleteModal = (id: string) => { setNoteToDelete(id); setDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    const updated = allNotes.filter(n => n.id !== noteToDelete);
    setAllNotes(updated);
    await set("nexus_dashboard_notes", updated);
    setNoteToDelete(null);
  };

  const handleNotify = (note: Note) => { setNoteToNotify(note); setReminderModalOpen(true); };

  const dynamicTabs = useMemo(() => {
    const uniqueTags = new Set<string>();
    allNotes.forEach(n => n.tags?.forEach(t => uniqueTags.add(t)));
    return ["All", ...Array.from(uniqueTags)];
  }, [allNotes]);

  const filteredNotes = useMemo(() => {
    let filtered = activeTab === "All" ? allNotes : allNotes.filter(n => n.tags?.includes(activeTab));
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.content && n.content.toLowerCase().includes(q))
      );
    }
    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [allNotes, activeTab, search]);

  const paginatedNotes = filteredNotes.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginatedNotes.length < filteredNotes.length;
  const pinnedCount = allNotes.filter(n => n.isPinned).length;

  return (
    <div className="min-h-auto w-full bg-[#f8f9fc] text-gray-900 relative selection:bg-blue-100">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[55%] h-[45%] bg-blue-100/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-8%] w-[50%] h-[40%] bg-purple-100/20 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5">

        {/* ── HERO HEADER ── */}
        <div className="pt-10 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Library</p>
              <h1 className="text-[30px] font-bold text-gray-900 tracking-tight leading-tight">Your Notes</h1>
            </div>
            <button
              onClick={() => router.push("/save-text")}
              className="flex items-center gap-1.5 h-10 px-4 rounded-2xl bg-gray-900 text-white text-[13px] font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 active:scale-95 transition-all"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Note
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-gray-400" />
              <span className="text-[13px] font-semibold text-gray-500">{allNotes.length} total</span>
            </div>
            {pinnedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Pin size={12} className="text-blue-400" />
                <span className="text-[13px] font-semibold text-gray-500">{pinnedCount} pinned</span>
              </div>
            )}
            {dynamicTabs.length > 1 && (
              <div className="flex items-center gap-1.5">
                <Hash size={12} className="text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-500">{dynamicTabs.length - 1} tag{dynamicTabs.length - 1 !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={15} className="text-gray-400" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search notes..."
            className="w-full bg-white/80 backdrop-blur-sm text-gray-900 rounded-2xl py-3 pl-10 pr-4 text-[14px] font-medium outline-none border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus:border-gray-200 focus:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all placeholder:text-gray-300"
          />
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {dynamicTabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeTab === tab
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm"
              }`}
            >
              {tab === 'Note' ? 'Text' : tab}
            </button>
          ))}
        </div>

        {/* ── NOTES GRID ── */}
        {filteredNotes.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-[16px] font-bold text-gray-400 mb-1">
              {search ? 'No results found' : `No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}notes yet`}
            </h3>
            <p className="text-[13px] text-gray-300 font-medium max-w-[200px] leading-relaxed">
              {search ? `Nothing matched "${search}"` : 'Create your first note to see it here'}
            </p>
            {!search && (
              <button
                onClick={() => router.push("/save-text")}
                className="mt-6 flex items-center gap-1.5 h-9 px-5 rounded-2xl bg-gray-900 text-white text-[13px] font-bold shadow-lg shadow-gray-900/20 active:scale-95 transition-all"
              >
                <Plus size={14} strokeWidth={2.5} />
                Create Note
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Section label */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {search ? `${filteredNotes.length} result${filteredNotes.length !== 1 ? 's' : ''}` : activeTab === 'All' ? 'All Notes' : activeTab}
              </p>
              <p className="text-[11px] font-bold text-gray-300 tabular-nums">
                {paginatedNotes.length} / {filteredNotes.length}
              </p>
            </div>

            <RecentNotes
              notes={paginatedNotes}
              onPin={handlePin}
              onDelete={openDeleteModal}
              onNotify={handleNotify}
            />

            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-full mt-2 py-4 rounded-2xl bg-white border border-gray-100 text-[14px] font-bold text-gray-500 shadow-sm hover:bg-gray-50 hover:shadow-md active:scale-[0.99] transition-all"
              >
                Load more · {filteredNotes.length - paginatedNotes.length} remaining
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
      />

      {noteToNotify && (
        <ReminderModal
          isOpen={reminderModalOpen}
          onClose={() => setReminderModalOpen(false)}
          noteTitle={noteToNotify.title || "Note"}
          noteContent={noteToNotify.content || ""}
        />
      )}
    </div>
  );
}
