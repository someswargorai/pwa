"use client";

import { useEffect } from "react";

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

export default function PushSubscriber() {
  useEffect(() => {
    async function setupPush() {
      // Ensure browser supports push notifications
      if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

      try {
        let permission = Notification.permission;
        
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
          const reg = await navigator.serviceWorker.ready;
          let subscribe = await reg.pushManager.getSubscription();

          if (!subscribe) {
            // Note: You MUST provide an applicationServerKey (VAPID public key) here 
            // to subscribe. We convert it to a Uint8Array for browser compatibility.
            const applicationServerKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string);
            subscribe = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey
            });
          }

          // Save it to the server API you created
          await fetch("/api/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ subscribe })
          });
          
          console.log("Push subscription stored in public/subscribe.json!");
        }
      } catch (err) {
        console.error("Failed to subscribe to push notifications:", err);
      }
    }

    setupPush();
  }, []);

  return null; // Invisible component
}
