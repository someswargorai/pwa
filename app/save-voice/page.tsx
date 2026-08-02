"use client";

import 'regenerator-runtime/runtime';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Mic, Square, Save, AudioLines } from "lucide-react";
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

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Scroll to bottom when transcript changes only if it overflows
  useEffect(() => {
    if (listening && containerRef.current && transcriptEndRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight > clientHeight) {
        transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [transcript, listening]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 text-center">
        <p>Browser doesn't support speech recognition. Please try Chrome.</p>
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
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleSave = async () => {
    const finalContent = editedTranscript !== null ? editedTranscript : transcript;
    if (!finalContent.trim()) return;
    
    if (listening) {
      SpeechRecognition.stopListening();
    }

    const noteObj: Note = {
      id: Date.now().toString(),
      title: "Voice Memo",
      content: finalContent.trim(),
      tags: ["Voice", "Transcript"],
      createdAt: Date.now(),
      color: "#e0f2fe" // Blue tint for voice
    };

    const existingNotes = (await get("nexus_dashboard_notes")) || [];
    const updatedNotes = [noteObj, ...existingNotes];
    
    await set("nexus_dashboard_notes", updatedNotes);
    router.push("/");
  };

  // Format time (00:00:26)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const displayTranscript = editedTranscript !== null ? editedTranscript : transcript;

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8f9fc] text-gray-900 pb-20 relative flex flex-col z-50">
      
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#f8f9fc] via-[#f0f4ff] to-[#e0eaff]">
        <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-4 flex flex-col h-full flex-1">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-6">
          <button onClick={() => router.push("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900">Audio Note</h1>
          <button 
            onClick={handleSave} 
            disabled={!displayTranscript}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all ${
              displayTranscript ? "bg-brand-blue border-brand-blue text-white hover:bg-blue-600 active:scale-95" : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <Save size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Live Transcription / Editable Text */}
        <div ref={containerRef} className="w-full flex-1 overflow-y-auto px-4 py-4 mb-2 flex flex-col items-center justify-start max-h-[40vh]">
           {displayTranscript || listening ? (
             listening ? (
               <div className="w-full flex flex-col items-center pb-4">
                 <p className="text-[20px] font-medium text-gray-700 leading-relaxed text-center animate-fade-in w-full">
                   {displayTranscript}
                   <span className="animate-pulse">_</span>
                 </p>
                 <div ref={transcriptEndRef} className="h-1" />
               </div>
             ) : (
               <textarea 
                 value={displayTranscript}
                 onChange={(e) => setEditedTranscript(e.target.value)}
                 className="w-full h-full min-h-[250px] bg-transparent text-[20px] font-medium text-gray-700 leading-relaxed text-center outline-none resize-none"
                 placeholder="Edit your transcript here..."
               />
             )
           ) : (
             <p className="text-[18px] font-medium text-gray-400 text-center px-4">
               Tap the microphone to start recording a voice memo. It will be transcribed automatically.
             </p>
           )}
        </div>

        {/* Waveform Visualization (Mocked using CSS animation) */}
        <div className="h-16 w-full flex items-center justify-center gap-1.5 mb-8">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 rounded-full bg-brand-blue transition-all duration-300 ${listening ? 'animate-waveform' : 'h-2 opacity-30'}`}
              style={{
                height: listening ? `${Math.max(20, Math.random() * 100)}%` : '6px',
                animationDelay: `${i * 0.05}s`
              }}
            ></div>
          ))}
        </div>

        {/* Controls */}
        <div className="w-full bg-white rounded-[40px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center border border-white">
          <button 
            onClick={toggleRecording}
            className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
              listening ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-brand-blue hover:bg-blue-600 shadow-blue-500/30"
            }`}
          >
            {listening ? <Square size={28} className="text-white fill-white" /> : <Mic size={32} className="text-white" />}
          </button>
          
          <div className="mt-4 flex items-center gap-2">
            {listening && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
            <span className="text-[16px] font-semibold text-gray-900 tracking-widest">{formatTime(time)}</span>
          </div>
        </div>

      </div>

      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        .animate-waveform {
          animation: waveform 1.2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
