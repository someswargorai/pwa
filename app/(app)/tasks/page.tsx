"use client";

import { useState, useEffect } from "react";
import { get, set } from "idb-keyval";
import { CheckCircle2, Circle, ChevronLeft, Plus, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Note } from "@/components/dashboard/RecentNotes";

export default function TasksPage() {
  const router = useRouter();
  const [notesWithTasks, setNotesWithTasks] = useState<Note[]>([]);
  
  // Creation States
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  
  // Input states for adding new bullets to existing projects
  // Maps noteId -> string
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadTasks() {
      const savedNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
      const filtered = savedNotes.filter(note => note.tasks && note.tasks.length > 0);
      setNotesWithTasks(filtered);
    }
    loadTasks();
  }, []);

  const toggleTask = async (noteId: string, taskId: string) => {
    const allNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
    
    const updatedNotes = allNotes.map(note => {
      if (note.id === noteId && note.tasks) {
        return {
          ...note,
          tasks: note.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return note;
    });

    await set("nexus_dashboard_notes", updatedNotes);
    
    // Update local state
    setNotesWithTasks(updatedNotes.filter(note => note.tasks && note.tasks.length > 0 || note.tags.includes("ProgressTask")));
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return setIsCreatingProject(false);
    
    const allNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
    
    const newProject: Note = {
      id: Date.now().toString(),
      title: newProjectTitle.trim(),
      content: "",
      tags: ["ProgressTask"],
      tasks: [],
      createdAt: Date.now(),
      color: "#f8f9fc" // default color
    };
    
    const updatedNotes = [newProject, ...allNotes];
    await set("nexus_dashboard_notes", updatedNotes);
    
    setNotesWithTasks(updatedNotes.filter(note => note.tasks && note.tasks.length > 0 || note.tags.includes("ProgressTask")));
    setNewProjectTitle("");
    setIsCreatingProject(false);
  };

  const handleAddBullet = async (noteId: string) => {
    const text = newTaskInputs[noteId]?.trim();
    if (!text) return;
    
    const allNotes: Note[] = (await get("nexus_dashboard_notes")) || [];
    
    const updatedNotes = allNotes.map(note => {
      if (note.id === noteId) {
        const existingTasks = note.tasks || [];
        return {
          ...note,
          tasks: [...existingTasks, { id: Date.now().toString(), text, completed: false }]
        };
      }
      return note;
    });

    await set("nexus_dashboard_notes", updatedNotes);
    setNotesWithTasks(updatedNotes.filter(note => note.tasks && note.tasks.length > 0 || note.tags.includes("ProgressTask")));
    
    // Clear input
    setNewTaskInputs(prev => ({ ...prev, [noteId]: "" }));
  };

  const activeProjects = notesWithTasks.filter(note => note.tasks && note.tasks.length > 0 || note.tags?.includes("ProgressTask"));

  const totalTasks = notesWithTasks.reduce((acc, note) => acc + (note.tasks?.length || 0), 0);
  const completedTasks = notesWithTasks.reduce((acc, note) => 
    acc + (note.tasks?.filter(t => t.completed).length || 0), 0
  );

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex-1 w-full pb-32">
      <div className="w-full max-w-2xl mx-auto px-5 pt-4">
        
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Master Checklist</h1>
        </div>
        
        {/* Create Project Button */}
        <div className="mb-8">
          {!isCreatingProject ? (
            <button 
              onClick={() => setIsCreatingProject(true)}
              className="w-full py-4 rounded-[20px] border-2 border-dashed border-gray-200 text-gray-500 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-brand-blue hover:text-brand-blue transition-all"
            >
              <Plus size={20} strokeWidth={2.5} />
              Create New Project
            </button>
          ) : (
            <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
              <input 
                autoFocus
                type="text"
                placeholder="Project Title (e.g. Website Launch)"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateProject(); }}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-brand-blue focus:ring-0 transition-colors"
              />
              <button 
                onClick={handleCreateProject}
                className="px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-[14px] hover:bg-blue-600 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {activeProjects.length > 0 ? (
          <>
            {/* Simple SaaS Progress Header */}
            <div className="mb-8 p-6 bg-white rounded-[24px] shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-brand-blue" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[14px] font-bold text-gray-500 tracking-wide uppercase">Total Progress</h2>
                </div>
                
                <div className="flex items-end justify-between mb-4 mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter text-gray-900 drop-shadow-sm">{progress}</span>
                    <span className="text-xl font-bold text-gray-400">%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] font-semibold text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full">
                      {completedTasks} / {totalTasks} Tasks
                    </span>
                  </div>
                </div>
                
                {/* Premium Progress Bar Track */}
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative shadow-inner mt-1">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                    }}
                  >
                    {/* Inner highlight for glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {activeProjects.map((note) => (
                <div key={note.id} className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-50">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[17px] font-bold text-gray-900" style={{ color: note.color !== '#f8f9fc' ? '#111827' : 'inherit' }}>
                      {note.title}
                    </h3>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {note.tasks?.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => toggleTask(note.id, task.id)}
                        className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-xl transition-colors -mx-2"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        ) : (
                          <Circle size={20} className="text-gray-300 group-hover:text-brand-blue shrink-0 mt-0.5 transition-colors" strokeWidth={2.5} />
                        )}
                        <span className={`text-[15px] font-medium leading-tight mt-[1px] transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                    
                    {/* Inline Add Task Input */}
                    <div className="flex items-center gap-3 mt-2 px-1">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                        <Plus size={16} strokeWidth={3} />
                      </div>
                      <input 
                        type="text"
                        placeholder="Add a new task..."
                        value={newTaskInputs[note.id] || ""}
                        onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [note.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddBullet(note.id); }}
                        className="flex-1 bg-transparent text-[14px] font-medium text-gray-800 placeholder:text-gray-400 outline-none py-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-1">No active projects</h3>
            <p className="text-[14px] text-gray-500 max-w-[200px] mx-auto">Create a new project above to start tracking your progress.</p>
          </div>
        )}

      </div>
    </div>
  );
}
