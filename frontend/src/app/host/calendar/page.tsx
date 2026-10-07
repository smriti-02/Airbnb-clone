"use client";

import { useEffect, useState, useMemo } from "react";
import { hostApi } from "@/lib/hostApi";
import { formatINR, formatDateKey } from "@/lib/format";
import { HostListingDraft, Reservation } from "@/lib/hostTypes";
import toast from "react-hot-toast";

export default function CalendarPage() {
  const [listings, setListings] = useState<HostListingDraft[]>([]);
  const [activeListing, setActiveListing] = useState<number | null>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [dragStart, setDragStart] = useState<string | null>(null);
  
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const [panelState, setPanelState] = useState({
    status: "available",
    price: 0,
    min_nights: 1
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hostApi.getMyListings()
      .then(res => {
        const published = res.filter(r => r.status === "published");
        setListings(published);
        if (published.length > 0) setActiveListing(published[0].id);
        else setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeListing) {
      const monthKey = formatDateKey(currentDate).substring(0, 7);
      setLoading(true);
      hostApi.getCalendar(activeListing, monthKey)
        .then(setCalendarData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeListing, currentDate]);

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayKey = formatDateKey(new Date());

  const handlePrev = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  
  const handleNext = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // pad start
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth();

  const handleDayClick = (key: string, isBooked: boolean, res?: Reservation) => {
    if (isBooked && res) {
      setSelectedReservation(res);
      setSidePanelOpen(true);
      setSelectedRange([]);
      return;
    }
    if (isBooked) return;

    setSelectedReservation(null);
    
    if (selectedRange.includes(key)) {
      setSelectedRange(selectedRange.filter(k => k !== key));
    } else {
      setSelectedRange([...selectedRange, key].sort());
    }
  };

  const handleDragEnter = (key: string) => {
    if (dragStart && !selectedRange.includes(key)) {
      // simple logic: just append if not there
      setSelectedRange([...selectedRange, key].sort());
    }
  };

  useEffect(() => {
    if (selectedRange.length > 0 && !selectedReservation && calendarData) {
      setSidePanelOpen(true);
      // init panel state from first selected day
      const first = selectedRange[0];
      const dayData = calendarData.days?.[first];
      setPanelState({
        status: dayData?.status === "blocked" ? "blocked" : "available",
        price: dayData?.price || calendarData.base_price,
        min_nights: dayData?.min_nights || calendarData.base_min_nights || 1
      });
    } else if (selectedRange.length === 0 && !selectedReservation) {
      setSidePanelOpen(false);
    }
  }, [selectedRange, calendarData, selectedReservation]);

  const handleSave = async () => {
    if (!activeListing || selectedRange.length === 0) return;
    
    setSaving(true);
    const originalData = JSON.parse(JSON.stringify(calendarData));
    
    try {
      // Optimistic update
      const newDays = { ...calendarData.days };
      selectedRange.forEach(d => {
        newDays[d] = {
          ...newDays[d],
          status: panelState.status,
          price: panelState.price
        };
      });
      setCalendarData({ ...calendarData, days: newDays });
      
      const res = await hostApi.updateCalendar(activeListing, selectedRange, panelState.status, panelState.price);
      toast.success(panelState.status === "blocked" ? "Dates blocked" : "Dates updated");
      setSelectedRange([]);
    } catch (err: any) {
      setCalendarData(originalData); // rollback
      toast.error(err.message || "Failed to update calendar");
    } finally {
      setSaving(false);
    }
  };

  if (!activeListing && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">No published listings</h2>
        <p className="text-gray-500 mb-4">You need a published listing to use the calendar.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-20 md:pt-0 overflow-hidden">
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            {listings.length > 1 && (
              <select 
                className="font-bold text-xl outline-none"
                value={activeListing || ""}
                onChange={e => setActiveListing(parseInt(e.target.value))}
              >
                {listings.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            )}
            {listings.length === 1 && (
              <h1 className="font-bold text-xl truncate">{listings[0].title}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleToday} className="font-semibold text-sm border rounded-full px-4 py-2 hover:bg-gray-50">Today</button>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold">&lt;</button>
              <span className="font-semibold w-32 text-center">{monthYear}</span>
              <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold">&gt;</button>
            </div>
          </div>
        </div>
        
        {/* Grid Header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-gray-500">{d}</div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-2">
          {loading ? (
             <div className="flex justify-center mt-10">Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                if (!d) return <div key={i} className="min-h-[100px]" />;
                
                const key = formatDateKey(d);
                const dayData = calendarData?.days?.[key] || {};
                const isPast = key < todayKey;
                const isSelected = selectedRange.includes(key);
                
                const isBooked = dayData.status === "booked";
                const isBlocked = dayData.status === "blocked";
                const res = isBooked ? calendarData?.reservations?.find((r: any) => r.id === dayData.reservation_id) : null;
                const hasOverride = dayData.price && dayData.price !== calendarData?.base_price;
                const displayPrice = dayData.price || calendarData?.base_price || 0;
                
                return (
                  <div 
                    key={key}
                    onMouseDown={() => { if (!isPast) { setDragStart(key); handleDayClick(key, isBooked, res); } }}
                    onMouseEnter={() => { if (dragStart && !isPast && !isBooked) handleDragEnter(key); }}
                    onMouseUp={() => setDragStart(null)}
                    className={`min-h-[100px] border rounded-lg p-2 flex flex-col relative transition select-none
                      ${isPast ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'bg-white hover:border-gray-400'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-semibold text-sm ${key === todayKey ? 'bg-black text-white w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>{d.getDate()}</span>
                      {hasOverride && !isBooked && !isBlocked && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                    </div>
                    
                    <div className="flex-1 mt-2 flex flex-col justify-end">
                      {isBlocked && (
                        <div className="flex items-center text-gray-400 gap-1 text-xs font-semibold">
                          <span>🔒</span> Blocked
                        </div>
                      )}
                      {isBooked && (
                        <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded truncate">
                          {res?.guest_name?.split(" ")[0]}
                        </div>
                      )}
                      {!isBlocked && !isBooked && (
                        <div className="text-sm font-semibold">{formatINR(displayPrice)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Side Panel */}
      {sidePanelOpen && (
        <div className="w-full md:w-80 border-l bg-white flex flex-col absolute inset-0 z-50 md:relative overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg">
              {selectedReservation ? "Reservation" : `${selectedRange.length} nights selected`}
            </h2>
            <button onClick={() => { setSidePanelOpen(false); setSelectedRange([]); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
          </div>
          
          <div className="p-4 flex-1">
            {selectedReservation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {selectedReservation.guest_avatar && <img src={selectedReservation.guest_avatar} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedReservation.guest_name}</h3>
                    <p className="text-gray-500 text-sm">{selectedReservation.guests} guests</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-500 text-sm mb-1">Check-in</p>
                  <p className="font-semibold">{selectedReservation.check_in}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-500 text-sm mb-1">Check-out</p>
                  <p className="font-semibold">{selectedReservation.check_out}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-500 text-sm mb-1">Payout</p>
                  <p className="font-semibold">{formatINR(selectedReservation.total_price)}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setPanelState(s => ({...s, status: "available"}))}
                      className={`flex-1 py-1 rounded shadow-sm text-sm font-semibold transition ${panelState.status === "available" ? "bg-white" : "text-gray-500 hover:text-black"}`}
                    >Available</button>
                    <button 
                      onClick={() => setPanelState(s => ({...s, status: "blocked"}))}
                      className={`flex-1 py-1 rounded shadow-sm text-sm font-semibold transition ${panelState.status === "blocked" ? "bg-white" : "text-gray-500 hover:text-black"}`}
                    >Blocked</button>
                  </div>
                </div>
                
                {panelState.status === "available" && (
                  <>
                    <div>
                      <label className="block font-semibold mb-2 text-sm">Nightly price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input 
                          type="number"
                          value={panelState.price || ""}
                          onChange={e => setPanelState(s => ({...s, price: parseInt(e.target.value) || 0}))}
                          className="w-full border rounded-lg pl-8 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => setPanelState(s => ({...s, price: calendarData?.base_price || 0}))}
                          className="text-xs font-semibold underline text-gray-500 hover:text-black"
                        >Reset to base</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {!selectedReservation && (
            <div className="p-4 border-t">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
