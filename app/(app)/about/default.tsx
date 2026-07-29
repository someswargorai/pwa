export default function page() {
  return (
    <div className="w-full">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">About Dashboard</h1>
            <p className="text-zinc-400 text-sm">Manage your teams, view organization metrics, and monitor performance.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400 font-medium mb-1">Total Users</p>
                <p className="text-2xl font-semibold text-white">24,592</p>
                <div className="mt-2 flex items-center text-xs text-emerald-400">
                    <span>+12.5% from last month</span>
                </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400 font-medium mb-1">Active Projects</p>
                <p className="text-2xl font-semibold text-white">142</p>
                <div className="mt-2 flex items-center text-xs text-emerald-400">
                    <span>+4.1% from last month</span>
                </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400 font-medium mb-1">Total Revenue</p>
                <p className="text-2xl font-semibold text-white">$124.5k</p>
                <div className="mt-2 flex items-center text-xs text-rose-400">
                    <span>-2.4% from last month</span>
                </div>
            </div>
        </div>
    </div>
  )
}
