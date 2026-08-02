"use client";

import { Trash2, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel"
}: ConfirmModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Icon + header */}
        <div className="px-6 pt-4 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={20} className="text-red-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">{title}</h2>
              <p className="text-[14px] text-gray-400 font-medium mt-1.5 leading-relaxed">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* Actions */}
        <div className="px-5 pt-4 pb-[100px] flex flex-col gap-2.5">
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-[15px] shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 text-gray-400 font-semibold text-[14px] hover:text-gray-700 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
