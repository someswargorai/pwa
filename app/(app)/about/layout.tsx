export default function RootLayout({children, teams, orgs}:{
    children: React.ReactNode,
    teams: React.ReactNode,
    orgs: React.ReactNode
}){
    return(
        <div className="flex h-screen w-screen bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      
            <aside className="w-72 h-full border-r border-white/10 bg-[#0a0a0a] hidden md:flex flex-col">
                {teams}
            </aside>
            
            <main className="flex-1 flex flex-col h-full overflow-y-auto">
                
                <div className="p-8 pb-4">
                    {children}
                </div>
                
                <div className="p-8 pt-4 flex-1">
                    {orgs}
                </div>
            </main>
        </div>
    )
}