"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { usePlatformDetection, PlatformType, PlatformDetection } from '../hooks/usePlatformDetection';

interface PlatformContextType extends PlatformDetection {
  // Additional context methods if needed
  showTouchControls: boolean;
  showKeyboardInstructions: boolean;
  isFullscreenExperience: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

interface PlatformProviderProps {
  children: ReactNode;
}

export const PlatformProvider = ({ children }: PlatformProviderProps) => {
  const detection = usePlatformDetection();
  
  // Derived values based on platform detection
  const showTouchControls = detection.isMobile || detection.platformType === 'pwa-mobile' || detection.platformType === 'browser-mobile';
  const showKeyboardInstructions = detection.platformType === 'browser-desktop';
  const isFullscreenExperience = detection.isPWA && detection.isMobile;

  const value: PlatformContextType = {
    ...detection,
    showTouchControls,
    showKeyboardInstructions,
    isFullscreenExperience,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

// Helper hooks for common use cases
export const usePlatformType = (): PlatformType => {
  const { platformType } = usePlatform();
  return platformType;
};

export const useIsPWA = (): boolean => {
  const { isPWA } = usePlatform();
  return isPWA;
};

export const useIsMobile = (): boolean => {
  const { isMobile } = usePlatform();
  return isMobile;
};

export const useShouldShowTouchControls = (): boolean => {
  const { showTouchControls } = usePlatform();
  return showTouchControls;
};

export const useShouldShowKeyboardInstructions = (): boolean => {
  const { showKeyboardInstructions } = usePlatform();
  return showKeyboardInstructions;
};
