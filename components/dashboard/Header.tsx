"use client";

import { Settings, Bell, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [profile, setProfile] = useState({
    name: "Jhon Dong",
    designation: "Graphics Designer",
    avatarSeed: "Jhon"
  });

  useEffect(() => {
    // The class is set initially by the script in layout.tsx to prevent flash.
    // We just need to sync our React state with the current DOM state.
    if (document.documentElement.classList.contains('dark-theme')) {
      setIsDark(true);
    }
    
    // Load profile from localStorage
    const loadProfile = () => {
      const savedName = localStorage.getItem('nexus_profile_name');
      const savedDesignation = localStorage.getItem('nexus_profile_designation');
      const savedAvatar = localStorage.getItem('nexus_profile_avatar');
      
      if (savedName || savedDesignation || savedAvatar) {
        setProfile(prev => ({
          name: savedName || prev.name,
          designation: savedDesignation || prev.designation,
          avatarSeed: savedAvatar || prev.avatarSeed
        }));
      }
    };
    
    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);
    
    return () => {
      window.removeEventListener('profileUpdated', loadProfile);
    };
  }, []);

  const toggleTheme = () => {
    const isNowDark = !isDark;
    setIsDark(isNowDark);
    if (isDark) {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8f9fc');
    } else {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#111827');
    }
  };

  return (
    <div className="flex items-center justify-between w-full py-2">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {/* User Profile Picture */}
          <img 
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${profile.avatarSeed}`} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[17px] font-semibold text-gray-900 leading-tight">{profile.name}</h2>
          <p className="text-[13px] text-gray-500 font-medium">{profile.designation}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
          {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
        </button>
        <button onClick={() => router.push("/settings")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
          <Settings size={20} strokeWidth={2} />
        </button>
        <button onClick={() => router.push("/settings")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
          <Bell size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
