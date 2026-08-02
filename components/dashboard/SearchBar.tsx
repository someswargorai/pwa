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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      if (onChange) {
        onChange(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone access to use voice search.");
      } else {
        toast.error("A voice recognition error occurred.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleAction = () => {
    if (value) {
      if (isListening) stopListening();
      onChange?.('');
    } else {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  return (
    <div className="w-full relative mt-4 mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" strokeWidth={2.5} />
      </div>
      
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-white text-gray-900 rounded-2xl py-3.5 pl-11 pr-12 text-[16px] font-medium outline-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-transparent focus:border-gray-200 transition-all placeholder:text-gray-400"
        placeholder="Search notes, tags..." 
      />
      
      <button 
        onClick={handleAction}
        className={`absolute inset-y-0 right-2 flex items-center justify-center w-10 transition-colors ${
          (isListening && !value) ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-brand-blue"
        }`}
      >
        {value ? (
          <X size={18} strokeWidth={2.5} />
        ) : isListening ? (
          <MicOff size={18} strokeWidth={2.5} />
        ) : (
          <Mic size={18} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
