"use client";

import { useState, useEffect } from "react";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function   PushSubscriber() {
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("web_push_sub");
    if (saved) {
      setSubscription(JSON.parse(saved));
    }
  }, []);

  const handleSubscribeAndTest = async (delayMs: number = 0) => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }

    try {
      let permission = Notification.permission;
      
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        let subscribe = await reg.pushManager.getSubscription();

        if (!subscribe) {
          const applicationServerKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string);
          subscribe = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
          });
        }

        localStorage.setItem("web_push_sub", JSON.stringify(subscribe));
        setSubscription(subscribe);
        
        // Immediately trigger the API, passing the subscription directly!
        fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
             subscription: subscribe, 
             title: delayMs > 0 ? "Delayed Push Arrived!" : "Stateless Push Success!", 
             message: delayMs > 0 ? "You successfully received this while closed!" : "It works perfectly on Vercel and iOS!",
             delay: delayMs
          })
        }).then(async res => {
          if (!res.ok) {
            const err = await res.json();
            alert("Push failed: " + err.error);
          }
        });
      } else {
        alert("Push permission was denied.");
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
      alert("Subscription error. Check console.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button 
        onClick={() => handleSubscribeAndTest(0)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full shadow-2xl font-medium transition-all"
      >
        {subscription ? "🔔 Send Test Push (Instant)" : "🔔 Enable & Test Push"}
      </button>
      
      {subscription && (
        <button 
          onClick={() => handleSubscribeAndTest(8000)} // 8 second delay
          className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full shadow-2xl font-medium transition-all"
        >
          ⏱️ Test Push (8s Delay)
        </button>
      )}
    </div>
  );
}
