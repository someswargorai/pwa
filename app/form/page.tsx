"use client";
import React, { useState, useEffect } from "react";
import { set } from "idb-keyval";

export default function SaaSForm() {
  const [formData, setFormData] = useState({ name: "", email: "", company: "", plan: "Pro", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "queued" | "error">("idle");
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      if (!navigator.onLine) {
        throw new Error("Offline");
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Server error");
      setStatus("success");
      setFormData({ name: "", email: "", company: "", plan: "Pro", message: "" });
    } catch (err) {
      console.log("Fetch failed, attempting background sync...", err);
      try {
        await set("offline_form_submit", formData);
        
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          const reg = await navigator.serviceWorker.ready;
          const swReg = reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } };
          if (swReg.sync && typeof swReg.sync.register === "function") {
            await swReg.sync.register("offline_form_submit");
          } else {
            throw new Error("Background sync not supported on this registration");
          }
          setStatus("queued");
          setFormData({ name: "", email: "", company: "", plan: "Pro", message: "" });
        } else {
          setStatus("error");
        }
      } catch (syncErr) {
        console.error("Sync registration failed:", syncErr);
        setStatus("error");
      }
    }
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Connection Status Indicator */}
        {!isOnline && (
          <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <p className="text-amber-200 text-sm font-medium">You are currently offline. Forms will be queued for sync.</p>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-violet-300 mb-3 tracking-tight">
              Upgrade to Premium
            </h1>
            <p className="text-slate-400 font-medium">Supercharge your workflow today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Work Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Company Name</label>
              <input 
                type="text" 
                name="company" 
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                placeholder="Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Plan</label>
              <select 
                name="plan" 
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 appearance-none"
              >
                <option value="Pro" className="bg-slate-900">Pro - $29/mo</option>
                <option value="Business" className="bg-slate-900">Business - $99/mo</option>
                <option value="Enterprise" className="bg-slate-900">Enterprise - Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Additional Notes</label>
              <textarea 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 resize-none"
                placeholder="Tell us about your needs..."
              />
            </div>

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="w-full relative group overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex items-center justify-center gap-2">
                {status === "submitting" ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : status === "success" ? (
                  "Submitted Successfully!"
                ) : status === "queued" ? (
                  "Queued for Background Sync!"
                ) : (
                  "Submit Request"
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
