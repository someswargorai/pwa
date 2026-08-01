"use client";

import { useRouter } from "next/navigation";
import CreateNoteView from "@/components/dashboard/CreateNoteView";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";

export default function SaveTextPage() {
  const router = useRouter();

  const handleSaveNote = async (newNote: { title: string, content: string, tags?: string[] }) => {
    const colors = ["#e0f2fe", "#dcfce7", "#fef3c7", "#f3e8ff", "#ffe4e6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const noteObj: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags && newNote.tags.length > 0 ? newNote.tags : ["Note"],
      createdAt: Date.now(),
      color: randomColor
    };

    const existingNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
    const updatedNotes = [noteObj, ...existingNotes];
    
    await set("nexus_dashboard_notes", updatedNotes);
    router.push("/");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 pb-20 relative selection:bg-brand-blue selection:text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#f8f9fc] via-white to-[#f0f4ff]">
        <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] bg-blue-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full h-full">
        <CreateNoteView 
           onClose={() => router.push("/")} 
           onSave={handleSaveNote}
        />
      </div>
    </div>
  );
}
