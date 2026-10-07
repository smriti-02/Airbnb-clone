"use client";

import { useEffect, useState, ReactNode } from "react";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export function CrossfadeWrapper({ activeKey, children }: { activeKey: string | null; children: ReactNode }) {
  const [displayKey, setDisplayKey] = useState(activeKey);
  const [fadingOut, setFadingOut] = useState(false);
  const [fadingIn, setFadingIn] = useState(false);

  useEffect(() => {
    if (activeKey !== displayKey) {
      if (activeKey === null) {
        // Just unmount
        setDisplayKey(null);
      } else {
        if (displayKey !== null) {
          // Fade out old
          setFadingOut(true);
          setFadingIn(false);
          const t1 = setTimeout(() => {
            setFadingOut(false);
            setDisplayKey(activeKey);
            setFadingIn(true);
            const t2 = setTimeout(() => {
              setFadingIn(false);
            }, 160);
            return () => clearTimeout(t2);
          }, 100);
          return () => clearTimeout(t1);
        } else {
          // Mount new immediately without 100ms delay, just fade in
          setDisplayKey(activeKey);
          setFadingIn(true);
          const t = setTimeout(() => setFadingIn(false), 160);
          return () => clearTimeout(t);
        }
      }
    }
  }, [activeKey, displayKey]);

  if (!displayKey) return null;

  return (
    <div 
      className={`w-full transition-[opacity,transform] ${
        fadingOut ? 'opacity-0 duration-[100ms] ease-out pointer-events-none' : 
        fadingIn ? 'opacity-0 translate-y-[6px] duration-0' : 
        'opacity-100 translate-y-0 duration-[160ms] ease-in'
      }`}
      aria-hidden={fadingOut}
      style={{ willChange: "opacity, transform" }}
    >
      {/* 
        Hack to apply the fade-in animation instantly after the 0ms opacity-0 frame. 
        We use a separate animation class for fading in. 
      */}
      {children}
    </div>
  );
}

// Destination suggestions: row hover background fade (120ms, #F7F7F7), icon tile slight scale 1.04 on hover. Rows fade in on open with a 20ms stagger for the first 6 rows only.
const SUGGESTED_DESTINATIONS = [
  { name: "Bhopal, Madhya Pradesh", desc: "Known for its lakes", bg: "#F8E9E7", color: "#873C33" },
  { name: "Puri, Odisha", desc: "For its seaside allure", bg: "#F1F5FB", color: "#285382" },
  { name: "North Goa, Goa", desc: "For sights like Fort Aguada", bg: "#FCF3EB", color: "#C27A41" },
  { name: "Varanasi, Uttar Pradesh", desc: "A hidden gem", bg: "#FDEBEA", color: "#E84D3D" },
  { name: "New Delhi, Delhi", desc: "For its stunning architecture", bg: "#EBF5F0", color: "#236B3E" },
  { name: "Mumbai, Maharashtra", desc: "For its top-notch dining", bg: "#EBF5F0", color: "#236B3E" },
  { name: "Pune, Maharashtra", desc: "Off the beaten path", bg: "#EBF3FC", color: "#3482C6" }
];

const DestinationIcon = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22V10c0-1 1-2 2-2h6c1 0 2 1 2 2v12" />
    <path d="M11 12h2" />
    <path d="M15 12h2" />
    <path d="M11 16h2" />
    <path d="M15 16h2" />
    <path d="M22 22v-8c0-1 1-2 2-2s2 1 2 2v8" />
    <path d="M24 14c-1.5 0-3-1.5-3-3 0-1 1-1.5 2-2" />
    <path d="M24 14c1.5 0 3-1.5 3-3 0-1-1-1.5-2-2" />
    <path d="M4 26s1.5-1 3-1 3 1 3 1 1.5-1 3-1 3 1 3 1 1.5-1 3-1 3 1 3 1" />
    <path d="M4 29s1.5-1 3-1 3 1 3 1 1.5-1 3-1 3 1 3 1 1.5-1 3-1 3 1 3 1" />
  </svg>
);

export function WherePanel({ location, setLocation }: { location: string, setLocation: (val: string) => void }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/locations/suggest?q=${encodeURIComponent(location || '')}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (e) {}
      setLoading(false);
    };
    
    const timeout = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <div className="p-6 pt-8 max-h-[460px] overflow-y-auto custom-scrollbar">
      {location && suggestions.length === 0 && !loading && (
        <div className="px-2 text-neutral-500">No matching destinations</div>
      )}
      {(!location || suggestions.length > 0) && (
        <h3 className="text-xs font-bold text-neutral-800 mb-2 px-2">
          {location ? "Suggested destinations" : "Popular destinations"}
        </h3>
      )}
      <div className="flex flex-col">
        {suggestions.map((r, i) => (
          <div 
            key={r.label} 
            className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl hover:bg-[#F7F7F7] transition-colors duration-[120ms]"
            onClick={() => setLocation(r.label)}
            style={{ animation: i < 6 ? `fadeInRow 300ms ease-out ${i * 20}ms both` : 'none' }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-[120ms] group-hover:scale-[1.04] bg-[#F1F5FB]"
            >
              <DestinationIcon color="#285382" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[15px] font-semibold text-neutral-800 leading-snug">{r.label}</div>
              <div className="text-sm font-light text-neutral-500">{r.tagline} • {r.listing_count} stays</div>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #DDDDDD;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}

// Calendar: Dates | Flexible toggle thumb slides (200ms). Selected day circle scales .8 -> 1 (120ms). Range fill transitions bg color (120ms). Hover day shows 1px dark ring fade-in (100ms). Month change: grid fades (100ms).
export function WhenPanel({ dateRange, setDateRange }: { dateRange: any, setDateRange: any }) {
  const [tab, setTab] = useState("dates");
  return (
    <div className="p-8 pb-4 flex flex-col items-center custom-calendar-wrapper">
      <div className="bg-[#EBEBEB] rounded-full p-1 flex relative mb-6 w-fit mx-auto">
        <div 
          className="absolute top-1 bottom-1 w-[120px] bg-white rounded-full shadow-sm transition-transform duration-200 search-ease"
          style={{ transform: tab === "dates" ? "translateX(0)" : "translateX(100%)" }}
        />
        <button className="relative z-10 w-[120px] py-1.5 text-sm font-semibold rounded-full" onClick={() => setTab("dates")}>Dates</button>
        <button className="relative z-10 w-[120px] py-1.5 text-sm font-semibold rounded-full" onClick={() => setTab("flexible")}>Flexible</button>
      </div>
      
      {tab === "dates" ? (
        <DateRange
          ranges={dateRange}
          onChange={item => setDateRange([item.selection as any])}
          months={2}
          direction="horizontal"
          rangeColors={["#222222"]}
          showDateDisplay={false}
        />
      ) : (
        <div className="py-20 text-neutral-500 font-light">Flexible dates options would go here</div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-calendar-wrapper .rdrDay {
          transition: background-color 120ms ease;
        }
        .custom-calendar-wrapper .rdrDayHovered {
          border: 1px solid #222222;
          border-radius: 50%;
          transition: border-color 100ms ease;
        }
        .custom-calendar-wrapper .rdrSelected, .custom-calendar-wrapper .rdrInRange, .custom-calendar-wrapper .rdrStartEdge, .custom-calendar-wrapper .rdrEndEdge {
          background: #EBEBEB;
          color: #222222 !important;
          transition: all 120ms ease;
        }
        .custom-calendar-wrapper .rdrStartEdge, .custom-calendar-wrapper .rdrEndEdge {
          background: #222222;
          color: white !important;
          border-radius: 50% !important;
          animation: pop 120ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        @keyframes pop {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
        .custom-calendar-wrapper .rdrMonth {
          animation: fade 100ms ease-in forwards;
        }
      `}} />
    </div>
  );
}

// Guests stepper: hover bg 150ms, press scale .92 80ms. Disabled "-" fades (150ms). Vertical tick on number change.
export function WhoPanel({ guests, setGuests }: { guests: number, setGuests: (val: number) => void }) {
  const [adults, setAdults] = useState(guests || 0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);

  const update = (type: 'adults' | 'children' | 'infants', val: number) => {
    if (val < 0) return;
    
    let newAdults = type === 'adults' ? val : adults;
    let newChildren = type === 'children' ? val : childrenCount;
    let newInfants = type === 'infants' ? val : infants;

    if (newAdults + newChildren > 16) return; // max 16 guests

    if ((newChildren > 0 || newInfants > 0) && newAdults === 0) {
      newAdults = 1;
    }

    if (type === 'adults') setAdults(newAdults);
    if (type === 'children') setChildrenCount(newChildren);
    if (type === 'infants') setInfants(newInfants);
    
    // update dependents if changed
    if (type !== 'adults' && newAdults !== adults) {
       setAdults(newAdults);
    }

    setAnimatingKey(type);
    setTimeout(() => setAnimatingKey(null), 120);

    setGuests(newAdults + newChildren);
  };

  const Row = ({ title, subtitle, count, type }: { title: string, subtitle: string, count: number, type: 'adults'|'children'|'infants' }) => (
    <div className="flex justify-between items-center py-4 border-b border-neutral-200 last:border-0">
      <div className="flex flex-col">
        <span className="font-semibold text-neutral-800">{title}</span>
        <span className="text-sm text-neutral-500 font-light">{subtitle}</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          disabled={count <= 0}
          onClick={() => update(type, count - 1)}
          className="w-8 h-8 rounded-full border border-neutral-400 flex items-center justify-center text-neutral-600 transition-all duration-150 hover:border-black hover:text-black active:scale-[0.92] disabled:opacity-30 disabled:border-neutral-200 disabled:hover:border-neutral-200 disabled:active:scale-100 disabled:cursor-not-allowed"
          style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)' }}
        >
          -
        </button>
        
        <div className="w-4 text-center font-light relative h-6 overflow-hidden">
          <div 
            key={count} 
            className="absolute inset-0"
            style={{ 
              animation: animatingKey === type ? 'slideUp 120ms cubic-bezier(0.2, 0, 0, 1) forwards' : 'none' 
            }}
          >
            {count}
          </div>
        </div>
        
        <button 
          onClick={() => update(type, count + 1)}
          className="w-8 h-8 rounded-full border border-neutral-400 flex items-center justify-center text-neutral-600 transition-all duration-150 hover:border-black hover:text-black active:scale-[0.92]"
          style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)' }}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 px-10 flex flex-col">
      <Row title="Adults" subtitle="Ages 13 or above" count={adults} type="adults" />
      <Row title="Children" subtitle="Ages 2-12" count={childrenCount} type="children" />
      <Row title="Infants" subtitle="Under 2" count={infants} type="infants" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(6px); opacity: 0.4; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
