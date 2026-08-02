"use client";

import { Home, FileText, PenLine, CheckCircle, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const tabs = [
  { id: "home",     icon: Home,        label: "Home",   path: "/" },
  { id: "notes",    icon: FileText,    label: "Notes",  path: "/notes" },
  { id: "add",      icon: PenLine,     label: "Write",  path: "/save-text" },
  { id: "tasks",    icon: CheckCircle, label: "Tasks",  path: "/tasks" },
  { id: "settings", icon: Settings,    label: "More",   path: "/settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const activeTab =
    pathname === "/save-text" ? "add" :
    pathname === "/notes"     ? "notes" :
    pathname === "/tasks"     ? "tasks" :
    pathname === "/settings"  ? "settings" : "home";

  if (pathname === "/save-ai") return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="flex items-center gap-0.5 bg-white/75 backdrop-blur-2xl border border-gray-100/70 shadow-[0_8px_40px_rgba(0,0,0,0.10)] rounded-[28px] px-3 py-2.5">
        {tabs.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeTab === id;
          return (
            <Link
              key={id}
              href={path}
              prefetch={true}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.85] ${
                isActive ? "w-[72px]" : "w-[52px]"
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active pill fluid animation */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gray-900 rounded-[18px] shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5 py-1.5 px-1">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                <span className={`text-[10px] font-bold tracking-wide transition-all duration-200 ${
                  isActive ? "text-white/80 scale-100 opacity-100" : "text-gray-400 scale-95 opacity-0 w-0 h-0 overflow-hidden"
                }`}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
