"use client";

import { useState, useEffect } from "react";
import { clear, get } from "idb-keyval";
import { toast } from "sonner";
import { Moon, Sun, Download, Trash2, Bell, ChevronLeft, Shield, Database, Mail, UserRound, Briefcase, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import InstallPWA from "@/app/InstallPWA";

export default function SettingsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "Jhon Dong",
    designation: "Graphics Designer",
    avatarSeed: "Jhon"
  });

  useEffect(() => {
    if (document.documentElement.classList.contains('dark-theme')) {
      setIsDark(true);
    }
    
    setNotifications(localStorage.getItem('nexus_notifications') === 'true');
    setEmailNotifications(localStorage.getItem('nexus_email_notifications') === 'true');
    
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
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#070603');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8f9fc');
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const toggleNotifications = async () => {
    const isNowEnabled = !notifications;
    
    if (isNowEnabled) {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error("Push notifications are not supported by your browser");
        return;
      }
      setIsSubscribing(true);
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey!);
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
          localStorage.setItem('nexus_push_subscription', JSON.stringify(subscription));
          localStorage.setItem('nexus_notifications', 'true');
          setNotifications(true);
          toast.success("Push notifications enabled!");
        } else {
          toast.error("Notification permission denied");
        }
      } catch (err: any) {
        toast.error("Failed to enable push notifications");
      } finally {
        setIsSubscribing(false);
      }
    } else {
      localStorage.setItem('nexus_notifications', 'false');
      setNotifications(false);
      toast.success("Push notifications disabled");
    }
  };

  const toggleEmailNotifications = () => {
    const isNowEnabled = !emailNotifications;
    setEmailNotifications(isNowEnabled);
    localStorage.setItem('nexus_email_notifications', isNowEnabled.toString());
    if (isNowEnabled) {
      toast.success("Email notifications enabled!");
    } else {
      toast.success("Email notifications disabled");
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
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast.error("Failed to clear data");
    }
  };

  // Modern Toggle Component
  const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-[46px] h-[26px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
        checked ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} shadow-inner`}
    >
      <div 
        className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="flex-1 w-full text-gray-900 bg-[#f8f9fc] relative selection:bg-violet-500/20">
      
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[50%] bg-violet-200/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[55%] h-[40%] bg-fuchsia-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-6 pb-32">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 text-gray-600 hover:text-gray-900 active:scale-90 transition-all">
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">Settings</h1>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[12px] font-bold text-gray-700">Pro</span>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          
          {/* Profile Section */}
          <section>
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Profile</h2>
            <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/60">
              
              <div className="flex items-center gap-5 mb-6">
                <div className="relative w-20 h-20 rounded-[24px] overflow-hidden bg-gradient-to-br from-violet-100 to-fuchsia-100 shadow-inner flex-shrink-0">
                  <img 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.avatarSeed || 'Default'}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-black/5 pointer-events-none" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{profile.name || 'Your Name'}</h3>
                  <p className="text-[14px] text-gray-500 font-medium mt-0.5">{profile.designation || 'Your Role'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <UserRound size={16} strokeWidth={2.5} />
                  </div>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    placeholder="Display Name"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] font-medium text-gray-900 outline-none focus:bg-white focus:border-violet-200 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-gray-400"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Briefcase size={16} strokeWidth={2.5} />
                  </div>
                  <input 
                    type="text" 
                    value={profile.designation}
                    onChange={(e) => updateProfile('designation', e.target.value)}
                    placeholder="Designation"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] font-medium text-gray-900 outline-none focus:bg-white focus:border-violet-200 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Zap size={16} strokeWidth={2.5} />
                  </div>
                  <input 
                    type="text" 
                    value={profile.avatarSeed}
                    onChange={(e) => updateProfile('avatarSeed', e.target.value)}
                    placeholder="Avatar Seed (Type anything!)"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] font-medium text-gray-900 outline-none focus:bg-white focus:border-violet-200 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Preferences</h2>
            <div className="bg-white rounded-[28px] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/60 flex flex-col">
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center shadow-sm ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' : 'bg-gradient-to-br from-orange-400 to-amber-400 text-white'}`}>
                    {isDark ? <Moon size={20} strokeWidth={2} /> : <Sun size={20} strokeWidth={2} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900">Dark Mode</span>
                    <span className="text-[12px] text-gray-500 font-medium leading-snug">Toggle app appearance</span>
                  </div>
                </div>
                <Toggle checked={isDark} onChange={toggleTheme} />
              </div>

              <div className="w-[calc(100%-3rem)] h-[1px] bg-gray-100 mx-auto" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm">
                    <Bell size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900">Push Notifications</span>
                    <span className="text-[12px] text-gray-500 font-medium leading-snug">Reminders & Alerts</span>
                  </div>
                </div>
                <Toggle checked={notifications} onChange={toggleNotifications} disabled={isSubscribing} />
              </div>

              <div className="w-[calc(100%-3rem)] h-[1px] bg-gray-100 mx-auto" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                    <Mail size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900">Email Notifications</span>
                    <span className="text-[12px] text-gray-500 font-medium leading-snug">Updates via email</span>
                  </div>
                </div>
                <Toggle checked={emailNotifications} onChange={toggleEmailNotifications} />
              </div>

              <div className="w-[calc(100%-3rem)] h-[1px] bg-gray-100 mx-auto" />
              <div className="p-2">
                <InstallPWA variant="settings" />
              </div>

            </div>
          </section>

          {/* Data & Storage */}
          <section>
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Data & Storage</h2>
            <div className="bg-white rounded-[28px] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/60 flex flex-col">
              
              <div onClick={handleExportData} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-[20px] transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[16px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Download size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900">Export Notes</span>
                    <span className="text-[12px] text-gray-500 font-medium leading-snug">Download backup (JSON)</span>
                  </div>
                </div>
              </div>

              <div className="w-[calc(100%-3rem)] h-[1px] bg-gray-100 mx-auto" />

              <div onClick={handleClearData} className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 rounded-[20px] transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[16px] bg-red-50 text-red-500 flex items-center justify-center">
                    <Trash2 size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-red-600">Clear All Data</span>
                    <span className="text-[12px] text-red-400 font-medium leading-snug">Delete everything from device</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">About</h2>
            <div className="bg-white rounded-[28px] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/60 flex flex-col">
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[16px] bg-gray-50 text-gray-500 flex items-center justify-center">
                    <Shield size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900">Privacy First</span>
                    <span className="text-[12px] text-gray-500 font-medium leading-snug">All data stays on this device</span>
                  </div>
                </div>
              </div>

              <div className="w-[calc(100%-3rem)] h-[1px] bg-gray-100 mx-auto" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[16px] bg-gray-50 text-gray-500 flex items-center justify-center">
                    <Database size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-gray-900">IndexedDB Storage</span>
                    <span className="text-[12px] text-gray-500 font-medium leading-snug">Zero backend database used</span>
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
