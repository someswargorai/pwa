"use client";

import { set, get } from "idb-keyval";
import { useState, useEffect } from "react";

function ClientPage() {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("Tap to initialize Nexus");
  const [transcript, setTranscript] = useState("");

  const [memoryResults, setMemoryResults] = useState<{keyword: string, facts: string[]} | null>(null);

  const speak = (text: string) => {
    setFeedback(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTimeout(() => {
        setFeedback("Tap to initialize Nexus");
        setTranscript("");
      }, 3000);
    };
  };

  const handleCommand = async (command: string) => {
    console.log("Command received: ", command);
    setFeedback("Thinking...");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: command,
          currentTime: new Date().toLocaleString()
        })
      });

      if (!res.ok) throw new Error("AI failed");
      const aiRes = await res.json();
      console.log("AI Intent:", aiRes);

      if (aiRes.intent === "SAVE_MEMORY") {
        if (aiRes.fact) {
          const existing: any[] = (await get("nexus_facts")) || [];
          existing.push({ text: aiRes.fact, timestamp: Date.now() });
          await set("nexus_facts", existing);
          speak("I will keep that in mind.");
          setMemoryResults(null);
        } else {
          speak("What did you want me to remember?");
        }
      } 
      else if (aiRes.intent === "SCHEDULE_TASK") {
        if (aiRes.task && aiRes.time_ms_from_now) {
           const existing: any[] = (await get("nexus_tasks")) || [];
           existing.push({ task: aiRes.task, timestamp: Date.now(), notifyAt: Date.now() + aiRes.time_ms_from_now });
           await set("nexus_tasks", existing);
           
           const subStr = localStorage.getItem("web_push_sub");
           if (subStr) {
              fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscription: JSON.parse(subStr),
                  title: "Nexus Task Reminder",
                  message: aiRes.task,
                  delay: aiRes.time_ms_from_now
                })
              });
           }
           speak(`I've scheduled a reminder to ${aiRes.task}.`);
        } else {
           speak("I didn't catch the time or task.");
        }
      }
      else if (aiRes.intent === "QUERY_MEMORY") {
        const existing: any[] = (await get("nexus_facts")) || [];
        let matches = existing;
        
        if (aiRes.time_filter) {
          const now = new Date();
          const filter = aiRes.time_filter.toLowerCase();
          if (filter.includes("today")) {
            matches = matches.filter(item => item.timestamp && new Date(item.timestamp).toDateString() === now.toDateString());
          } else if (filter.includes("yesterday")) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            matches = matches.filter(item => item.timestamp && new Date(item.timestamp).toDateString() === yesterday.toDateString());
          } else if (filter.includes("week")) {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            matches = matches.filter(item => item.timestamp && new Date(item.timestamp) >= startOfWeek);
          }
        }
        
        if (aiRes.topic) {
           matches = matches.filter(item => {
              const text = typeof item === 'string' ? item : item.text;
              return text.toLowerCase().includes(aiRes.topic!.toLowerCase());
           });
        }
        
        const facts = matches.map(item => typeof item === 'string' ? item : item.text);
        if (facts.length > 0) {
           let label = aiRes.topic ? `"${aiRes.topic}"` : "all memories";
           if (aiRes.time_filter) label += ` from ${aiRes.time_filter}`;
           setMemoryResults({ keyword: label, facts });
           speak(`I found ${facts.length} matches.`);
        } else {
           speak("I don't have any memories saved for that.");
           setMemoryResults(null);
        }
      }
      else if (aiRes.intent === "QUERY_TASKS") {
         const existing: any[] = (await get("nexus_tasks")) || [];
         const pending = existing.filter(t => t.notifyAt > Date.now()).map(t => t.task);
         if (pending.length > 0) {
            setMemoryResults({ keyword: "Pending Tasks", facts: pending });
            speak(`You have ${pending.length} pending tasks.`);
         } else {
            speak("You don't have any pending tasks.");
            setMemoryResults(null);
         }
      }
      else if (aiRes.intent === "GENERAL_COMMAND") {
         const cmd = aiRes.command_type;
         if (cmd === "open_youtube") {
           speak("Opening YouTube");
           window.location.href = "https://youtube.com";
         } else if (cmd === "open_github") {
           speak("Opening GitHub");
           window.location.href = "https://github.com";
         } else if (cmd === "dark_mode") {
           document.body.classList.toggle("dark");
           speak("Theme changed");
         } else if (cmd === "form") {
           speak("Navigating to form");
           window.location.href = "/form";
         } else if (cmd === "joke") {
           speak("Why do programmers prefer dark mode? Because light attracts bugs!");
         } else if (cmd === "coin") {
           speak("I flipped a coin and it landed on heads");
         } else if (cmd === "time") {
           speak(`It is ${new Date().toLocaleTimeString()}`);
         } else if (cmd === "creator") {
           speak("I was created by you, my brilliant developer!");
         } else {
           speak("Command not recognized.");
         }
      } else {
         speak("I'm not sure what you mean.");
      }

    } catch(err) {
      console.error(err);
      speak("My AI core is currently offline.");
    }
  };

  const listen = async () => {
    // FIX FOR iOS SILENCE: We must play an empty sound immediately on click to "unlock" the audio engine
    const unlockAudio = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(unlockAudio);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please use a compatible browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening...");
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(`"${text}"`);
      handleCommand(text);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error: ", event.error);
      setIsListening(false);
      setFeedback("Microphone connection failed.");
      setTimeout(() => setFeedback("Tap to initialize Nexus"), 3000);
    };
    
    recognition.start();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = document.getElementById("nexus-container");
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        target.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      id="nexus-container"
      className="min-h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Immersive Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {/* Mouse tracking interactive glow (Desktop only) */}
         <div 
           className="hidden sm:block absolute w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" 
           style={{ 
             left: 'var(--mouse-x, 50%)', 
             top: 'var(--mouse-y, 50%)', 
             transition: 'left 0.15s ease-out, top 0.15s ease-out' 
           }} 
         />
         
         {/* Ambient floating orbs */}
         <div className="absolute top-[10%] left-[10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
         <div className="absolute bottom-[5%] right-[5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-fuchsia-600/10 rounded-full blur-[90px] sm:blur-[100px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md h-full justify-center">
        
        {/* Dynamic Minimalist Status Text */}
        <div className="h-40 flex flex-col items-center justify-end mb-8 w-full">
          {isListening && (
            <div className="flex gap-1.5 mb-6 h-6 items-end justify-center">
              <div className="w-1 bg-indigo-400 rounded-full animate-[bounce_1s_ease-in-out_infinite] h-full" style={{animationDelay: '0.0s'}} />
              <div className="w-1 bg-fuchsia-400 rounded-full animate-[bounce_1.2s_ease-in-out_infinite] h-4" style={{animationDelay: '0.1s'}} />
              <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-5" style={{animationDelay: '0.2s'}} />
              <div className="w-1 bg-indigo-400 rounded-full animate-[bounce_1.1s_ease-in-out_infinite] h-3" style={{animationDelay: '0.3s'}} />
              <div className="w-1 bg-fuchsia-400 rounded-full animate-[bounce_0.9s_ease-in-out_infinite] h-full" style={{animationDelay: '0.4s'}} />
            </div>
          )}
          
          <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 animate-pulse">
            Nexus AI
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-white text-center tracking-tight transition-all duration-300 px-4">
            {feedback}
          </h2>
          {transcript && (
            <p className="text-indigo-300/80 mt-4 text-center italic font-light text-base sm:text-lg transition-all duration-300 px-4">
              {transcript}
            </p>
          )}
        </div>

        {memoryResults && (
          <div className="mb-12 w-full max-w-lg transition-all animate-in fade-in slide-in-from-bottom-4 px-4">
            <div className="flex justify-between items-baseline mb-4 border-b border-white/10 pb-2">
              <h3 className="text-xs font-semibold text-fuchsia-400/80 tracking-[0.2em] uppercase">
                Results for "{memoryResults.keyword}"
              </h3>
              <button onClick={() => setMemoryResults(null)} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
                Close
              </button>
            </div>
            <ul className="max-h-[40vh] overflow-y-auto custom-scrollbar flex flex-col pr-2">
              {memoryResults.facts.map((fact, i) => (
                <li key={i} className="text-slate-200 font-light text-sm sm:text-base leading-relaxed py-4 border-b border-white/5 last:border-0 text-left hover:bg-white/5 px-3 rounded-lg transition-colors cursor-default">
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The Core Orb Interactive Button */}
        <button 
          onClick={listen}
          disabled={isListening}
          className={`relative group flex items-center justify-center transition-all duration-700 ease-out focus:outline-none mt-auto sm:mt-0 ${
            isListening ? "scale-110" : "hover:scale-105 hover:-translate-y-1"
          }`}
        >
          {/* Outer rotating energy ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-60 blur-md transition-all duration-700 ${
            isListening ? "animate-[spin_2s_linear_infinite] scale-125 opacity-100 blur-2xl" : "group-hover:opacity-100 group-hover:blur-xl"
          }`} />
          
          {/* Inner pulsating core */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 transition-all duration-700 ${
            isListening ? "animate-pulse" : "group-hover:opacity-80"
          }`} />

          {/* Solid sleek center plate */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-inner border border-white/10 z-10 overflow-hidden">
            {/* Interactive inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg 
              className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-500 relative z-10 ${isListening ? "text-fuchsia-400 scale-110 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]" : "text-slate-400 group-hover:text-white"}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="1.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
        </button>

      </div>
    </div>
  );
}

export default ClientPage;