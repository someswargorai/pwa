"use client";

import { Type, AudioLines, Image as ImageIcon, BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";

const actions = [
  {
    label: "Text",
    desc: "Write your thoughts",
    icon: Type,
    route: "/save-text",
    bg: "bg-white",
    iconBg: "bg-gray-50",
    iconColor: "text-gray-700",
    border: "border border-gray-100",
    shadow: "shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    titleColor: "text-gray-900",
    descColor: "text-gray-400",
    rotate: "",
  },
  {
    label: "Voice",
    desc: "Record your voice",
    icon: AudioLines,
    route: "/save-voice",
    bg: "bg-gradient-to-br from-[#4d94ff] to-[#3b82f6]",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    border: "",
    shadow: "shadow-[0_8px_24px_rgba(77,148,255,0.3)] hover:shadow-[0_12px_30px_rgba(77,148,255,0.4)]",
    titleColor: "text-white",
    descColor: "text-blue-100",
    rotate: "rotate-2 hover:rotate-0",
  },
  {
    label: "Image",
    desc: "Capture from image",
    icon: ImageIcon,
    route: "/save-image",
    bg: "bg-white",
    iconBg: "bg-gray-50",
    iconColor: "text-gray-700",
    border: "border border-gray-100",
    shadow: "shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    titleColor: "text-gray-900",
    descColor: "text-gray-400",
    rotate: "",
  },
  {
    label: "AI",
    desc: "Generate with AI",
    icon: BookOpenText,
    route: "/save-ai",
    bg: "bg-white",
    iconBg: "bg-gray-50",
    iconColor: "text-gray-700",
    border: "border border-gray-100",
    shadow: "shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    titleColor: "text-gray-900",
    descColor: "text-gray-400",
    rotate: "",
  },
];

export default function QuickActionsGrid() {
  const router = useRouter();

  return (
    <div className="mb-8">
      <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-0.5">Quick Capture</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => router.push(action.route)}
              className={`flex flex-col items-start ${action.bg} rounded-3xl p-4 transition-all duration-200 active:scale-95 text-left ${action.border} ${action.shadow} ${action.rotate}`}
            >
              <div className={`w-10 h-10 rounded-2xl ${action.iconBg} flex items-center justify-center ${action.iconColor} mb-5`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <h3 className={`font-bold text-[15px] ${action.titleColor} mb-0.5`}>{action.label} Note</h3>
              <p className={`text-[12px] ${action.descColor} font-medium leading-snug`}>{action.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
