"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, Download } from "lucide-react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNote() {
      const savedNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
      const foundNote = savedNotes.find((n) => n.id === params.id);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        // innerHTML is set initially via dangerouslySetInnerHTML
      } else {
        router.push("/");
      }
    }
    loadNote();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!note) return;
    
    const savedNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
    const updatedNotes = savedNotes.map((n) => {
      if (n.id === note.id) {
        const finalContent = contentRef.current ? contentRef.current.innerHTML : note.content;
        return { ...n, title: title.trim(), content: finalContent };
      }
      return n;
    });
    
    await set("nexus_dashboard_notes", updatedNotes);
    router.back();
  };

  const handleDownload = async () => {
    if (!note) return;
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${title.replace(/\s+/g, '_')}.txt`,
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] },
        }],
      });
      const writable = await handle.createWritable();
      const plainTextContent = contentRef.current ? contentRef.current.innerText : note.content;
      await writable.write(`Title: ${title}\n\n${plainTextContent}`);
      await writable.close();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Download failed:', err);
        alert('Failed to save file locally.');
      }
    }
  };

  if (!note) return null; // loading state

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 pb-24 relative selection:bg-brand-blue selection:text-white flex flex-col z-50">
      
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-4 flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-6">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
              <Download size={18} strokeWidth={2.5} />
            </button>
            <button onClick={handleSave} className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-blue shadow-sm border border-brand-blue text-white hover:bg-blue-600 active:scale-95 transition-all">
              <Save size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full bg-white rounded-3xl p-5 mb-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white">
          <input 
            type="text" 
            placeholder="Title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[18px] font-semibold text-gray-900 placeholder:text-gray-300 outline-none bg-transparent mb-4"
          />
          <div className="w-full h-[1px] bg-gray-100 mb-4"></div>
          
          {note.imageUrl && (
            <div className="w-full rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100">
              <img src={note.imageUrl} alt={note.title} className="w-full h-auto max-h-[300px] object-cover" />
            </div>
          )}

          <div 
            ref={contentRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: note.content || "" }}
            className="w-full min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar text-[15px] font-medium text-gray-700 outline-none bg-transparent leading-relaxed prose prose-sm"
          ></div>
        </div>
      </div>
    </div>
  );
}
