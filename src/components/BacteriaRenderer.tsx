import React, { useEffect, useState } from 'react';
import { Bacteria } from '../entities/Bacteria';

interface BacteriaRendererProps {
  bacteria: Bacteria;
  scale?: number;
}

export const BacteriaRenderer: React.FC<BacteriaRendererProps> = ({
  bacteria,
  scale = 1,
}) => {
  const [sprite, setSprite] = useState<string>(bacteria.getCurrentSprite());

  useEffect(() => {
    let animationFrameId: number;
    
    const updateSprite = () => {
      setSprite(bacteria.getCurrentSprite());
      animationFrameId = requestAnimationFrame(updateSprite);
    };
    
    animationFrameId = requestAnimationFrame(updateSprite);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [bacteria]);

  return (
    <img
      src={sprite}
      alt="bacteria"
      style={{
        width: `${32 * scale}px`,
        height: `${32 * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};
