"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Capture the install prompt globally before the user navigates to Settings
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPrompt = e;
      window.dispatchEvent(new Event('installPromptReady'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
