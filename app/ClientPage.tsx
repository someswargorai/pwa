"use client";

import { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeech } from '@capacitor-community/speech-recognition';
import { Contacts as NativeContacts } from '@capacitor-community/contacts';

function ClientPage() {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("Tap to initialize Nexus");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      NativeSpeech.addListener("partialResults", (data: any) => {
        if (data.matches && data.matches.length > 0) {
          const text = data.matches[0];
          setTranscript(`"${text}"`);
          handleCommand(text);
          setIsListening(false);
          NativeSpeech.stop();
        }
      });
    }
  }, []);

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
    command = command.toLowerCase();
    console.log("Command received: ", command);
    
    if (command.includes("open youtube")) {
      speak("Opening YouTube");
      window.location.href = "https://youtube.com";
    }
    else if (command.includes("open github")) {
      speak("Opening GitHub");
      window.location.href = "https://github.com";
    }
    else if (command.includes("what time") || command.includes("current time")) {
      speak(`It is ${new Date().toLocaleTimeString()}`);
    }
    else if (command.includes("change theme") || command.includes("dark mode")) {
      document.body.classList.toggle("dark");
      speak("Theme changed successfully");
    }
    else if (command.includes("open form") || command.includes("go to form")) {
      speak("Navigating to the forms page");
      window.location.href = "/form";
    }
    else if (command.includes("make a call") || command.includes("call someone")) {
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await NativeContacts.requestPermissions();
          if (perm.contacts === 'granted') {
            const result = await NativeContacts.pickContact({ projection: { name: true, phones: true } });
            const contact = result.contact;
            if (contact && contact.phones && contact.phones.length > 0) {
              const phone = contact.phones[0].number;
              speak(`Calling ${contact.name?.display}`);
              window.location.href = `tel:${phone}`;
            } else {
              speak("No phone number found for that contact.");
            }
          } else {
            speak("I need contacts permission to make calls natively.");
          }
        } catch (error) {
          console.error("Native Contact picker error:", error);
          speak("I couldn't access your contacts.");
        }
      } else if ('contacts' in navigator) {
        try {
          speak("Select a contact to call");
          const contacts = await (navigator as any).contacts.select(
            ["name", "tel"],
            { multiple: false }
          );
          if (contacts && contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
            const name = contacts[0].name[0];
            const phone = contacts[0].tel[0];
            speak(`Calling ${name}`);
            window.location.href = `tel:${phone}`;
          } else {
            speak("No phone number found for that contact.");
          }
        } catch (error) {
          console.error("Contact picker error:", error);
          speak("I couldn't access your contacts.");
        }
      } else {
        speak("The Contact Picker API is not supported on this browser.");
      }
    }
    else if (command.includes("tell me a joke")) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!", 
        "Why did the web developer walk out of the restaurant? Because of the table layout.", 
        "I would tell you a joke about UDP, but you might not get it."
      ];
      speak(jokes[Math.floor(Math.random() * jokes.length)]);
    }
    else if (command.includes("flip a coin")) {
      const coin = Math.random() > 0.5 ? "Heads" : "Tails";
      speak(`I flipped a coin and it landed on ${coin}`);
    }
    else if (command.includes("who created you") || command.includes("who is your creator")) {
      speak("I was created by you, my brilliant developer!");
    }
    else {
      speak("Command not recognized. Please try again.");
    }
  };

  const listen = async () => {
    // FIX FOR iOS SILENCE: We must play an empty sound immediately on click to "unlock" the audio engine
    const unlockAudio = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(unlockAudio);

    if (Capacitor.isNativePlatform()) {
      try {
        const hasPermission = await NativeSpeech.checkPermissions();
        if (hasPermission.speechRecognition !== 'granted') {
          await NativeSpeech.requestPermissions();
        }
        
        setIsListening(true);
        setFeedback("Native Listening...");
        setTranscript("");
        
        await NativeSpeech.start({
          language: "en-US",
          maxResults: 1,
          prompt: "Listening...",
          partialResults: true,
          popup: false,
        });
      } catch (err) {
        console.error("Native speech recognition error", err);
        setIsListening(false);
        setFeedback("Microphone failed natively.");
      }
      return;
    }

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

  return (
    <div className="min-h-[85vh] bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden rounded-3xl mx-4 my-6 shadow-2xl border border-white/5">
      {/* Immersive Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        
        {/* Dynamic Minimalist Status Text */}
        <div className="h-32 flex flex-col items-center justify-end mb-16">
          <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 animate-pulse">
            Nexus AI
          </p>
          <h2 className="text-3xl font-light text-white text-center tracking-tight transition-all duration-300">
            {feedback}
          </h2>
          {transcript && (
            <p className="text-indigo-300/80 mt-4 text-center italic font-light text-lg transition-all duration-300">
              {transcript}
            </p>
          )}
        </div>

        {/* The Core Orb Interactive Button */}
        <button 
          onClick={listen}
          disabled={isListening}
          className={`relative group flex items-center justify-center transition-all duration-700 ease-out focus:outline-none ${
            isListening ? "scale-110" : "hover:scale-105"
          }`}
        >
          {/* Outer rotating energy ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-60 blur-md transition-all duration-700 ${
            isListening ? "animate-[spin_2s_linear_infinite] scale-125 opacity-100 blur-2xl" : "group-hover:opacity-100 group-hover:blur-xl"
          }`} />
          
          {/* Inner pulsating core */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 transition-all duration-700 ${
            isListening ? "animate-pulse" : ""
          }`} />

          {/* Solid sleek center plate */}
          <div className="relative w-36 h-36 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-inner border border-white/10 z-10">
            <svg 
              className={`w-12 h-12 transition-all duration-500 ${isListening ? "text-fuchsia-400 scale-110" : "text-slate-400 group-hover:text-white"}`}
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