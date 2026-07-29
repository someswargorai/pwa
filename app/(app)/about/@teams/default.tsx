import React from 'react'

export default function page() {
  return (
    <div className="w-full h-full flex flex-col pt-10 pl-2">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white">T</div>
        <span className="font-semibold text-lg text-white">Teams</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Your Teams</div>
        
        {['Engineering', 'Product Design', 'Marketing', 'Sales'].map((team, i) => (
          <button key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors w-full text-left">
            <div className="w-2 h-2 rounded-full bg-cyan-400/80"></div>
            {team}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors w-full text-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Create New Team
        </button>
      </div>
    </div>
  )
}