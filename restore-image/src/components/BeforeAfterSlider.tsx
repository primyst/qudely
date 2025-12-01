"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  label: string;
}

export default function BeforeAfterSlider({ before, after, label }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden select-none">
      {/* After Image (Visible part) */}
      <div className="absolute inset-0">
        <Image
          src={after}
          alt="After"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Before Image (Clipped by slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={before}
          alt="Before"
          fill
          className="object-cover"
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseMove={handleMove}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          setSliderPosition(Math.min(Math.max(percentage, 0), 100));
        }}
      >
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center">
          <div className="flex items-center gap-1">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
        Before
      </div>
      <div className="absolute bottom-4 right-4 bg-amber-600 text-white px-3 py-1 rounded text-sm font-medium">
        After
      </div>

      {/* Overlay Instruction */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Drag to compare ↔
      </div>
    </div>
  );
}
