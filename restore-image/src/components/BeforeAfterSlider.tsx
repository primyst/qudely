'use client';

import { ReactNode } from 'react';
import { ReactCompareSlider, ReactCompareSliderHandle } from 'react-compare-slider';

interface BeforeAfterSliderProps {
  before: string; // original or restored image
  after: string;  // restored or colorized image
}

export default function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '1rem auto' }}>
      <ReactCompareSlider
        itemOne={<img src={before} alt="Before" style={{ width: '100%', display: 'block' }} />}
        itemTwo={<img src={after} alt="After" style={{ width: '100%', display: 'block' }} />}
        handle={<ReactCompareSliderHandle />}
      />
    </div>
  );
}
