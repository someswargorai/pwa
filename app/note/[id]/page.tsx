"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, Download, Lock, Unlock, Clock, Tag } from "lucide-react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";
import LinkPreview from "@/components/dashboard/LinkPreview";
import { setupBiometrics, unlockNote } from "@/lib/biometrics";

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlockedForViewing, setIsUnlockedForViewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNote() {
      const savedNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
      const foundNote = savedNotes.find((n) => n.id === params.id);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setIsLocked(!!foundNote.isLocked);
        if (!foundNote.isLocked) {
          setIsUnlockedForViewing(true);
        }
      } else {
        router.push("/");
      }
    }
    loadNote();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!note) return;
    setIsSaving(true);
    const savedNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
    const updatedNotes = savedNotes.map((n) => {
      if (n.id === note.id) {
        const finalContent = contentRef.current ? contentRef.current.innerHTML : note.content;
        return { ...n, title: title.trim(), content: finalContent, isLocked };
      }
      return n;
    });
    await set("nexus_dashboard_notes", updatedNotes);
    setSavedAt(new Date());
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 600);
  };

  const toggleLock = async () => {
    if (!isLocked) {
      const success = await setupBiometrics();
      if (success) {
        setIsLocked(true);
        setIsUnlockedForViewing(true);
      }
    } else {
      const success = await unlockNote();
      if (success) {
        setIsLocked(false);
      }
    }
  };

  const handleUnlockViewing = async () => {
    const success = await unlockNote();
    if (success) {
      setIsUnlockedForViewing(true);
    } else {
      alert("Verification failed. Cannot view note.");
    }
  };

  const handleDownload = async () => {
    if (!note) return;
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${title.replace(/\s+/g, '_')}.txt`,
        types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }],
      });
      const writable = await handle.createWritable();
      const plainTextContent = contentRef.current ? contentRef.current.innerText : note.content;
      await writable.write(`Title: ${title}\n\n${plainTextContent}`);
      await writable.close();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Download failed:', err);
      }
    }
  };

  const getTimeAgo = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!note) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#f8f9fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-gray-400">Loading note...</span>
        </div>
      </div>
    );
  }

  const urlRegex = /https?:\/\/[^\s<]+/g;
  const rawUrls = note.content ? note.content.match(urlRegex) || [] : [];
  const cleanedUrls = rawUrls.map(url => url.replace(/["'>.,;]+$/, ''));
  const uniqueUrls = Array.from(new Set(cleanedUrls));

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 relative flex flex-col">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-purple-100/30 rounded-full blur-[100px]" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 w-full bg-[#f8f9fc]/80 backdrop-blur-xl border-b border-gray-100/80 px-5 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="text-[14px] font-semibold">Back</span>
          </button>

          {/* Center pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
            <Clock size={12} className="text-gray-400" />
            <span className="text-[12px] font-semibold text-gray-400">{getTimeAgo(note.createdAt)}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Lock */}
            <button
              onClick={toggleLock}
              title={isLocked ? "Remove lock" : "Lock note"}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all active:scale-95 ${
                isLocked
                  ? 'bg-red-50 text-red-500 border-red-100 shadow-sm shadow-red-100'
                  : 'bg-white text-gray-500 border-gray-100 shadow-sm hover:text-gray-900'
              }`}
            >
              {isLocked ? <Lock size={15} strokeWidth={2.5} /> : <Unlock size={15} strokeWidth={2.5} />}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-500 border border-gray-100 shadow-sm hover:text-gray-900 active:scale-95 transition-all"
            >
              <Download size={15} strokeWidth={2.5} />
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 h-9 px-4 rounded-full bg-gray-900 text-white text-[13px] font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Save size={13} strokeWidth={2.5} />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 pt-8 pb-32 flex-1">

        {!isUnlockedForViewing ? (
          /* ── PREMIUM LOCK SCREEN ── */
          <div className="w-full relative rounded-[32px] overflow-hidden flex flex-col items-center justify-center bg-[#050505] border border-white/[0.06]" style={{ minHeight: '65vh' }}>
            {/* animated glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-[#050505] to-indigo-950/40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-brand-blue/20 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[50%] h-[200px] bg-purple-600/10 blur-[80px] rounded-full" />
            {/* noise grain */}
            <div className="absolute inset-0 opacity-[0.035] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

            <div className="relative z-10 flex flex-col items-center text-center px-8 py-16">
              {/* Icon with layered glow rings */}
              <div className="relative mb-10" onClick={handleUnlockViewing}>
                <div className="absolute -inset-8 bg-brand-blue/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -inset-4 rounded-full border border-brand-blue/20" />
                <div className="absolute -inset-2 rounded-full border border-white/10" />
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] cursor-pointer hover:scale-105 transition-transform">
                  <Lock size={32} className="text-white/80" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-[28px] font-bold text-white tracking-tight mb-3">Note Secured</h2>
              <p className="text-[15px] text-gray-500 max-w-[260px] mb-10 leading-relaxed font-medium">
                This note is protected. Authenticate to reveal its contents.
              </p>

              <button
                onClick={handleUnlockViewing}
                className="group relative overflow-hidden px-10 py-3.5 rounded-2xl bg-white text-[14px] font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] active:scale-[0.97] transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  <Unlock size={14} strokeWidth={2.5} />
                  Unlock with FaceID
                </span>
              </button>
            </div>

            {/* Top chrome line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/[0.06] pointer-events-none" />
          </div>

        ) : (
          /* ── NOTE EDITOR ── */
          <div className="flex flex-col gap-0">

            {/* Title block */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Untitled Note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-[32px] font-bold text-gray-900 placeholder:text-gray-200 outline-none bg-transparent leading-tight tracking-tight"
              />

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  <span className="text-[13px] font-semibold text-gray-400">{getTimeAgo(note.createdAt)}</span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-gray-400" />
                    <div className="flex gap-1.5 flex-wrap">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wide">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {isLocked && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-[11px] font-bold text-red-500 uppercase tracking-wide border border-red-100">
                    <Lock size={10} strokeWidth={2.5} /> Locked
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100/80 mb-10" />

            {/* Image */}
            {note.imageUrl && (
              <div className="w-full rounded-3xl overflow-hidden mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-gray-100">
                <img src={note.imageUrl} alt={note.title} className="w-full h-auto max-h-[350px] object-cover" />
              </div>
            )}

            {/* Content editor — clean, no chrome */}
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: note.content || "" }}
              className="w-full min-h-[300px] text-[17px] font-normal text-gray-700 outline-none bg-transparent leading-[1.85] tracking-[0.01em] selection:bg-blue-100 prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-2xl prose-code:font-mono"
              data-placeholder="Start writing..."
            />

            {/* Link Previews */}
            {uniqueUrls.length > 0 && (
              <div className="w-full mt-8 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2">Links</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                {uniqueUrls.map((url, i) => (
                  <LinkPreview key={i} url={url} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating bottom save bar (mobile) */}
      {isUnlockedForViewing && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-5 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <button
              onClick={toggleLock}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
                isLocked
                  ? 'bg-red-50 text-red-500 border-red-100'
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:text-gray-900'
              }`}
            >
              {isLocked ? <Lock size={15} strokeWidth={2.5} /> : <Unlock size={15} strokeWidth={2.5} />}
            </button>
            <button
              onClick={handleDownload}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-100 hover:text-gray-900 active:scale-95 transition-all"
            >
              <Download size={15} strokeWidth={2.5} />
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gray-900 text-white text-[13px] font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Save size={13} strokeWidth={2.5} />
              )}
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #d1d5db;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
