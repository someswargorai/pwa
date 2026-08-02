"use client";

import { useState, useEffect } from "react";
import { get, set } from "idb-keyval";
import {
  CheckCircle2, Circle, Plus, Trash2, MoreHorizontal,
  Target, Zap, Trophy, X, Layers
} from "lucide-react";
import { Note } from "@/components/dashboard/RecentNotes";

const PALETTE = [
  { bar: "bg-[#4F7CFF]", from: "from-[#4F7CFF]", to: "to-[#7C5CFC]", chip: "bg-[#EEF2FF] text-[#4F7CFF]", ring: "ring-[#4F7CFF]/20" },
  { bar: "bg-[#0EA5E9]", from: "from-[#0EA5E9]", to: "to-[#6366F1]", chip: "bg-[#E0F7FF] text-[#0EA5E9]", ring: "ring-[#0EA5E9]/20" },
  { bar: "bg-[#10B981]", from: "from-[#10B981]", to: "to-[#059669]", chip: "bg-[#D1FAE5] text-[#059669]", ring: "ring-[#10B981]/20" },
  { bar: "bg-[#F59E0B]", from: "from-[#F59E0B]", to: "to-[#EF4444]", chip: "bg-[#FEF3C7] text-[#D97706]", ring: "ring-[#F59E0B]/20" },
  { bar: "bg-[#EC4899]", from: "from-[#EC4899]", to: "to-[#8B5CF6]", chip: "bg-[#FCE7F3] text-[#BE185D]", ring: "ring-[#EC4899]/20" },
];

export default function TasksPage() {
  const [projects, setProjects] = useState<Note[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const all: Note[] = (await get("nexus_dashboard_notes")) || [];
    setProjects(all.filter(n => (n.tasks && n.tasks.length > 0) || n.tags?.includes("ProgressTask")));
  };

  const save = async (updatedAll: Note[]) => {
    await set("nexus_dashboard_notes", updatedAll);
    setProjects(updatedAll.filter(n => (n.tasks && n.tasks.length > 0) || n.tags?.includes("ProgressTask")));
  };

  const createProject = async () => {
    if (!newTitle.trim()) return;
    const all: Note[] = (await get("nexus_dashboard_notes")) || [];
    await save([{ id: Date.now().toString(), title: newTitle.trim(), content: "", tags: ["ProgressTask"], tasks: [], createdAt: Date.now(), color: "#f8f9fc" }, ...all]);
    setNewTitle(""); setShowCreate(false);
  };

  const toggleTask = async (noteId: string, taskId: string) => {
    const all: Note[] = (await get("nexus_dashboard_notes")) || [];
    await save(all.map(n => n.id !== noteId ? n : { ...n, tasks: n.tasks!.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }));
  };

  const addTask = async (noteId: string) => {
    const text = taskInputs[noteId]?.trim();
    if (!text) return;
    const all: Note[] = (await get("nexus_dashboard_notes")) || [];
    await save(all.map(n => n.id !== noteId ? n : { ...n, tasks: [...(n.tasks || []), { id: Date.now().toString(), text, completed: false }] }));
    setTaskInputs(p => ({ ...p, [noteId]: "" }));
  };

  const deleteTask = async (noteId: string, taskId: string) => {
    const all: Note[] = (await get("nexus_dashboard_notes")) || [];
    await save(all.map(n => n.id !== noteId ? n : { ...n, tasks: n.tasks!.filter(t => t.id !== taskId) }));
  };

  const deleteProject = async () => {
    if (!deleteId) return;
    const all: Note[] = (await get("nexus_dashboard_notes")) || [];
    await save(all.filter(n => n.id !== deleteId));
    setDeleteId(null);
  };

  const totalTasks = projects.reduce((a, n) => a + (n.tasks?.length || 0), 0);
  const doneTasks = projects.reduce((a, n) => a + (n.tasks?.filter(t => t.completed).length || 0), 0);
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="flex-1 w-full bg-[#f8f9fc] min-h-[100dvh] pb-40 relative selection:bg-blue-100">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] right-[-8%] w-[55%] h-[45%] bg-blue-100/30 rounded-full blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-8%] w-[50%] h-[40%] bg-violet-100/20 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5">

        {/* ── HEADER ── */}
        <div className="pt-10 pb-7 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Workspace</p>
            <h1 className="text-[30px] font-bold text-gray-900 tracking-tight leading-none">Tasks</h1>
          </div>
          {/* Single FAB - only one */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-2xl bg-gray-900 text-white text-[13px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:bg-gray-800 active:scale-95 transition-all"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Project
          </button>
        </div>

        {/* ── GLOBAL STATS CARD ── */}
        {projects.length > 0 && (
          <div className="mb-5 rounded-[28px] bg-gray-900 p-6 overflow-hidden relative shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/[0.04]" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/[0.04]" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                  <Target size={13} className="text-white/60" />
                </div>
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Overall Progress</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[56px] font-black text-white leading-none tracking-tighter">{progress}</span>
                  <span className="text-[20px] font-bold text-white/30 mb-1">%</span>
                </div>
                {progress === 100 ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-400/15">
                    <Trophy size={14} className="text-emerald-400" strokeWidth={2} />
                    <span className="text-[13px] font-bold text-emerald-400">All done!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/8 border border-white/10">
                    <Zap size={12} className="text-white/50" />
                    <span className="text-[12px] font-bold text-white/50">{doneTasks}/{totalTasks} done</span>
                  </div>
                )}
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 rounded-full bg-white/10 mb-5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 3 stats */}
              <div className="grid grid-cols-3 divide-x divide-white/10">
                {[
                  { label: "Projects", val: projects.length },
                  { label: "Remaining", val: totalTasks - doneTasks },
                  { label: "Completed", val: doneTasks },
                ].map(({ label, val }) => (
                  <div key={label} className="flex flex-col items-center px-2">
                    <span className="text-[22px] font-black text-white">{val}</span>
                    <span className="text-[10px] font-bold text-white/35 uppercase tracking-wide mt-0.5">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="w-20 h-20 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center mb-5">
              <Layers size={28} className="text-gray-200" strokeWidth={1.5} />
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2">No projects yet</h3>
            <p className="text-[13px] text-gray-400 font-medium max-w-[200px] leading-relaxed">
              Tap "New Project" above to start organising your tasks.
            </p>
          </div>
        )}

        {/* ── PROJECT CARDS ── */}
        {projects.length > 0 && (
          <div className="flex flex-col gap-3">
            {projects.map((note, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              const total = note.tasks?.length || 0;
              const done = note.tasks?.filter(t => t.completed).length || 0;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              const allDone = total > 0 && done === total;

              return (
                <div key={note.id} className="bg-white rounded-[24px] border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">

                  {/* Color accent strip */}
                  <div className={`h-[3px] w-full bg-gradient-to-r ${pal.from} ${pal.to}`} />

                  <div className="p-5">
                    {/* Project header row */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Color dot */}
                      <div className={`w-2 h-2 rounded-full ${pal.bar} mt-[7px] shrink-0`} />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-gray-900 leading-snug truncate">{note.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${pal.chip}`}>{done}/{total} tasks</span>
                          {allDone && total > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                              <Trophy size={9} strokeWidth={2} /> Complete
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setMenuId(menuId === note.id ? null : note.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 transition-colors active:scale-90"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuId === note.id && (
                          <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-gray-100 py-1.5">
                            <button
                              onClick={() => { setDeleteId(note.id); setMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-red-500 hover:bg-red-50/70 flex items-center gap-2.5"
                            >
                              <Trash2 size={13} /> Delete Project
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="w-full h-1 rounded-full bg-gray-100 mb-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${pal.from} ${pal.to}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}

                    {/* Tasks */}
                    <div className="flex flex-col">
                      {note.tasks?.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-gray-50/80 group transition-colors -mx-2"
                        >
                          <button onClick={() => toggleTask(note.id, task.id)} className="shrink-0 active:scale-90 transition-transform">
                            {task.completed
                              ? <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />
                              : <Circle size={18} className={`text-gray-200 group-hover:text-gray-300 transition-colors`} strokeWidth={2} />
                            }
                          </button>
                          <span
                            onClick={() => toggleTask(note.id, task.id)}
                            className={`flex-1 text-[14px] leading-tight transition-all cursor-pointer select-none ${
                              task.completed ? "text-gray-300 line-through font-normal" : "text-gray-700 font-medium"
                            }`}
                          >
                            {task.text}
                          </span>
                          <button
                            onClick={() => deleteTask(note.id, task.id)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}

                      {/* Add task row */}
                      <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-gray-50 -mx-2 px-2">
                        <input
                          type="text"
                          placeholder="Add a task..."
                          value={taskInputs[note.id] || ""}
                          onChange={e => setTaskInputs(p => ({ ...p, [note.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') addTask(note.id); }}
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-700 placeholder:text-gray-300 outline-none focus:border-gray-200 transition-all"
                        />
                        <button
                          onClick={() => addTask(note.id)}
                          disabled={!taskInputs[note.id]?.trim()}
                          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
                            taskInputs[note.id]?.trim()
                              ? `bg-gradient-to-br ${pal.from} ${pal.to} shadow-md text-white`
                              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE PROJECT BOTTOM SHEET ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Gradient header */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 pt-5 pb-5 relative">
              <button
                onClick={() => setShowCreate(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                <Layers size={18} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-[18px] font-bold text-white">New Project</h3>
              <p className="text-[12px] text-white/50 font-medium mt-0.5">Group related tasks under a project.</p>
            </div>

            {/* Body */}
            <div className="px-5 pt-5 pb-[100px]">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Project Name</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Website Launch, Q4 Goals..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createProject(); if (e.key === 'Escape') setShowCreate(false); }}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-gray-200 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] transition-all placeholder:text-gray-300 mb-4"
              />
              <button
                onClick={createProject}
                disabled={!newTitle.trim()}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-all shadow-lg disabled:opacity-40 mb-2"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="w-full py-3 text-gray-400 font-semibold text-[14px] hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
            <div className="px-6 pt-4 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 size={20} className="text-red-500" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900">Delete Project</h2>
                  <p className="text-[14px] text-gray-400 font-medium mt-1 leading-relaxed">This project and all its tasks will be permanently removed.</p>
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-100 mx-6" />
            <div className="px-5 pt-4 pb-[100px] flex flex-col gap-2">
              <button onClick={deleteProject} className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-[15px] shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all">Delete Project</button>
              <button onClick={() => setDeleteId(null)} className="w-full py-3 text-gray-400 font-semibold text-[14px] hover:text-gray-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
