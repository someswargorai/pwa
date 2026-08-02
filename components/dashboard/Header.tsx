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
    if (document.documentElement.classList.contains('dark-theme')) {
      setIsDark(true);
    }

    const loadProfile = () => {
      const savedName = localStorage.getItem('nexus_profile_name');
      const savedDesignation = localStorage.getItem('nexus_profile_designation');
      const savedAvatar = localStorage.getItem('nexus_profile_avatarSeed');
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
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#070603');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8f9fc');
    }
  };

  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between w-full py-3">
      {/* Avatar + name */}
      <button onClick={() => router.push("/settings")} className="flex items-center gap-3 active:scale-95 transition-transform">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-white shadow-md flex items-center justify-center">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.avatarSeed}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[15px] font-bold text-gray-900 leading-tight">{profile.name}</span>
          <span className="text-[12px] text-gray-400 font-medium">{profile.designation}</span>
        </div>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-500 border border-gray-100 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          {isDark ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm text-gray-500 hover:shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Bell size={16} strokeWidth={2} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full ring-1 ring-white" />
        </button>
      </div>
    </div>
  );
}
