"use client";

import { useState, useEffect } from "react";
import { clear, get } from "idb-keyval";
import { toast } from "sonner";
import { Moon, Sun, Download, Trash2, Bell, ChevronLeft, Shield, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "Jhon Dong",
    designation: "Graphics Designer",
    avatarSeed: "Jhon"
  });

  useEffect(() => {
    if (document.documentElement.classList.contains('dark-theme')) {
      setIsDark(true);
    }
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
    
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
  }, []);

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    localStorage.setItem(`nexus_profile_${field}`, value);
    window.dispatchEvent(new Event('profileUpdated'));
  };

  const toggleTheme = () => {
    const isNowDark = !isDark;
    setIsDark(isNowDark);
    if (isNowDark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      toast.success("Notifications enabled!");
    } else {
      setNotificationsEnabled(false);
      toast.error("Notification permission denied.");
    }
  };

  const handleExportData = async () => {
    try {
      const savedNotes = (await get("nexus_dashboard_notes")) || [];
      if (savedNotes.length === 0) {
        toast.info("No data to export");
        return;
      }
      
      const blob = new Blob([JSON.stringify(savedNotes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (e) {
      toast.error("Failed to export data");
    }
  };

  const handleClearData = async () => {
    const confirm = window.confirm("Are you absolutely sure you want to delete all notes? This cannot be undone.");
    if (!confirm) return;
    try {
      await clear();
      toast.success("All data cleared successfully");
    } catch (e) {
      toast.error("Failed to clear data");
    }
  };

  return (
    <div className="flex-1 w-full pb-32">
      <div className="w-full max-w-2xl mx-auto px-5 pt-4">
        
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Settings</h1>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Profile */}
          <section>
            <h2 className="text-[14px] font-bold text-brand-blue uppercase tracking-wider mb-3 ml-1">Profile</h2>
            <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-brand-blue focus:ring-0 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">Designation</label>
                <input 
                  type="text" 
                  value={profile.designation}
                  onChange={(e) => updateProfile('designation', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-brand-blue focus:ring-0 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 mb-1">
                <label className="text-[13px] font-bold text-gray-700 ml-1">Avatar Seed (Text)</label>
                <input 
                  type="text" 
                  value={profile.avatarSeed}
                  onChange={(e) => updateProfile('avatarSeed', e.target.value)}
                  placeholder="Type anything to generate a new avatar"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-brand-blue focus:ring-0 transition-colors"
                />
              </div>

            </div>
          </section>

          {/* Preferences */}
          <section>
            <h2 className="text-[14px] font-bold text-brand-blue uppercase tracking-wider mb-3 ml-1">Preferences</h2>
            <div className="bg-white rounded-3xl p-2 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col">
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                    {isDark ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-gray-900">Dark Mode</span>
                    <span className="text-[13px] text-gray-500 font-medium">Toggle app appearance</span>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isDark ? 'bg-brand-blue' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="w-[calc(100%-2rem)] h-[1px] bg-gray-50 mx-auto"></div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                    <Bell size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-gray-900">Push Notifications</span>
                    <span className="text-[13px] text-gray-500 font-medium">Reminders & Alerts</span>
                  </div>
                </div>
                <button 
                  onClick={requestNotifications}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-brand-blue' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

            </div>
          </section>

          {/* Data Management */}
          <section>
            <h2 className="text-[14px] font-bold text-brand-blue uppercase tracking-wider mb-3 ml-1">Data & Storage</h2>
            <div className="bg-white rounded-3xl p-2 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col">
              
              <div onClick={handleExportData} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Download size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-gray-900">Export Notes</span>
                    <span className="text-[13px] text-gray-500 font-medium">Download backup (JSON)</span>
                  </div>
                </div>
              </div>

              <div className="w-[calc(100%-2rem)] h-[1px] bg-gray-50 mx-auto"></div>

              <div onClick={handleClearData} className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 rounded-2xl transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                    <Trash2 size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-red-600">Clear All Data</span>
                    <span className="text-[13px] text-red-400 font-medium">Delete everything from device</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Security & Info */}
          <section>
            <h2 className="text-[14px] font-bold text-brand-blue uppercase tracking-wider mb-3 ml-1">About</h2>
            <div className="bg-white rounded-3xl p-2 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white flex flex-col">
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                    <Shield size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-gray-900">Privacy First</span>
                    <span className="text-[13px] text-gray-500 font-medium">All data stays on this device</span>
                  </div>
                </div>
              </div>

              <div className="w-[calc(100%-2rem)] h-[1px] bg-gray-50 mx-auto"></div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                    <Database size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-gray-900">Local Storage (IndexedDB)</span>
                    <span className="text-[13px] text-gray-500 font-medium">No backend database used</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
