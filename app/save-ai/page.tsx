"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Send, Save, Copy, RotateCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  loading?: boolean;
};

const SUGGESTIONS = [
  "Write a packing list for a beach trip 🏖️",
  "Summarise the benefits of meditation 🧘",
  "Draft a weekly workout plan 💪",
  "Give me ideas for a startup name 🚀",
  "Write a morning routine for productivity ⚡",
];

export default function SaveAIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isGenerating) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: userText };
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = { id: loadingId, role: "ai", text: "", loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    setIsGenerating(true);

    try {
      const history = messages
        .filter(m => !m.loading)
        .map(m => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
        .join("\n");

      const prompt = history
        ? `${history}\nUser: ${userText}\n\nContinue the conversation naturally and helpfully. Keep the response concise and well-formatted.`
        : `Write a complete, well-formatted, helpful response about: ${userText}`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();

      setMessages(prev =>
        prev.map(m => m.id === loadingId ? { ...m, text: data.text, loading: false } : m)
      );
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === loadingId ? { ...m, text: "Something went wrong. Please try again.", loading: false } : m)
      );
      toast.error("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSave = async (text: string) => {
    const firstUser = messages.find(m => m.role === "user");
    const noteObj: Note = {
      id: Date.now().toString(),
      title: firstUser?.text.substring(0, 40) + (firstUser && firstUser.text.length > 40 ? "..." : "") || "AI Note",
      content: text,
      tags: ["AI", "Generated"],
      createdAt: Date.now(),
      color: "#f3e8ff",
    };
    const existing = (await get("nexus_dashboard_notes")) || [];
    await set("nexus_dashboard_notes", [noteObj, ...existing]);
    window.dispatchEvent(new Event('notesUpdated'));
    toast.success("Note saved!");
    setTimeout(() => router.push("/"), 500);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    /* WhatsApp-style Fixed Viewport Layout */
    <div className="fixed inset-0 flex flex-col bg-[#f8f9fc] z-50 overflow-hidden" style={{ height: '100dvh' }}>

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[55%] h-[50%] bg-violet-200/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[50%] h-[45%] bg-fuchsia-200/15 rounded-full blur-[110px]" />
      </div>

      {/* ── HEADER ── */}
      <div className="bg-[#f8f9fc]/90 backdrop-blur-xl border-b border-gray-100/80 px-4 py-3 flex items-center gap-3 shrink-0 relative z-20">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors active:scale-90 shrink-0"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Avatar + name */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-md">
          <Sparkles size={16} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 leading-tight">Nexus AI</p>
          <p className={`text-[11px] font-semibold leading-tight ${isGenerating ? "text-violet-500 animate-pulse" : "text-gray-400"}`}>
            {isGenerating ? "typing..." : "Ask me anything"}
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors active:scale-90"
            title="Clear chat"
          >
            <RotateCcw size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── MESSAGES (Scrollable Area) ── */}
      <div className="flex-1 w-full px-4 py-4 relative z-10 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-10">
           
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Nexus AI</h2>
            <p className="text-[14px] text-gray-400 font-medium leading-relaxed max-w-[240px] mb-8">
              Chat with AI, refine your ideas, then save the best response as a note.
            </p>

            {/* Suggestion chips */}
            <div className="w-full flex flex-col gap-2 max-w-sm">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-[13px] font-semibold text-gray-700 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex flex-col gap-3 max-w-xl mx-auto">
          <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >

              {/* AI avatar */}
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mb-0.5 shadow-sm">
                  <Sparkles size={12} className="text-white" strokeWidth={2} />
                </div>
              )}

              <div className={`max-w-[82%] relative group ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {/* Bubble */}
                <div className={`rounded-[20px] ${
                  msg.role === "user"
                    ? "bg-gray-900 text-white rounded-br-[6px] px-4 py-3"
                    : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-[6px] px-4 py-3"
                }`}>
                  {msg.loading ? (
                    <div className="flex items-center gap-1 py-1 px-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : msg.role === "user" ? (
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div
                      className="ai-prose text-[14px] leading-relaxed text-gray-800"
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  )}
                </div>

                {/* Actions for AI messages */}
                {msg.role === "ai" && !msg.loading && msg.text && (
                  <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-100 shadow-sm text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors active:scale-95"
                    >
                      {copied === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      {copied === msg.id ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleSave(msg.text)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500 shadow-sm text-[11px] font-bold text-white hover:bg-violet-600 transition-colors active:scale-95"
                    >
                      <Save size={11} />
                      Save as note
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div className="bg-[#f8f9fc]/95 backdrop-blur-xl border-t border-gray-100/80 px-4 pt-3 shrink-0 relative z-20" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-xl mx-auto flex items-end gap-2.5">
          {/* Input */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.05)] focus-within:border-violet-300 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message Nexus AI..."
              disabled={isGenerating}
              rows={1}
              style={{ fontSize: "16px", lineHeight: "1.5" }}
              className="w-full bg-transparent text-gray-900 font-medium placeholder:text-gray-400 outline-none resize-none overflow-hidden disabled:opacity-50"
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isGenerating}
            className={`shrink-0 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
              input.trim() && !isGenerating
                ? "w-10 bg-gray-900 text-white shadow-lg shadow-gray-900/25 hover:bg-gray-800"
                : "w-10 bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {isGenerating
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              : <Send size={15} strokeWidth={2.5} className={input.trim() ? "text-white -rotate-0 translate-x-px" : "text-gray-300"} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
