import React, { useEffect, useState } from 'react';
import { Bacteria } from '../entities/Bacteria';

interface BacteriaRendererProps {
  bacteria: Bacteria;
  scale?: number;
  evolved?: boolean;
}

export const BacteriaRenderer: React.FC<BacteriaRendererProps> = ({
  bacteria,
  scale = 1,
  evolved = false,
}) => {
  const [sprite, setSprite] = useState<string>(bacteria.getCurrentSprite(evolved));

  useEffect(() => {
    let animationFrameId: number;
    
    const updateSprite = () => {
      setSprite(bacteria.getCurrentSprite(evolved));
      animationFrameId = requestAnimationFrame(updateSprite);
    };
    
    animationFrameId = requestAnimationFrame(updateSprite);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [bacteria, evolved]);

  return (
    <img
      src={sprite}
      alt={evolved ? 'superbug bacteria' : 'bacteria'}
      style={{
        width: `${32 * scale}px`,
        height: `${32 * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};
