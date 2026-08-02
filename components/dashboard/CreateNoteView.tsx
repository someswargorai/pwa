"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, Save, Tag, Bell, Sparkles, BrainCircuit,
  ListOrdered, Type, X, Hash, Bold, Italic, List, AlignLeft, Folder
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AI_ACTIONS = [
  { key: 'summarize', label: 'Summarize', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Condense to key points' },
  { key: 'rewrite',   label: 'Polish',    icon: BrainCircuit, color: 'text-violet-500', bg: 'bg-violet-50', desc: 'Rewrite professionally' },
  { key: 'bullets',   label: 'Bullet list', icon: ListOrdered, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Convert to bullets' },
  { key: 'title',     label: 'Auto-title', icon: Type, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Generate a smart title' },
] as const;

export default function CreateNoteView({ onClose, onSave }: {
  onClose: () => void;
  onSave?: (note: { title: string; content: string; tags: string[] }) => void;
}) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>(["Note"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; type: 'tag' | 'category' | 'reminder' | null }>({ open: false, type: null });
  const [dialogInput, setDialogInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const getContent = () => contentRef.current?.innerHTML ?? "";
  const getPlainText = () => contentRef.current?.innerText ?? "";

  const updateWordCount = () => {
    const text = getPlainText().trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  };

  const execFormat = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    contentRef.current?.focus();
  };

  const handleSave = () => {
    const finalContent = getContent();
    const plainText = getPlainText();
    if (!title.trim() && !plainText.trim()) {
      toast.error("Add a title or content before saving.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      onSave?.({ title: title.trim() || "Untitled", content: finalContent.trim(), tags });
      toast.success("Note saved!");
    }, 300);
  };

  const handleAiAction = async (action: typeof AI_ACTIONS[number]['key']) => {
    const plain = getPlainText();
    if (!plain.trim()) { toast.error("Write something first!"); return; }
    setIsGenerating(true);
    setGeneratingAction(action);
    const toastId = toast.loading("AI is thinking...");
    try {
      const prompts: Record<string, string> = {
        summarize: `Summarize the following text concisely:\n\n${plain}`,
        rewrite:   `Rewrite the following text to be extremely clear, professional, and readable:\n\n${plain}`,
        bullets:   `Convert the following text into a clean bulleted list:\n\n${plain}`,
        title:     `Generate a short, catchy title (maximum 5 words) for the following text. Plain text only, no HTML:\n\n${plain}`,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompts[action] }),
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (action === 'title') {
        setTitle(data.text.replace(/<[^>]*>?/gm, '').trim());
      } else {
        if (contentRef.current) contentRef.current.innerHTML = data.text;
        updateWordCount();
      }
      toast.success("Done!", { id: toastId });
    } catch {
      toast.error("AI failed. Try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  const handleDialogSubmit = async () => {
    if (!dialogInput.trim()) return;
    if (dialog.type === 'reminder') {
      const scheduledTime = new Date(dialogInput).getTime();
      if (scheduledTime <= Date.now()) { toast.error("Pick a future time."); return; }
      try {
        const pushSub = localStorage.getItem('nexus_push_subscription');
        const delaySeconds = Math.floor((scheduledTime - Date.now()) / 1000);
        await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || "Note Reminder",
            body: "Time to review your note!",
            email: localStorage.getItem('nexus_email_notifications') === 'true',
            push: localStorage.getItem('nexus_notifications') === 'true',
            pushSubscription: pushSub ? JSON.parse(pushSub) : null,
            delayStr: `${delaySeconds}s`
          }),
        });
        toast.success(`Reminder set for ${new Date(scheduledTime).toLocaleTimeString()}!`);
      } catch { toast.error("Failed to schedule reminder."); }
    } else if (dialog.type === 'category') {
      setCategory(dialogInput.trim());
      toast.success("Category set!");
    } else {
      const newTag = dialogInput.trim();
      if (!tags.includes(newTag)) setTags(prev => [...prev, newTag]);
      toast.success("Tag added!");
    }
    setDialog({ open: false, type: null });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 flex flex-col relative selection:bg-blue-100"
    >

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[55%] bg-blue-100/30 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[45%] bg-purple-100/20 rounded-full blur-[110px]" />
      </div>

      {/* ── STICKY TOOLBAR ── */}
      <div className="sticky top-0 z-30 w-full bg-[#f8f9fc]/85 backdrop-blur-xl border-b border-gray-100/80">
        {/* Top row: nav */}
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors active:scale-95">
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="text-[14px] font-semibold">Back</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[14px] font-bold text-gray-900">New Note</span>
            <span className="text-[11px] text-gray-400 font-medium tabular-nums">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-900 text-white text-[13px] font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {isSaving
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={13} strokeWidth={2.5} />
            }
            Save
          </button>
        </div>

        {/* Formatting toolbar */}
        <div className="max-w-3xl mx-auto px-3 pb-2 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {[
            { icon: Bold,        cmd: 'bold',                title: 'Bold' },
            { icon: Italic,      cmd: 'italic',              title: 'Italic' },
            { icon: List,        cmd: 'insertUnorderedList', title: 'Bullets' },
            { icon: ListOrdered, cmd: 'insertOrderedList',   title: 'Numbered' },
          ].map(({ icon: Icon, cmd, title: t }) => (
            <button
              key={cmd}
              onMouseDown={(e) => { e.preventDefault(); execFormat(cmd); }}
              title={t}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Icon size={15} strokeWidth={2} />
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

          {/* Tags as chips */}
          {tags.map(tag => (
            <span key={tag} className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 whitespace-nowrap">
              <Hash size={10} strokeWidth={2.5} />
              {tag}
              <button
                onClick={() => setTags(t => t.filter(x => x !== tag))}
                className="ml-0.5 text-gray-400 hover:text-gray-700"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          <button
            onClick={() => { setDialog({ open: true, type: 'tag' }); setDialogInput(""); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-[11px] font-bold text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
          >
            <Tag size={10} strokeWidth={2.5} />
            Tag
          </button>

          <button
            onClick={() => { setDialog({ open: true, type: 'category' }); setDialogInput(category); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-[11px] font-bold text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
          >
            <Folder size={10} strokeWidth={2.5} />
            {category || 'Category'}
          </button>

          <button
            onClick={() => { setDialog({ open: true, type: 'reminder' }); setDialogInput(""); }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-[11px] font-bold text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
          >
            <Bell size={10} strokeWidth={2.5} />
            Remind me
          </button>
        </div>
      </div>

      {/* ── MAIN WRITING AREA ── */}
      <div className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-5 pt-8 pb-40">

        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-[34px] font-bold text-gray-900 placeholder:text-gray-200 outline-none bg-transparent mb-5 leading-tight tracking-tight"
        />

        {/* Content editor */}
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateWordCount}
          data-placeholder="Start writing..."
          className="w-full min-h-[300px] text-[17px] font-normal text-gray-700 outline-none bg-transparent leading-[1.9] tracking-[0.01em] prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-2xl focus:outline-none"
        />

        {/* ── AI ASSIST SECTION ── */}
        <div className="mt-14">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200/50">
              <Sparkles size={12} className={`${isGenerating ? 'text-violet-500 animate-pulse' : 'text-violet-400'}`} />
              <span className="text-[12px] font-bold text-violet-600 uppercase tracking-widest">AI Assist</span>
            </div>
            {isGenerating && (
              <span className="text-[12px] font-medium text-gray-400 animate-pulse">Working on it...</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {AI_ACTIONS.map(({ key, label, icon: Icon, color, bg, desc }) => (
              <button
                key={key}
                disabled={isGenerating}
                onClick={() => handleAiAction(key)}
                className={`group flex items-start gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:scale-[1.02] active:scale-[0.98] transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {generatingAction === key
                    ? <div className={`w-4 h-4 border-2 ${color.replace('text-','border-')} border-t-transparent rounded-full animate-spin`} />
                    : <Icon size={16} className={color} strokeWidth={2} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5 leading-snug">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FLOATING BOTTOM SAVE BAR ── */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-5 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[12px] font-semibold">Auto-saved</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-[12px] font-semibold text-gray-400 tabular-nums">{wordCount} words</span>
          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-gray-900 text-white text-[12px] font-bold active:scale-95 transition-all disabled:opacity-60"
          >
            <Save size={12} strokeWidth={2.5} />
            Save Note
          </button>
        </div>
      </div>

      {/* ── DIALOG ── */}
      <AnimatePresence>
      {dialog.open && (() => {
        const cfg = {
          tag:      { icon: Tag,    gradient: 'from-blue-500 to-indigo-500',    title: 'Add a Tag',      subtitle: 'Tags help you search and filter notes quickly.',         placeholder: 'e.g. Ideas, Important', btn: 'Add Tag' },
          category: { icon: Folder, gradient: 'from-emerald-500 to-teal-500',   title: 'Set Category',   subtitle: 'Organize your note into a folder or workspace.',        placeholder: 'e.g. Work, Personal',   btn: 'Set Category' },
          reminder: { icon: Bell,   gradient: 'from-violet-500 to-purple-600',   title: 'Set a Reminder', subtitle: "You'll get a push notification at the selected time.", placeholder: '',                      btn: 'Schedule' },
        }[dialog.type!];
        const Icon = cfg.icon;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setDialog({ open: false, type: null })}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.25)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Gradient header */}
              <div className={`relative bg-gradient-to-br ${cfg.gradient} px-6 pt-7 pb-5`}>
                {/* Drag handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full" />

                <button
                  onClick={() => setDialog({ open: false, type: null })}
                  className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-white leading-tight">{cfg.title}</h3>
                    <p className="text-[12px] text-white/65 font-medium mt-0.5 leading-snug max-w-[240px]">{cfg.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Body — extra bottom padding to clear bottom nav */}
              <div className="px-5 pt-5 pb-[100px]">
                {dialog.type === 'reminder' ? (
                  <>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      autoFocus
                      value={dialogInput}
                      onChange={e => setDialogInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-[16px] font-medium text-gray-900 outline-none focus:border-gray-200 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all mb-4"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {dialog.type === 'category' ? 'Category Name' : 'Tag Name'}
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={dialogInput}
                      onChange={e => setDialogInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleDialogSubmit(); }}
                      placeholder={cfg.placeholder}
                      className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-[16px] font-medium text-gray-900 outline-none border border-gray-100 focus:border-gray-200 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all placeholder:text-gray-300 mb-4"
                    />
                  </>
                )}

                <button
                  onClick={handleDialogSubmit}
                  className={`w-full py-4 bg-gradient-to-r ${cfg.gradient} text-white rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-all shadow-lg mb-2`}
                >
                  {cfg.btn}
                </button>

                <button
                  onClick={() => setDialog({ open: false, type: null })}
                  className="w-full py-3 text-gray-400 font-semibold text-[14px] hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
      </AnimatePresence>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #d1d5db;
          pointer-events: none;
        }
      `}</style>
    </motion.div>
  );
}
