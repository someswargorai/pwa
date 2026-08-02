"use client";

import 'regenerator-runtime/runtime';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Mic, Square, Trash2 } from "lucide-react";
import { get, set } from "idb-keyval";
import { Note } from "@/components/dashboard/RecentNotes";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function SaveVoicePage() {
  const router = useRouter();
  const [time, setTime] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [editedTranscript, setEditedTranscript] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bars] = useState(() => Array.from({ length: 40 }, (_, i) => i));

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (listening && containerRef.current && transcriptEndRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight > clientHeight) {
        transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [transcript, listening]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic size={28} className="text-red-400" />
          </div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">Not Supported</h2>
          <p className="text-[14px] text-gray-500">Please use Chrome for voice recording.</p>
        </div>
      </div>
    );
  }

  const toggleRecording = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      resetTranscript();
      setEditedTranscript(null);
      setTime(0);
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      timerRef.current = setInterval(() => setTime((p) => p + 1), 1000);
    }
  };

  const handleSave = async () => {
    const finalContent = editedTranscript !== null ? editedTranscript : transcript;
    if (!finalContent.trim()) return;
    if (listening) SpeechRecognition.stopListening();
    setIsSaving(true);
    const noteObj: Note = {
      id: Date.now().toString(),
      title: "Voice Memo",
      content: finalContent.trim(),
      tags: ["Voice", "Transcript"],
      createdAt: Date.now(),
      color: "#e0f2fe",
    };
    const existing = (await get("nexus_dashboard_notes")) || [];
    await set("nexus_dashboard_notes", [noteObj, ...existing]);
    setTimeout(() => router.push("/"), 400);
  };

  const handleDiscard = () => {
    if (listening) SpeechRecognition.stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    resetTranscript();
    setEditedTranscript(null);
    setTime(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const displayTranscript = editedTranscript !== null ? editedTranscript : transcript;
  const hasContent = !!displayTranscript.trim();

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 flex flex-col z-50 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-5%] w-[70%] h-[60%] rounded-full blur-[140px] transition-all duration-1000 ${listening ? 'bg-blue-300/30' : 'bg-blue-100/20'}`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[60%] h-[50%] rounded-full blur-[120px] transition-all duration-1000 ${listening ? 'bg-indigo-300/20' : 'bg-purple-100/15'}`} />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-30 w-full bg-[#f8f9fc]/80 backdrop-blur-xl border-b border-gray-100/80 px-5 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors active:scale-95">
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="text-[14px] font-semibold">Back</span>
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-[15px] font-bold text-gray-900">Voice Note</h1>
            {listening && (
              <span className="text-[11px] font-semibold text-red-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                Live
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!hasContent || isSaving}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-bold transition-all active:scale-95 ${
              hasContent && !isSaving
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save size={13} strokeWidth={2.5} />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-10 flex-1 w-full max-w-xl mx-auto px-5 pt-10 pb-10 flex flex-col">

        {/* Transcript / Idle area */}
        <div
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center overflow-y-auto mb-6"
          style={{ maxHeight: '38vh' }}
        >
          {!hasContent && !listening ? (
            /* Idle state */
            <div className="text-center select-none">
              <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center justify-center mx-auto mb-5">
                <Mic size={32} className="text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-[17px] font-semibold text-gray-400 mb-1">Ready to record</p>
              <p className="text-[13px] text-gray-300 font-medium max-w-[220px] mx-auto leading-relaxed">
                Tap the button below and start speaking — we'll transcribe it instantly.
              </p>
            </div>
          ) : listening ? (
            /* Live transcript */
            <div className="w-full">
              <p className="text-[20px] font-medium text-gray-700 leading-relaxed text-center">
                {displayTranscript || <span className="text-gray-300">Listening...</span>}
                <span className="animate-pulse text-brand-blue ml-0.5">|</span>
              </p>
              <div ref={transcriptEndRef} className="h-1" />
            </div>
          ) : (
            /* Editable post-record */
            <textarea
              value={displayTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full h-full min-h-[200px] bg-transparent text-[18px] font-medium text-gray-700 leading-relaxed text-center outline-none resize-none placeholder:text-gray-300"
              placeholder="Edit transcript..."
              autoFocus
            />
          )}
        </div>

        {/* Waveform */}
        <div className="w-full flex items-end justify-center gap-[3px] mb-10" style={{ height: '48px' }}>
          {bars.map((_, i) => {
            const seed = Math.sin(i * 2.5) * 0.5 + 0.5;
            return (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  listening ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
                style={{
                  width: '3px',
                  height: listening
                    ? `${20 + seed * 60}%`
                    : `${10 + seed * 20}%`,
                  animationDelay: `${i * 0.04}s`,
                  animation: listening ? `wave ${0.8 + seed * 0.6}s ease-in-out infinite alternate` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Main record button + timer */}
        <div className="flex flex-col items-center gap-5">
          {/* Timer */}
          <div className={`font-mono text-[32px] font-light tracking-[0.12em] transition-colors ${listening ? 'text-gray-900' : 'text-gray-300'}`}>
            {formatTime(time)}
          </div>

          {/* Record button */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring when recording */}
            {listening && (
              <>
                <div className="absolute w-[100px] h-[100px] rounded-full bg-red-400/20 animate-ping" />
                <div className="absolute w-[84px] h-[84px] rounded-full bg-red-400/10 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleRecording}
              className={`relative w-[72px] h-[72px] flex items-center justify-center rounded-full shadow-xl active:scale-95 transition-all duration-300 ${
                listening
                  ? 'bg-red-500 shadow-red-500/30 hover:bg-red-600'
                  : 'bg-gray-900 shadow-gray-900/25 hover:bg-gray-800'
              }`}
            >
              {listening
                ? <Square size={22} className="text-white fill-white" />
                : <Mic size={26} className="text-white" strokeWidth={1.5} />
              }
            </button>
          </div>

          {/* Label */}
          <p className="text-[13px] font-semibold text-gray-400 tracking-wide">
            {listening ? 'Tap to stop' : hasContent ? 'Record again' : 'Tap to record'}
          </p>
        </div>

        {/* Discard button */}
        {hasContent && !listening && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-red-500 transition-colors active:scale-95"
            >
              <Trash2 size={13} />
              Discard recording
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
