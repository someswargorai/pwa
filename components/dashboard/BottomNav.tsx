"use client";

import { Home, FileText, PenLine, CheckCircle, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { id: "home",     icon: Home,        label: "Home",   path: "/" },
  { id: "notes",    icon: FileText,    label: "Notes",  path: "/notes" },
  { id: "add",      icon: PenLine,     label: "Write",  path: "/save-text" },
  { id: "tasks",    icon: CheckCircle, label: "Tasks",  path: "/tasks" },
  { id: "settings", icon: Settings,    label: "More",   path: "/settings" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    pathname === "/save-text" ? "add" :
    pathname === "/notes"     ? "notes" :
    pathname === "/tasks"     ? "tasks" :
    pathname === "/settings"  ? "settings" : "home";

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="flex items-center gap-0.5 bg-white/75 backdrop-blur-2xl border border-gray-100/70 shadow-[0_8px_40px_rgba(0,0,0,0.10)] rounded-[28px] px-3 py-2.5">
        {tabs.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => router.push(path)}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                isActive ? "w-[72px]" : "w-[52px]"
              }`}
            >
              {/* Active pill */}
              {isActive && (
                <div className="absolute inset-0 bg-gray-900 rounded-[18px] shadow-[0_4px_14px_rgba(0,0,0,0.2)]" />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5 py-1.5 px-1">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                <span className={`text-[10px] font-bold tracking-wide transition-all ${
                  isActive ? "text-white/80" : "text-gray-400"
                }`}>
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
