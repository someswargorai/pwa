"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/dashboard/SearchBar";
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
import RecentNotes, { Note } from "@/components/dashboard/RecentNotes";
import { get, set } from "idb-keyval";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import ReminderModal from "@/components/dashboard/ReminderModal";
import { motion, Variants } from "framer-motion";

const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "Daily Journal Entry",
    tasks: [
      { id: "t1", text: "Crime Report", completed: true },
      { id: "t2", text: "Submit News From USA", completed: true }
    ],
    tags: ["Note", "Idea"],
    createdAt: Date.now() - 1000 * 60 * 5,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    color: "#e0e7ff"
  }
];

export default function ClientPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [noteToNotify, setNoteToNotify] = useState<Note | null>(null);

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
    
    window.addEventListener('notesUpdated', loadNotes);
    window.addEventListener('focus', loadNotes);
    return () => {
      window.removeEventListener('notesUpdated', loadNotes);
      window.removeEventListener('focus', loadNotes);
    };
  }, []);

  const handlePin = async (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    setNotes(updated);
    await set("nexus_dashboard_notes", updated);
  };

  const openDeleteModal = (id: string) => {
    setNoteToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    const updated = notes.filter(n => n.id !== noteToDelete);
    setNotes(updated);
    await set("nexus_dashboard_notes", updated);
    setNoteToDelete(null);
  };

  const handleNotify = (note: Note) => {
    setNoteToNotify(note);
    setReminderModalOpen(true);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 w-full text-gray-900 relative selection:bg-brand-blue selection:text-white pb-24">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] right-[-5%] w-[55%] h-[50%] bg-blue-200/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[55%] h-[45%] bg-purple-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-[45%] right-[5%] w-[40%] h-[35%] bg-cyan-100/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-2xl mx-auto px-5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Hero header */}
        <motion.div variants={itemVariants} className="pt-10 pb-2">
          <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide uppercase">{today}</p>
          <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
          </h1>
          <p className="text-[15px] text-gray-400 font-medium mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''} · {notes.filter(n => n.isPinned).length} pinned
          </p>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        {/* Quick actions */}
        {!searchQuery && (
          <motion.div variants={itemVariants}>
            <QuickActionsGrid />
          </motion.div>
        )}

        {/* Notes feed */}
        <motion.div variants={itemVariants}>
          <RecentNotes
            notes={searchQuery ? sortedNotes : sortedNotes}
            onPin={handlePin}
            onDelete={openDeleteModal}
            onNotify={handleNotify}
            searchQuery={searchQuery}
          />
        </motion.div>
      </motion.div>

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