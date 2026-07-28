"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface CutsceneProps {
  onFinished: () => void;
}

const SCENE_FILES = [
  'scene_1.png',
  'scene_2.png',
  'scene_3.png',
  'scene_4.png',
  'scene_5.png',
  'scene_6.png',
  'scene_7.png',
  'scene_8.png',
  'scene_9.png', 
  'scene_10.png',
  'scene_11.png',
  'scene_12.png',
  'scene_13.png',
  'scene_14.png',
  'scene_15.png',
  'scene_16.png',
  'scene_17.png',
  'scene_18.png',
  'scene_19.png'
];

const Cutscene = ({ onFinished }: CutsceneProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = SCENE_FILES.length;

  const handleNext = useCallback(() => {
    // Note: don't call onFinished() inside the setCurrentStep updater —
    // updaters run during render, and setState on the parent there triggers
    // React's "cannot update a component while rendering" error.
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinished();
    }
  }, [currentStep, totalSteps, onFinished]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  // Keyboard navigation: Left = back, Right/Space = forward.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handleBack]);

  return (
    <div
      className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleNext}
    >
      {/* The Story Image */}
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] aspect-video animate-in fade-in duration-700">
        <Image
          src={`/assets/cutscene/${SCENE_FILES[currentStep - 1]}`}
          alt={`Story scene ${currentStep}`}
          fill
          className="object-contain px-4"
          priority
        />
      </div>

      {/* Back Button (only after the first scene) */}
      {currentStep > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Don't also trigger the main "next" click
            handleBack();
          }}
          className="absolute top-6 left-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-full transition-all"
        >
          ◀ BACK
        </button>
      )}

      {/* Skip Button (Optional) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents the main "next" click from firing
          onFinished();
        }}
        className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-full transition-all"
      >
        SKIP STORY ➔
      </button>

      {/* Bottom Navigation Info */}
      <div className="absolute bottom-8 flex flex-col items-center gap-4">
        <p className="text-white/40 text-sm font-mono tracking-widest animate-pulse">
          {currentStep === totalSteps ? "TAP TO START MISSION" : "TAP / → NEXT  •  ← BACK"}
        </p>

        {/* Progress Bar — click a dot to jump to that scene */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to scene ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentStep(i + 1);
              }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i + 1 === currentStep ? 'bg-blue-500 w-6' : 'bg-gray-700 hover:bg-gray-500 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cutscene;
