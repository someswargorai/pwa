"use client";

import fetchProduct from "@/lib/product.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { createUserMutation } from "./queries/userQueries";
import InstallPWA from "./InstallPWA";

export default function ClientPage() {
  const controllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<Product[], Error>({
    queryKey: ["product"],
    queryFn: async ({ signal }) => {
      try {
        const response = await fetch("https://fakestoreapi.com/products", {
          signal,
        });

        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }

        return response.json();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return [];
        }
        throw err;
      }
    },
  });

  const {mutateAsync, isPending, isError} = useMutation({
    mutationFn: async (credentials:{email: string})=>{
      controllerRef.current = new AbortController();
      createUserMutation();
    },
    // before mutationFn execution
    onMutate:(data)=>{
      queryClient.refetchQueries({
        queryKey: ["product"]
      })
    
    },
    onSuccess:()=>{
      alert("Success");
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError:(err)=>{
      console.log(err)
    }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[20%] rounded-full bg-blue-600/10 blur-[150px]" />
    
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 overflow-hidden">
              <div className="absolute inset-[1px] bg-[#050505] rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#0a0a0a]">
                <span className="font-outfit font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-cyan-300 text-xl">X</span>
              </div>
            </div>
            <span className="font-outfit font-bold text-2xl tracking-tight">Nexus</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#store" className="hover:text-white transition-colors">Digital Store</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <InstallPWA />
            <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:block">
              Sign In
            </button>
            <button className="relative group overflow-hidden rounded-full p-[1px]">
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 rounded-full opacity-70 group-hover:opacity-100 animate-[spin_3s_linear_infinite]" />
              <div className="relative bg-[#050505] px-6 py-2.5 rounded-full transition-all group-hover:bg-opacity-0">
                <span className="text-sm font-semibold text-white group-hover:text-black transition-colors">Get Access</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-24 mx-auto max-w-7xl px-6">
       
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-cyan-300 mb-8 backdrop-blur-md cursor-pointer hover:bg-white/[0.05] transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-medium tracking-wide">Nexus Storefront v2.0 is live</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 opacity-50"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          
          <h1 className="font-outfit text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
            Commerce, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              reimagined.
            </span>
          </h1>

          
          
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
            The ultra-fast, headless storefront API that empowers developers to build incredible shopping experiences at the edge.
          </p>
        </div>

        <div id="store" className="relative scroll-mt-32">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-outfit text-3xl font-bold mb-2">Live Storefront Data</h2>
              <p className="text-zinc-500">Fetched in real-time using TanStack Query</p>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-mono text-zinc-400">
                {isLoading ? 'FETCHING_DATA...' : 'API_CONNECTED'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 h-[340px] animate-pulse">
                  <div className="w-full h-48 bg-white/[0.05] rounded-xl mb-4" />
                  <div className="h-4 w-3/4 bg-white/[0.05] rounded mb-2" />
                  <div className="h-4 w-1/2 bg-white/[0.05] rounded mb-4" />
                  <div className="h-6 w-1/4 bg-white/[0.05] rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.map((item: Product, index: number) => (
                <Link 
                  href={`/product/${item.id}`}
                  key={index} 
                  className="group relative rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm overflow-hidden hover:border-violet-500/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_-15px_rgba(139,92,246,0.3)] flex flex-col"
                >
                  {/* Subtle top glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-violet-400 transition-colors duration-500" />
                  
                  {/* Image Container with white background for product visibility */}
                  <div className="relative w-full h-56 bg-white p-6 flex items-center justify-center overflow-hidden">
                    <Image 
                      src={item.image} 
                      alt={item.title}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Category Badge overlay */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-semibold text-zinc-200 line-clamp-2 mb-2 text-sm leading-snug group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Price</span>
                        <span className="font-outfit font-bold text-xl text-cyan-400">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <button className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-violet-500 hover:border-violet-400 hover:text-white transition-all text-zinc-400 group/btn pointer-events-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
