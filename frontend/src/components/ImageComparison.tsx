import React, { useState, useRef } from 'react';
import { ScanSearch, Maximize2 } from 'lucide-react';

export interface ImageComparisonProps {
  original?: string | null;
  result?: string | null;
}

const DEFAULT_ORIGINAL = '/sample_original.png';
const DEFAULT_SEGMENTED = '/sample_segmented.png';

export const ImageComparison: React.FC<ImageComparisonProps> = ({ original, result }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const originalSrc = original || DEFAULT_ORIGINAL;
  const segmentedSrc = result || DEFAULT_SEGMENTED;

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSlider(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <ScanSearch className="w-5 h-5 text-purple-400" />
          Inference Result
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block"></span>Original</span>
            <span className="text-zinc-700">|</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>Segmented</span>
          </div>
          <button className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full flex-1 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 cursor-ew-resize select-none group touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Bottom layer: Original image — fills the entire container */}
        <img 
          src={originalSrc} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          draggable={false}
        />

        {/* Top layer: Segmented mask — clipped by slider position */}
        <div 
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img 
            src={segmentedSrc} 
            alt="Segmented" 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              maxWidth: 'none'
            }}
            draggable={false}
          />
        </div>

        {/* Labels */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-300 tracking-wider uppercase z-10 pointer-events-none">
          Original
        </div>
        <div className="absolute top-3 left-3 bg-purple-900/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-purple-200 tracking-wider uppercase z-10 pointer-events-none">
          Segmented
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute inset-y-0 w-[3px] bg-white shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20 pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 1.5px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900/90 border-2 border-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.6)] backdrop-blur-sm">
            <div className="flex gap-[3px]">
              <div className="w-[3px] h-4 bg-white/80 rounded-full"></div>
              <div className="w-[3px] h-4 bg-white/80 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
