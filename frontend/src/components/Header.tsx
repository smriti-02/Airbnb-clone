"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import HeaderTabs from "./HeaderTabs";
import SearchBarExpanded from "./SearchBarExpanded";
import SearchBarCompact from "./SearchBarCompact";
import { formatDateKey } from "@/lib/format";

function useScrollState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const overlayScrollY = useRef(0);
  const isCollapsedRef = useRef(false);

  useEffect(() => {
    isCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);

  useEffect(() => {
    let requestRunning = false;
    const handleScroll = () => {
      if (!requestRunning) {
        requestRunning = true;
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;

          // If overlay is open, close it if scrolled more than 30px
          if (overlayOpen) {
             if (Math.abs(sy - overlayScrollY.current) > 30) {
               setOverlayOpen(false);
             }
          } else {
             // Collapse if scrolled down > 4
             if (!isCollapsedRef.current && sy > 4) {
               setIsCollapsed(true);
             }
             // Expand only if back at very top (<= 1)
             else if (isCollapsedRef.current && sy <= 1) {
               setIsCollapsed(false);
             }
          }
          requestRunning = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [overlayOpen]);

  const openOverlay = () => {
    overlayScrollY.current = window.scrollY;
    setOverlayOpen(true);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
  };

  return { isCollapsed, overlayOpen, openOverlay, closeOverlay };
}

export default function Header() {
  const router = useRouter();
  const { isCollapsed, overlayOpen, openOverlay, closeOverlay } = useScrollState();

  const showExpanded = !isCollapsed || overlayOpen;

  useEffect(() => {
    if (overlayOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeOverlay();
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [overlayOpen, closeOverlay]);

  const handleSearch = (data: any) => {
    let query: any = {};
    if (data.location) query.location = data.location;
    if (data.guests > 0) query.guests = data.guests;
    if (data.dates?.startDate && data.dates?.endDate) {
      try {
         if (data.dates.startDate.getTime() !== data.dates.endDate.getTime()) {
           query.check_in = formatDateKey(data.dates.startDate);
           query.check_out = formatDateKey(data.dates.endDate);
         }
      } catch(e) {}
    }
    
    const url = qs.stringifyUrl({ url: "/", query }, { skipNull: true });
    router.push(url);
    closeOverlay();
  };

  return (
    <>
      {/* Overlay Background */}
      {overlayOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={closeOverlay}
        />
      )}

      {/* CONSTANT Spacer to prevent layout shift. Always 160px. */}
      <div className="w-full h-[160px]" style={{ overflowAnchor: "none" }} />

      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Base Header Layer (white background, shadow) */}
        <div className="absolute top-0 left-0 right-0 h-[80px] bg-white border-b border-[#EBEBEB] z-10"></div>
        
        {/* White background extension for expanded state */}
        <div 
          className={`absolute top-[80px] left-0 right-0 h-[80px] bg-white z-10 transition-opacity duration-260 ${showExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-hidden={!showExpanded}
          // @ts-ignore
          inert={!showExpanded ? true : undefined}
        ></div>

        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 h-[160px] relative z-20 pointer-events-none">
          
          {/* Top row: Logo, UserMenu */}
          <div className="flex flex-row items-center justify-between h-[80px] pointer-events-auto">
            <div className="flex-1 relative z-50">
              <Logo />
            </div>
            <div className="flex-1 flex justify-end relative z-50">
              <UserMenu />
            </div>
          </div>

          {/* Centered Animating Elements */}
          <div className="absolute top-0 left-0 right-0 h-[80px] flex items-center justify-center pointer-events-none z-20">
            
            {/* Compact Pill */}
            <div 
              className={`absolute pointer-events-auto transition-[transform,opacity] origin-center ${showExpanded ? 'opacity-0 scale-95 translate-y-[70px] pointer-events-none duration-[80ms] ease-out' : 'opacity-100 scale-100 translate-y-0 delay-[140ms] duration-[120ms] ease-in'}`}
              style={{ willChange: "transform, opacity" }}
              aria-hidden={showExpanded}
              // @ts-ignore
              inert={showExpanded ? true : undefined}
            >
              <SearchBarCompact onClick={openOverlay} />
            </div>

            {/* Tabs Row */}
            <div 
              className={`absolute top-[24px] pointer-events-auto transition-[transform,opacity] ${showExpanded ? 'opacity-100 translate-y-0 delay-[140ms] duration-[120ms] ease-in' : 'opacity-0 -translate-y-[16px] pointer-events-none duration-[100ms] ease-out'}`}
              style={{ willChange: "transform, opacity" }}
              aria-hidden={!showExpanded}
              // @ts-ignore
              inert={!showExpanded ? true : undefined}
            >
              <HeaderTabs />
            </div>

          </div>

          {/* Large Search Bar */}
          <div 
            className="absolute top-[80px] left-0 right-0 flex justify-center pointer-events-none z-30"
          >
             <SearchBarExpanded 
               onSearch={handleSearch} 
               onCompact={closeOverlay} 
               showExpanded={showExpanded} 
             />
          </div>

        </div>
      </header>
    </>
  );
}
