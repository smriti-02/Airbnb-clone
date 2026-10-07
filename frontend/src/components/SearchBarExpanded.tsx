"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useSegmentHighlight } from "@/hooks/useSegmentHighlight";
import { formatSearchDates } from "@/lib/format";
import SearchPanelContainer from "./SearchPanelContainer";
import { CrossfadeWrapper, WherePanel, WhenPanel, WhoPanel } from "./SearchPanels";

export default function SearchBarExpanded({ onSearch, onCompact, showExpanded }: { onSearch: (data: any) => void, onCompact?: () => void, showExpanded: boolean }) {
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [dateRange, setDateRange] = useState([
    {
      startDate: searchParams.get("check_in") ? new Date(searchParams.get("check_in")!) : new Date(),
      endDate: searchParams.get("check_out") ? new Date(searchParams.get("check_out")!) : new Date(),
      key: 'selection'
    }
  ]);
  const [guests, setGuests] = useState(parseInt(searchParams.get("guests") || "0"));
  const [activeInput, setActiveInput] = useState<"where" | "when" | "who" | null>(null);

  const { highlightStyle, containerRef } = useSegmentHighlight(activeInput);

  useEffect(() => {
    if (!showExpanded) {
      setActiveInput(null);
    }
  }, [showExpanded]);

  useEffect(() => {
    setLocation(searchParams.get("location") || "");
    const inDate = searchParams.get("check_in");
    const outDate = searchParams.get("check_out");
    setDateRange([{
      startDate: inDate ? new Date(inDate) : new Date(),
      endDate: outDate ? new Date(outDate) : new Date(),
      key: 'selection'
    }]);
    setGuests(parseInt(searchParams.get("guests") || "0"));
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Only close if we are not clicking inside the SearchPanelContainer which is rendered in a portal!
        // Wait, the panel container is in a portal, so containerRef.current.contains() will be FALSE for the portal!
        // We need to check if the click is inside the portal. The portal has class 'panel-contain'.
        const target = e.target as HTMLElement;
        if (!target.closest('.panel-contain')) {
          setActiveInput(null);
        }
      }
    };
    if (activeInput) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeInput, containerRef]);

  // Animation classes
  const shellAnimation = showExpanded 
    ? 'opacity-100 scale-100 translate-y-0 delay-[80ms] duration-[180ms] cubic-bezier(0.2, 0, 0, 1)' 
    : 'opacity-0 scale-[0.45,0.55] -translate-y-[70px] duration-[220ms] ease-out';
    
  const contentAnimation = showExpanded 
    ? 'opacity-100 delay-[140ms] duration-[120ms] ease-in' 
    : 'opacity-0 duration-[100ms] ease-out';

  const hasDates = dateRange[0].startDate.getTime() !== dateRange[0].endDate.getTime();

  return (
    <>
      {activeInput && <div className="fixed inset-0 bg-transparent z-40" onClick={() => setActiveInput(null)} />}
      
      <div 
        className="relative flex-1 max-w-[850px] mx-auto z-50 w-full flex justify-center"
        aria-hidden={!showExpanded}
        // @ts-ignore
        inert={!showExpanded ? true : undefined}
      >
        
        {/* SHELL LAYER - Animates transform */}
        <div 
          className={`absolute top-0 w-full max-w-[850px] h-[66px] border border-[#DDD] rounded-full shadow-[0_3px_12px_rgba(0,0,0,0.1)] transition-all origin-top pointer-events-none ${shellAnimation} ${activeInput ? 'bg-[#EBEBEB]' : 'bg-white'}`}
          style={{ transitionDuration: '150ms', willChange: "transform, opacity, background-color" }}
        />

        {/* CONTENT LAYER - Animates opacity */}
        <div 
          ref={containerRef}
          className={`relative w-full max-w-[850px] h-[66px] flex flex-row items-center transition-opacity pointer-events-auto ${contentAnimation}`}
          style={{ willChange: "opacity" }}
        >
          
          {/* Highlight Element (Sliding White Background) */}
          <div 
            className="absolute top-0 bottom-0 bg-white rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.2)] pointer-events-none transition-all z-0"
            style={{
              width: `${highlightStyle.width}px`,
              transform: highlightStyle.transform,
              opacity: highlightStyle.opacity,
              scale: highlightStyle.scale,
              transitionDuration: activeInput ? '260ms' : '150ms', // sliding vs fade out
              transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
              willChange: 'transform, width, opacity, scale'
            }}
          />

          {/* Where */}
          <div 
            data-segment="where"
            onClick={() => setActiveInput("where")}
            className={`flex-1 h-full rounded-full px-8 py-3 flex flex-col justify-center relative z-10 transition-colors duration-150 ${activeInput === "where" ? "" : "hover:bg-[#DDDDDD] cursor-pointer"}`}
          >
            <div className="text-xs font-bold px-1 text-black">Where</div>
            <input 
              className="bg-transparent outline-none text-sm w-full text-neutral-500 placeholder-neutral-400 px-1 truncate" 
              placeholder="Search destinations" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              onClick={(e) => {
                if (activeInput === "where") e.stopPropagation();
              }}
            />
          </div>
          
          <div className="w-[1px] h-8 bg-[#DDD] z-10"></div>
          
          {/* When */}
          <div 
            data-segment="when"
            onClick={() => setActiveInput("when")}
            className={`flex-1 h-full rounded-full px-8 py-3 flex flex-col justify-center cursor-pointer relative z-10 transition-colors duration-150 ${activeInput === "when" ? "" : "hover:bg-[#DDDDDD]"}`}
          >
            <div className="text-xs font-bold text-black">When</div>
            <div className="text-sm text-neutral-500 truncate">
              {hasDates ? formatSearchDates(dateRange[0].startDate.toISOString(), dateRange[0].endDate.toISOString()) : 'Add dates'}
            </div>
          </div>
          
          <div className="w-[1px] h-8 bg-[#DDD] z-10"></div>
          
          {/* Who */}
          <div 
            data-segment="who"
            onClick={() => setActiveInput("who")}
            className={`flex-[1.2] h-full rounded-full pl-8 pr-2 py-2 flex justify-between items-center cursor-pointer relative z-10 transition-colors duration-150 ${activeInput === "who" ? "" : "hover:bg-[#DDDDDD]"}`}
          >
            <div className="flex flex-col justify-center overflow-hidden">
              <div className="text-xs font-bold px-1 text-black">Who</div>
              <div className="text-sm text-neutral-500 px-1 truncate">
                {guests > 0 ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Add guests'}
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveInput(null);
                onSearch({ location, dates: hasDates ? dateRange[0] : null, guests });
                if (onCompact) onCompact();
              }}
              className="bg-gradient-to-r from-[#E31C5F] to-[#D70466] text-white rounded-full flex items-center justify-center transition-all duration-150 hover:opacity-90 overflow-hidden flex-shrink-0"
              style={{
                width: activeInput ? '110px' : '48px',
                height: '48px',
                willChange: "width"
              }}
            >
              <Search size={18} strokeWidth={3} className="flex-shrink-0" />
              <span 
                className="font-semibold pl-2 pr-1 transition-opacity"
                style={{
                  opacity: activeInput ? 1 : 0,
                  transitionDuration: '150ms',
                  transitionDelay: activeInput ? '60ms' : '0ms',
                  display: activeInput ? 'block' : 'none'
                }}
              >
                Search
              </span>
            </button>
          </div>
        </div>

        {/* The Panel Container */}
        <SearchPanelContainer activeInput={activeInput} anchorRef={containerRef}>
          <CrossfadeWrapper activeKey={activeInput}>
             {activeInput === "where" && <WherePanel location={location} setLocation={setLocation} />}
             {activeInput === "when" && <WhenPanel dateRange={dateRange} setDateRange={setDateRange} />}
             {activeInput === "who" && <WhoPanel guests={guests} setGuests={setGuests} />}
          </CrossfadeWrapper>
        </SearchPanelContainer>

      </div>
    </>
  );
}
