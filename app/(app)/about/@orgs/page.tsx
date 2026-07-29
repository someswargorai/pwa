import React from 'react'

export default function page() {
  const orgs = [
    { name: 'Acme Corp', status: 'Active', members: 42, plan: 'Enterprise' },
    { name: 'GlobalNet', status: 'Active', members: 128, plan: 'Enterprise' },
    { name: 'TechFlow', status: 'Inactive', members: 14, plan: 'Pro' },
    { name: 'Innovate.io', status: 'Active', members: 8, plan: 'Startup' }
  ];

  return (
    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Organizations</h2>
        <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500 bg-white/[0.02]">
              <th className="px-5 py-3 font-medium">Organization Name</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Members</th>
              <th className="px-5 py-3 font-medium">Plan</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orgs.map((org, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-medium text-zinc-200">{org.name}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${org.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-zinc-400">{org.members}</td>
                <td className="px-5 py-4 text-zinc-400">{org.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
