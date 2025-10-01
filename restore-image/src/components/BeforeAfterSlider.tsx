'use client';

import Image from 'next/image';
import { ReactCompareSlider, ReactCompareSliderHandle } from 'react-compare-slider';

interface BeforeAfterSliderProps {
  before: string; // original or restored image
  after: string;  // restored or colorized image
}

export default function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '1rem auto' }}>
      <ReactCompareSlider
        itemOne={
          <Image
            src={before}
            alt="Before"
            width={600}
            height={400}
            style={{ width: '100%', display: 'block', height: 'auto' }}
          />
        }
        itemTwo={
          <Image
            src={after}
            alt="After"
            width={600}
            height={400}
            style={{ width: '100%', display: 'block', height: 'auto' }}
          />
        }
        handle={<ReactCompareSliderHandle />}
      />
    </div>
  );
}