"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { DateRange } from "react-date-range";

export default function SearchBar({ onSearch }: { onSearch: (data: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [guests, setGuests] = useState(0);

  if (!expanded) {
    return (
      <div 
        onClick={() => setExpanded(true)}
        className="border border-[color:var(--color-airbnb-border)] py-2 rounded-full shadow-[var(--shadow-airbnb)] hover:shadow-[var(--shadow-airbnb-hover)] transition cursor-pointer flex items-center justify-between"
      >
        <div className="text-sm font-semibold px-6">Anywhere</div>
        <div className="text-sm font-semibold px-6 border-x border-[color:var(--color-airbnb-border)]">Any week</div>
        <div className="text-sm pl-4 pr-2 text-neutral-500 flex items-center gap-3">
          <div>Add guests</div>
          <div className="p-2 bg-[color:var(--color-airbnb-primary)] rounded-full text-white">
            <Search size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setExpanded(false)} />
      <div className="absolute top-0 left-0 w-full bg-white z-50 pb-6 shadow-md flex flex-col items-center animate-in slide-in-from-top-4 duration-200 rounded-b-3xl">
        <div className="flex gap-8 py-4">
          <div className="font-semibold border-b-2 border-black pb-1 cursor-pointer">Stays</div>
          <div className="text-neutral-500 hover:text-black cursor-pointer transition">Experiences</div>
        </div>
        
        <div className="border border-[color:var(--color-airbnb-border)] bg-neutral-100 rounded-full flex flex-row items-center relative w-[800px] max-w-full shadow-lg">
          {/* Where */}
          <div className="flex-1 hover:bg-white rounded-full px-8 py-3 cursor-pointer group transition">
            <div className="text-xs font-bold">Where</div>
            <input 
              className="bg-transparent outline-none text-sm w-full group-hover:bg-white" 
              placeholder="Search destinations" 
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div className="w-[1px] h-8 bg-neutral-300"></div>
          
          {/* Check in / Check out */}
          <div className="flex-1 hover:bg-white rounded-full px-8 py-3 cursor-pointer relative group transition">
            <div className="text-xs font-bold">Check in</div>
            <div className="text-sm text-neutral-500">Add dates</div>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 hidden group-hover:block bg-white shadow-xl rounded-3xl p-4 z-50 border border-[color:var(--color-airbnb-border)]">
               <DateRange
                  ranges={dateRange}
                  onChange={item => setDateRange([item.selection as any])}
                  months={2}
                  direction="horizontal"
                  rangeColors={["#FF385C"]}
                />
            </div>
          </div>
          
          <div className="w-[1px] h-8 bg-neutral-300"></div>
          
          {/* Who */}
          <div className="flex-1 hover:bg-white rounded-full pl-8 pr-2 py-2 flex justify-between items-center cursor-pointer transition group">
            <div className="flex flex-col">
              <div className="text-xs font-bold">Who</div>
              <input 
                type="number"
                min="0"
                className="bg-transparent outline-none text-sm w-16 group-hover:bg-white text-neutral-500" 
                placeholder="Add guests" 
                value={guests || ""}
                onChange={e => setGuests(parseInt(e.target.value) || 0)}
              />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSearch({ location, dates: dateRange[0], guests });
                setExpanded(false);
              }}
              className="bg-[color:var(--color-airbnb-primary)] text-white p-4 rounded-full flex gap-2 items-center hover:bg-[color:var(--color-airbnb-primary-hover)] transition"
            >
              <Search size={18} />
              <span className="font-semibold">Search</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
