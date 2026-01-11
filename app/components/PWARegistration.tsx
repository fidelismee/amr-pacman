// app/components/PWARegistration.tsx
"use client";

import { useEffect } from 'react';

const PWARegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Always register service worker, even on localhost for testing
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available
                  console.log('New PWA update available!');
                  // You could show a toast notification here to prompt user to refresh
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
      
      // Force update check on page load
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    }
    
    // Add beforeinstallprompt event listener for PWA installation
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA installation available');
      // You could store the event and show an install button
    });
  }, []);

  return null; // This component doesn't render anything
};

export default PWARegistration;
