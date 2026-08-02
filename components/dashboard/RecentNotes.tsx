"use client";

import { CheckCircle2, Circle, Clock, MoreHorizontal, Pin, Trash2, Bell, Search } from "lucide-react";
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
  isLocked?: boolean;
}

export default function RecentNotes({ 
  notes, 
  onPin, 
  onDelete, 
  onNotify,
  searchQuery
}: { 
  notes: Note[], 
  onPin?: (id: string) => void, 
  onDelete?: (id: string) => void, 
  onNotify?: (note: Note) => void,
  searchQuery?: string
}) {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleAction = (e: React.MouseEvent, action: 'pin' | 'delete' | 'notify', note: Note) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (action === 'pin' && onPin) onPin(note.id);
    if (action === 'delete' && onDelete) onDelete(note.id);
    if (action === 'notify' && onNotify) onNotify(note);
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
      <div className="flex items-center justify-between mb-4 px-0.5">
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
          {searchQuery ? 'Search Results' : 'Recent Notes'}
        </p>
        {!searchQuery && notes.length > 0 && (
          <span className="text-[12px] font-bold text-gray-400 tabular-nums">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {notes.length === 0 ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-1">
            {searchQuery ? "No matches found" : "No notes yet"}
          </h3>
          <p className="text-[14px] text-gray-500 max-w-[200px] leading-relaxed">
            {searchQuery 
              ? `We couldn't find any notes matching "${searchQuery}"`
              : "Create your first note by tapping a quick action above!"
            }
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) return;
                router.push(`/note/${note.id}`);
              }}
              className="w-full rounded-[28px] p-5 cursor-pointer hover:scale-[1.015] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] active:scale-[0.99] transition-all duration-200 relative shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              style={{ backgroundColor: note.color }}
            >
            {note.isPinned && (
              <div className="absolute top-4 left-4 text-brand-blue">
                <Pin size={16} fill="currentColor" className="rotate-45" />
              </div>
            )}
            
            <div className="flex items-start justify-between mb-2.5 relative">
              <div className={`flex-1 min-w-0 ${note.isPinned ? 'pl-6' : ''}`}>
                <h3 className="font-bold text-[17px] text-gray-900 leading-snug truncate">
                  {note.isLocked && <span className="mr-1">🔒</span>}{note.title}
                </h3>
              </div>

              <div className="relative ml-2 shrink-0">
                <button
                  onClick={(e) => toggleDropdown(e, note.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-gray-500 hover:bg-black/10 transition-colors active:scale-90"
                >
                  <MoreHorizontal size={18} />
                </button>

                {openDropdownId === note.id && (
                  <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-gray-100/80 overflow-hidden z-20 py-1.5">
                    <button onClick={(e) => handleAction(e, 'notify', note)} className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                      <Bell size={13} className="text-gray-500" /> Set Reminder
                    </button>
                    <button onClick={(e) => handleAction(e, 'pin', note)} className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                      <Pin size={13} className="text-gray-500" /> {note.isPinned ? 'Unpin Note' : 'Pin Note'}
                    </button>
                    <div className="my-1 h-px bg-gray-100 mx-3" />
                    <button onClick={(e) => handleAction(e, 'delete', note)} className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-red-500 hover:bg-red-50/70 flex items-center gap-2.5">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 mb-5 relative">
              {note.isLocked ? (
                <div className="relative w-full rounded-2xl mt-2 mb-1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-white/10 shadow-xl" style={{ minHeight: '160px' }}>
                  {/* Premium abstract background effects */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.4),transparent_70%)]"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                  
                  {/* Glowing Lock Icon */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-brand-blue"></div>
                      <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🔒</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-[15px] font-bold text-white tracking-wide drop-shadow-md">Secured Note</span>
                      <span className="text-[11px] font-medium text-blue-200/70 uppercase tracking-widest mt-1">FaceID Protected</span>
                    </div>
                  </div>
                  
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                </div>
              ) : (
                <>
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
                    <div key={task.id} className="flex items-center gap-2.5">
                      {task.completed ? (
                        <CheckCircle2 size={16} className="text-gray-400 shrink-0" strokeWidth={2} />
                      ) : (
                        <Circle size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
                      )}
                      <span className={`text-[13px] font-medium leading-tight ${task.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </>
              )}
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
      )}
    </div>
  );
}
