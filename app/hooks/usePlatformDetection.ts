"use client";

import { useState, useEffect } from 'react';

export type PlatformType = 'pwa-mobile' | 'browser-mobile' | 'browser-desktop' | 'unknown';

export interface PlatformDetection {
  isPWA: boolean;
  isMobile: boolean;
  platformType: PlatformType;
  userAgent: string;
  displayMode: string;
}

/**
 * Detects whether the app is running as a PWA, in a browser, on mobile or desktop
 */
export const usePlatformDetection = (): PlatformDetection => {
  const [detection, setDetection] = useState<PlatformDetection>({
    isPWA: false,
    isMobile: false,
    platformType: 'unknown',
    userAgent: '',
    displayMode: 'browser',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get user agent
    const userAgent = navigator.userAgent || '';
    
    // Detect mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isMobileViewport = window.innerWidth <= 768;
    const isMobile = isMobileDevice || isMobileViewport;

    // Detect PWA (Progressive Web App)
    let isPWA = false;
    let displayMode = 'browser';

    // Method 1: display-mode media query (standard)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isPWA = true;
      displayMode = 'standalone';
    } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
      isPWA = true;
      displayMode = 'fullscreen';
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      isPWA = true;
      displayMode = 'minimal-ui';
    }
    
    // Method 2: navigator.standalone (iOS)
    if ('standalone' in navigator && (navigator as any).standalone) {
      isPWA = true;
      displayMode = 'standalone';
    }

    // Method 3: Check for specific PWA indicators
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) {
      isPWA = true;
      displayMode = 'window-controls-overlay';
    }

    // Determine platform type
    let platformType: PlatformType = 'unknown';
    
    if (isPWA && isMobile) {
      platformType = 'pwa-mobile';
    } else if (!isPWA && isMobile) {
      platformType = 'browser-mobile';
    } else if (!isPWA && !isMobile) {
      platformType = 'browser-desktop';
    } else if (isPWA && !isMobile) {
      // PWA on desktop (less common but possible)
      platformType = 'browser-desktop'; // Treat as desktop browser for UI purposes
    }

    setDetection({
      isPWA,
      isMobile,
      platformType,
      userAgent,
      displayMode,
    });

    // Listen for display mode changes (if supported)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setDetection(prev => ({
          ...prev,
          isPWA: true,
          displayMode: 'standalone',
          platformType: prev.isMobile ? 'pwa-mobile' : 'browser-desktop',
        }));
      } else {
        setDetection(prev => ({
          ...prev,
          isPWA: false,
          displayMode: 'browser',
          platformType: prev.isMobile ? 'browser-mobile' : 'browser-desktop',
        }));
      }
    };

    // Listen for resize to update mobile detection
    const handleResize = () => {
      const newIsMobileViewport = window.innerWidth <= 768;
      const newIsMobile = isMobileDevice || newIsMobileViewport;
      
      setDetection(prev => {
        let newPlatformType = prev.platformType;
        
        if (prev.isPWA && newIsMobile) {
          newPlatformType = 'pwa-mobile';
        } else if (!prev.isPWA && newIsMobile) {
          newPlatformType = 'browser-mobile';
        } else if (!prev.isPWA && !newIsMobile) {
          newPlatformType = 'browser-desktop';
        }
        
        return {
          ...prev,
          isMobile: newIsMobile,
          platformType: newPlatformType,
        };
      });
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return detection;
};

/**
 * Simple hook that returns just the platform type
 */
export const usePlatformType = (): PlatformType => {
  const { platformType } = usePlatformDetection();
  return platformType;
};

/**
 * Hook to check if running as PWA
 */
export const useIsPWA = (): boolean => {
  const { isPWA } = usePlatformDetection();
  return isPWA;
};

/**
 * Hook to check if on mobile device
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = usePlatformDetection();
  return isMobile;
};
