"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { fetchProductById } from "@/lib/product.api";
import InstallPWA from "@/app/InstallPWA";

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

export default function ProductDetailClient({ id }: { id: string }) {
  const queryClient = useQueryClient();
  
  const { data: product, isLoading, isError } = useQuery<Product, Error>({
    queryKey: ["product", id],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/product/${id}`, { signal });
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    initialData: () => {
      const allProducts = queryClient.getQueryData<Product[]>(["product"]);
      return allProducts?.find((d) => d.id.toString() === id);
    },
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[20%] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 overflow-hidden">
              <div className="absolute inset-[1px] bg-[#050505] rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#0a0a0a]">
                <span className="font-outfit font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-cyan-300 text-xl">X</span>
              </div>
            </div>
            <span className="font-outfit font-bold text-2xl tracking-tight">Nexus</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <InstallPWA />
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Back to Store
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24 mx-auto max-w-7xl px-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          </div>
        ) : isError || !product ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
            <p className="text-zinc-400 mb-8">This item may have been removed or does not exist.</p>
            <Link href="/" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left side: Image Glass Container */}
            <div className="relative w-full aspect-square md:h-[600px] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-12 flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-full h-full bg-white rounded-2xl p-8 shadow-2xl flex items-center justify-center">
                <Image 
                  src={product.image} 
                  alt={product.title}
                  width={600}
                  height={600}
                  className="object-contain w-full h-full drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>

            {/* Right side: Product Details */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-cyan-300 mb-6 backdrop-blur-md w-fit">
                <span className="font-medium tracking-wide uppercase text-xs">{product.category}</span>
              </div>
              
              <h1 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                {product.title}
              </h1>
              
              {product.rating && (
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round(product.rating!.rate) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="opacity-80">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-zinc-400 text-sm">({product.rating.count} reviews)</span>
                </div>
              )}
              
              <div className="text-4xl md:text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-8">
                ${product.price.toFixed(2)}
              </div>
              
              <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="relative group overflow-hidden rounded-full p-[1px] flex-1">
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 rounded-full opacity-70 group-hover:opacity-100 animate-[spin_3s_linear_infinite]" />
                  <div className="relative bg-[#050505] px-8 py-4 rounded-full transition-all group-hover:bg-opacity-0 flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white group-hover:text-black transition-colors">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <span className="text-lg font-semibold text-white group-hover:text-black transition-colors">Add to Cart</span>
                  </div>
                </button>
                
                <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-zinc-300 hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
