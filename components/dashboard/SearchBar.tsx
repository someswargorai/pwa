"use client";

import { Search, Mic, MicOff, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function SearchBar({ value, onChange }: { value?: string, onChange?: (val: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      if (onChange) onChange(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied.");
      } else {
        toast.error("A voice recognition error occurred.");
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleAction = () => {
    if (value) {
      if (isListening) stopListening();
      onChange?.('');
    } else {
      if (isListening) stopListening();
      else startListening();
    }
  };

  return (
    <div className="w-full relative mt-6 mb-7">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" strokeWidth={2.5} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-white/80 backdrop-blur-sm text-gray-900 rounded-2xl py-3.5 pl-10 pr-12 text-[15px] font-medium outline-none border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus:border-gray-200 focus:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all placeholder:text-gray-300"
        placeholder="Search notes..."
      />

      <button
        onClick={handleAction}
        className={`absolute inset-y-0 right-3 flex items-center justify-center w-9 h-9 my-auto rounded-xl transition-all ${
          isListening && !value
            ? "bg-red-50 text-red-500"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        {value ? (
          <X size={15} strokeWidth={2.5} />
        ) : isListening ? (
          <MicOff size={15} strokeWidth={2.5} className="animate-pulse" />
        ) : (
          <Mic size={15} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
