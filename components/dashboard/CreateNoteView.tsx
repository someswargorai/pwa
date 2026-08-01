"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Save, Tag, Folder, Bell, Sparkles, BrainCircuit, ListOrdered, Type, X } from "lucide-react";
import { toast } from "sonner";

export default function CreateNoteView({ onClose, onSave }: { onClose: () => void, onSave?: (note: {title: string, content: string, tags: string[]}) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>(["Note"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{isOpen: boolean, type: 'tag' | 'category' | 'reminder' | null}>({isOpen: false, type: null});
  const [dialogInput, setDialogInput] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleSave = () => {
    const finalContent = contentRef.current ? contentRef.current.innerHTML : content;
    if (!title.trim() && !finalContent.trim()) {
      toast.error("Please add a title or content before saving");
      return;
    }
    if (onSave) {
      onSave({ title: title.trim() || "Untitled Note", content: finalContent.trim(), tags });
      toast.success("Note saved successfully");
    }
  };

  const handleAiAction = async (action: 'summarize' | 'rewrite' | 'bullets' | 'title') => {
    if (!content.trim()) return toast.error("Please write some content first!");
    setIsGenerating(true);
    const toastId = toast.loading("AI is thinking...");
    try {
      let prompt = "";
      if (action === 'summarize') prompt = `Summarize the following text concisely:\n\n${content}`;
      if (action === 'rewrite') prompt = `Rewrite the following text to be extremely clear, professional, and readable:\n\n${content}`;
      if (action === 'bullets') prompt = `Convert the following text into a clean bulleted list:\n\n${content}`;
      if (action === 'title') prompt = `Generate a short, catchy title (maximum 5 words) for the following text. Do NOT wrap it in HTML tags like <h1>, just plain text:\n\n${content}`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      if (action === 'title') {
        setTitle(data.text.replace(/<[^>]*>?/gm, '')); // Strip any accidental HTML
      } else {
        setContent(data.text);
        if (contentRef.current) contentRef.current.innerHTML = data.text;
      }
      toast.success("Done!", { id: toastId });
    } catch (e) {
      toast.error("AI generation failed.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };
  const openDialog = (type: 'tag' | 'category' | 'reminder') => {
    setDialogConfig({ isOpen: true, type });
    setDialogInput("");
  };

  const handleDialogSubmit = async () => {
    if (!dialogInput.trim()) return;
    
    if (dialogConfig.type === 'reminder') {
      const scheduledTime = new Date(dialogInput).getTime();
      const delay = scheduledTime - Date.now();
      
      if (delay <= 0) {
        toast.error("Please pick a time in the future.");
        return;
      }

      if (!("Notification" in window)) {
        toast.error("This browser does not support notifications.");
        return;
      }

      if (localStorage.getItem('nexus_notifications') !== 'true') {
        toast.error("Please enable push notifications in Settings first.");
        return;
      }

      let permission = Notification.permission;
      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        toast.success(`Reminder scheduled for ${new Date(scheduledTime).toLocaleTimeString()}!`);
        
        // Try to use the Notification Triggers API for true background scheduling (Android/Chrome)
        if ('showTrigger' in Notification.prototype && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title || "Note Reminder", {
              body: "It's time to review your note!",
              icon: "/icon-192.jpg",
              // @ts-expect-error - experimental API
              showTrigger: new window.TimestampTrigger(scheduledTime)
            });
          });
        } else {
          // Native fallback scheduler (only works while app is open)
          setTimeout(() => {
            if (localStorage.getItem('nexus_notifications') !== 'true') return;
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title || "Note Reminder", {
                  body: "It's time to review your note!",
                  icon: "/icon-192.jpg"
                });
              });
            } else {
              new Notification(title || "Note Reminder", {
                body: "It's time to review your note!",
                icon: "/icon-192.jpg"
              });
            }
          }, delay);
        }
      } else {
        toast.error("Notification permission denied.");
      }
    } else {
      setTags([...tags, dialogInput.trim()]);
      toast.success(`${dialogConfig.type === 'tag' ? 'Tag' : 'Category'} added!`);
    }
    
    setDialogConfig({ isOpen: false, type: null });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f3f4f6] text-gray-900 pb-6 relative selection:bg-brand-blue selection:text-white flex flex-col z-50 overflow-y-auto">
      
      {/* Background gradients for premium feel */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-4 flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-6">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900">Create Note</h1>
          <button onClick={handleSave} className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-blue shadow-sm border border-brand-blue text-white hover:bg-blue-600 active:scale-95 transition-all">
            <Save size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Inputs */}
        <div className="w-full bg-white rounded-3xl p-5 mb-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white">
          <div className="flex items-center justify-between mb-2">
            <input 
              type="text" 
              placeholder="Title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[18px] font-semibold text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
            />
            <div className="w-6 h-6 flex items-center justify-center text-gray-300 ml-2">
               <Sparkles size={16} />
            </div>
          </div>
          <div className="w-full h-[1px] bg-gray-100 mb-4"></div>
          <div 
            ref={contentRef}
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            className="w-full min-h-[120px] max-h-[40vh] overflow-y-auto text-[15px] font-medium text-gray-700 outline-none bg-transparent leading-relaxed prose prose-sm focus:outline-none empty:before:content-['Write_Your_Notes...'] empty:before:text-gray-300 custom-scrollbar"
          ></div>
        </div>

        {/* Action Tags */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => openDialog('tag')} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full shadow-sm text-[13px] font-semibold text-red-500 border border-gray-100 whitespace-nowrap active:scale-95 transition-transform">
            <Tag size={14} strokeWidth={2.5} />
            Add Tag
          </button>
          <button onClick={() => openDialog('category')} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full shadow-sm text-[13px] font-semibold text-green-500 border border-gray-100 whitespace-nowrap active:scale-95 transition-transform">
            <Folder size={14} strokeWidth={2.5} />
            Add Category
          </button>
          <button onClick={() => openDialog('reminder')} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full shadow-sm text-[13px] font-semibold text-purple-500 border border-gray-100 whitespace-nowrap active:scale-95 transition-transform">
            <Bell size={14} strokeWidth={2.5} />
            Reminder
          </button>
        </div>

        {/* AI Assist */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[17px] font-semibold text-gray-900">AI Assist</h2>
          {isGenerating && <Sparkles size={14} className="text-purple-500 animate-pulse" />}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button disabled={isGenerating} onClick={() => handleAiAction('summarize')} className="flex flex-col items-start bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all text-left border border-white hover:border-gray-100 disabled:opacity-50">
             <div className="w-10 h-10 rounded-xl bg-green-50/50 flex items-center justify-center text-green-500 mb-3">
                <Sparkles size={18} strokeWidth={2.5} />
             </div>
             <span className="font-semibold text-[14px] text-gray-900 leading-snug">Summarize<br/>Note</span>
          </button>

          <button disabled={isGenerating} onClick={() => handleAiAction('rewrite')} className="flex flex-col items-start bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all text-left border border-white hover:border-gray-100 disabled:opacity-50">
             <div className="w-10 h-10 rounded-xl bg-purple-50/50 flex items-center justify-center text-purple-500 mb-3">
                <BrainCircuit size={18} strokeWidth={2.5} />
             </div>
             <span className="font-semibold text-[14px] text-gray-900 leading-snug">Rewrite for<br/>Clarity</span>
          </button>

          <button disabled={isGenerating} onClick={() => handleAiAction('bullets')} className="flex flex-col items-start bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all text-left border border-white hover:border-gray-100 disabled:opacity-50">
             <div className="w-10 h-10 rounded-xl bg-orange-50/50 flex items-center justify-center text-orange-400 mb-3">
                <ListOrdered size={18} strokeWidth={2.5} />
             </div>
             <span className="font-semibold text-[14px] text-gray-900 leading-snug">Convert to<br/>Bullets</span>
          </button>

          <button disabled={isGenerating} onClick={() => handleAiAction('title')} className="flex flex-col items-start bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all text-left border border-white hover:border-gray-100 disabled:opacity-50">
             <div className="w-10 h-10 rounded-xl bg-pink-50/50 flex items-center justify-center text-pink-400 mb-3">
                <Type size={18} strokeWidth={2.5} />
             </div>
             <span className="font-semibold text-[14px] text-gray-900 leading-snug">Generate<br/>Title</span>
          </button>
        </div>

      </div>
      
      {/* Custom Dialog */}
      {dialogConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-[#f8f9fc]/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative animate-in zoom-in-95 duration-300 mx-auto">
            <button onClick={() => setDialogConfig({ isOpen: false, type: null })} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
            <h3 className="text-[18px] font-bold text-gray-900 mb-5 pl-1">
              {dialogConfig.type === 'reminder' ? 'Set Reminder' : `Add ${dialogConfig.type === 'tag' ? 'Tag' : 'Category'}`}
            </h3>
            
            {dialogConfig.type === 'reminder' ? (
              <input 
                type="datetime-local" 
                autoFocus
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6 text-[16px] font-medium text-gray-900 outline-none focus:border-brand-blue focus:ring-0 transition-colors"
              />
            ) : (
              <input 
                type="text" 
                autoFocus
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleDialogSubmit() }}
                placeholder={`e.g. ${dialogConfig.type === 'tag' ? 'Important, Ideas' : 'Work, Personal'}`}
                className="w-full bg-transparent border-b border-gray-200 px-1 py-2 mb-6 text-[16px] font-medium text-gray-900 outline-none focus:border-brand-blue focus:ring-0 transition-colors placeholder:text-gray-300 placeholder:font-normal"
              />
            )}
            
            <button onClick={handleDialogSubmit} className="w-full py-3 bg-gray-900 text-white rounded-2xl font-medium text-[15px] hover:bg-gray-800 active:scale-[0.98] transition-all">
              {dialogConfig.type === 'reminder' ? 'Schedule Notification' : `Add ${dialogConfig.type === 'tag' ? 'Tag' : 'Category'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
