"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useSegmentHighlight(activeInput: string | null) {
  const [highlightStyle, setHighlightStyle] = useState({ width: 0, transform: "translateX(0px)", opacity: 0, scale: 0.96 });
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const updateHighlight = useCallback(() => {
    if (!activeInput || !containerRef.current) return;
    
    const segment = containerRef.current.querySelector(`[data-segment="${activeInput}"]`) as HTMLElement;
    if (segment) {
      const left = segment.offsetLeft;
      const width = segment.offsetWidth;
      
      setHighlightStyle({
        width: width,
        transform: `translateX(${left}px)`,
        opacity: 1,
        scale: 1
      });
      
      if (isFirstOpen) {
        setTimeout(() => setIsFirstOpen(false), 50);
      }
    }
  }, [activeInput, isFirstOpen]);

  useEffect(() => {
    if (activeInput) {
      updateHighlight();
    } else {
      setIsFirstOpen(true);
      setHighlightStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeInput, updateHighlight]);

  useEffect(() => {
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  return { highlightStyle, isFirstOpen, containerRef };
}
