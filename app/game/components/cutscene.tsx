"use client";
import { useState } from 'react';
import Image from 'next/image';

interface CutsceneProps {
  onFinished: () => void;
}

const Cutscene = ({ onFinished }: CutsceneProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 13;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onFinished();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleNext}
    >
      {/* The Story Image */}
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] aspect-video animate-in fade-in duration-700">
        <Image
          src={`/assets/cutscene/scene_${currentStep}.png`}
          alt={`Story scene ${currentStep}`}
          fill
          className="object-contain px-4"
          priority
        />
      </div>

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
          {currentStep === totalSteps ? "TAP TO START MISSION" : "CLICK/TAP TO CONTINUE"}
        </p>
        
        {/* Progress Bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${
                i + 1 === currentStep ? 'bg-blue-500 w-6' : 'bg-gray-700 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cutscene;