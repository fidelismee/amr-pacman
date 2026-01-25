import React, { useEffect, useState } from 'react';
import { Antibiotic } from '../entities/Antibiotic';

interface AntibioticRendererProps {
  antibiotic: Antibiotic;
  scale?: number;
}

export const AntibioticRenderer: React.FC<AntibioticRendererProps> = ({
  antibiotic,
  scale = 1,
}) => {
  const [sprite, setSprite] = useState<string>(antibiotic.getCurrentSprite());

  useEffect(() => {
    let animationFrameId: number;
    
    const updateSprite = () => {
      setSprite(antibiotic.getCurrentSprite());
      animationFrameId = requestAnimationFrame(updateSprite);
    };
    
    animationFrameId = requestAnimationFrame(updateSprite);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [antibiotic]);

  return (
    <img
      src={sprite}
      alt="antibiotic"
      style={{
        width: `${32 * scale}px`,
        height: `${32 * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};