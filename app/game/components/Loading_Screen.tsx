"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

const LoadingScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [frame, setFrame] = useState(1);
  const totalFrames = 7;

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => {
        if (prev >= totalFrames) {
          clearInterval(timer);
          setTimeout(onFinished, 500); // Small pause at the end
          return prev;
        }
        return prev + 1;
      });
    }, 800); // Change image every 0.8 seconds

    return () => clearInterval(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        <Image
          src={`/assets/loading/loading screen_${frame}.png`}
          alt="Loading story..."
          fill
          className="object-contain"
          priority
        />
      </div>
      
      {/* Visual Progress Bar */}
      <div className="mt-8 w-64 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${(frame / totalFrames) * 100}%` }}
        />
      </div>
      <p className="mt-4 text-blue-400 font-mono animate-pulse">
        {frame < totalFrames ? "INITIALIZING TREATMENT..." : "READY TO DISINFECT!"}
      </p>
    </div>
  );
};

export default LoadingScreen;