"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PanelProps {
  activeInput: "where" | "when" | "who" | null;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export default function SearchPanelContainer({ activeInput, anchorRef, children }: PanelProps) {
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState({ width: 0, height: 0, transform: "translateX(0px)", opacity: 0, scale: 0.96, translateY: -8 });
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeInput) {
      setIsOpen(true);
      setIsClosing(false);
    } else if (isOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [activeInput, isOpen]);

  useEffect(() => {
    if (!anchorRef.current || !contentRef.current || !isOpen) return;

    const updateLayout = () => {
      const anchorRect = anchorRef.current!.getBoundingClientRect();
      const contentHeight = contentRef.current!.offsetHeight || 100; // fallback height
      
      let width = 420;
      let left = anchorRect.left;
      
      if (activeInput === "where") {
        width = 420;
        left = anchorRect.left;
      } else if (activeInput === "when") {
        width = anchorRect.width;
        left = anchorRect.left;
      } else if (activeInput === "who") {
        width = 420;
        left = anchorRect.right - 420;
      }

      setStyle({
        width,
        height: contentHeight,
        transform: `translateX(${left}px)`,
        opacity: isClosing ? 0 : 1,
        scale: isClosing ? 0.98 : 1,
        translateY: isClosing ? -8 : 0
      });
    };

    updateLayout();
    
    // Resize observer to track content height changes smoothly
    const resizeObserver = new ResizeObserver(() => updateLayout());
    resizeObserver.observe(contentRef.current);
    window.addEventListener("resize", updateLayout);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [activeInput, isOpen, isClosing, anchorRef]);

  if (!mounted || (!isOpen && !isClosing)) return null;

  const top = anchorRef.current ? anchorRef.current.getBoundingClientRect().bottom + 12 : 0;

  const animationStyle = isClosing 
    ? 'duration-[120ms] ease-out' 
    : (activeInput ? 'duration-[200ms] search-ease' : 'duration-[260ms] search-ease'); // 200ms open, 260ms switch

  return createPortal(
    <div 
      className={`fixed z-50 bg-white rounded-[32px] overflow-hidden panel-contain shadow-[0_6px_24px_rgba(0,0,0,0.18)] transition-all origin-top ${animationStyle}`}
      style={{
        top: `${top}px`,
        width: `${style.width}px`,
        height: `${style.height}px`,
        transform: `${style.transform} translateY(${style.translateY}px) scale(${style.scale})`,
        opacity: style.opacity,
        willChange: "transform, opacity, width, height"
      }}
    >
      <div ref={contentRef} className="absolute top-0 left-0 w-full min-h-max bg-white">
        {children}
      </div>
    </div>,
    document.body
  );
}
