"use client";

import { CheckCircle2, Circle, Clock, MoreHorizontal, Pin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface Note {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  tasks?: { id: string, text: string, completed: boolean }[];
  tags: string[];
  createdAt: number;
  color: string;
  isPinned?: boolean;
}

export default function RecentNotes({ notes, onPin, onDelete }: { notes: Note[], onPin?: (id: string) => void, onDelete?: (id: string) => void }) {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleAction = (e: React.MouseEvent, action: 'pin' | 'delete', id: string) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (action === 'pin' && onPin) onPin(id);
    if (action === 'delete' && onDelete) onDelete(id);
  };

  const getTimeAgo = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-full pb-20">
      <h2 className="text-[17px] font-semibold text-gray-900 mb-4 px-1">Recent Notes</h2>
      
      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <div 
            key={note.id} 
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) return;
              router.push(`/note/${note.id}`);
            }}
            className="w-full rounded-[32px] p-5 mb-4 shadow-[0_2px_20px_rgba(0,0,0,0.03)] cursor-pointer hover:scale-[1.01] transition-transform relative" 
            style={{ backgroundColor: note.color }}
          >
            {note.isPinned && (
              <div className="absolute top-4 left-4 text-brand-blue">
                <Pin size={16} fill="currentColor" className="rotate-45" />
              </div>
            )}
            
            <div className="flex items-start justify-between mb-3 relative">
              <h3 className={`font-bold text-[18px] text-gray-900 leading-tight w-[80%] ${note.isPinned ? 'pl-6' : ''}`}>
                {note.title}
              </h3>
              
              <div className="relative">
                <button 
                  onClick={(e) => toggleDropdown(e, note.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/50 text-gray-600 hover:bg-white transition-colors"
                >
                  <MoreHorizontal size={20} />
                </button>
                
                {openDropdownId === note.id && (
                  <div className="absolute right-0 top-10 w-36 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20 py-1">
                    <button onClick={(e) => handleAction(e, 'pin', note.id)} className="w-full px-4 py-2.5 text-left text-[14px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Pin size={14} /> {note.isPinned ? 'Unpin' : 'Pin Note'}
                    </button>
                    <button onClick={(e) => handleAction(e, 'delete', note.id)} className="w-full px-4 py-2.5 text-left text-[14px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 mb-5">
              {note.imageUrl ? (
                <div className="relative w-full rounded-2xl mt-2 mb-1 flex items-center justify-center group overflow-hidden bg-[#f8f9fc]/50 border border-black/[0.04]" style={{ minHeight: '160px' }}>
                  {/* Premium dotted grid background for transparency support */}
                  <div className="absolute inset-0 opacity-[0.3] dark:opacity-10 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  
                  {/* Image itself */}
                  <img src={note.imageUrl} alt="preview" className="relative z-10 w-full h-auto max-h-[280px] object-contain group-hover:scale-[1.02] transition-transform duration-500 ease-out p-1 drop-shadow-sm" />
                  
                  {/* Premium glossy overlay / inner shadow */}
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-2xl z-20"></div>
                </div>
              ) : note.content && (
                <div className="flex flex-col gap-1 w-full relative">
                  <p 
                    className={`text-[14px] text-gray-700 font-medium leading-relaxed overflow-hidden text-ellipsis w-[95%] opacity-90 prose prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:text-[13px] prose-code:font-mono ${!expandedNotes.includes(note.id) && note.content.length > 1200 ? 'line-clamp-[12]' : ''}`} 
                    dangerouslySetInnerHTML={{ 
                      __html: note.content
                        .replace(/```([\s\S]*?)```/g, (match, p1) => {
                          const cleanCode = p1.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, '');
                          return `<pre><code>${cleanCode}</code></pre>`;
                        })
                        .replace(/(?<!["'=])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-brand-blue hover:underline font-semibold">$1</a>')
                    }}
                  ></p>
                  {note.content.length > 1200 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedNotes(prev => 
                          prev.includes(note.id) ? prev.filter(id => id !== note.id) : [...prev, note.id]
                        );
                      }}
                      className="text-[13px] font-bold text-brand-blue hover:underline text-left mt-2 w-max"
                    >
                      {expandedNotes.includes(note.id) ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}
              {note.tasks && note.tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2.5">
                  {task.completed ? (
                    <CheckCircle2 size={18} className="text-gray-500 shrink-0 mt-0.5" strokeWidth={2} />
                  ) : (
                    <Circle size={18} className="text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
                  )}
                  <span className={`text-[14px] ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                {note.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white/60 rounded-full text-[11px] font-semibold text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[12px] text-gray-400 font-medium flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white/60 flex items-center justify-center border border-gray-100">
                  <span className="w-1.5 h-1.5 rounded-sm bg-gray-300"></span>
                </span>
                {getTimeAgo(note.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
