"use client";

import { useState } from "react";

export default function HeaderTabs() {
  const [activeTab, setActiveTab] = useState("homes");

  const handleTabClick = (tabId: string) => {
    if (tabId === "experiences" || tabId === "services") {
      alert("Coming soon!");
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="flex gap-6 items-center justify-center font-medium text-base pb-2">
      <button 
        onClick={() => handleTabClick("all")}
        className={`flex flex-col items-center gap-1 transition ${activeTab === "all" ? "text-black" : "text-[#717171] hover:text-neutral-900"}`}
      >
        <span className="text-xl">🌍</span>
        <span className={`relative pb-1 ${activeTab === "all" ? "font-semibold" : ""}`}>
          All
          {activeTab === "all" && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-black rounded-full" />}
        </span>
      </button>

      <button 
        onClick={() => handleTabClick("homes")}
        className={`flex flex-col items-center gap-1 transition ${activeTab === "homes" ? "text-black" : "text-[#717171] hover:text-neutral-900"}`}
      >
        <span className="text-xl">🏠</span>
        <span className={`relative pb-1 ${activeTab === "homes" ? "font-semibold" : ""}`}>
          Homes
          {activeTab === "homes" && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-black rounded-full" />}
        </span>
      </button>

      <button 
        onClick={() => handleTabClick("experiences")}
        className={`flex flex-col items-center gap-1 transition ${activeTab === "experiences" ? "text-black" : "text-[#717171] hover:text-neutral-900"}`}
      >
        <span className="text-xl">🎈</span>
        <span className={`relative pb-1 ${activeTab === "experiences" ? "font-semibold" : ""}`}>
          Experiences
          {activeTab === "experiences" && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-black rounded-full" />}
        </span>
      </button>

      <button 
        onClick={() => handleTabClick("services")}
        className={`flex flex-col items-center gap-1 transition ${activeTab === "services" ? "text-black" : "text-[#717171] hover:text-neutral-900"}`}
      >
        <span className="text-xl">🛎️</span>
        <span className={`relative pb-1 ${activeTab === "services" ? "font-semibold" : ""}`}>
          Services
          {activeTab === "services" && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-black rounded-full" />}
        </span>
      </button>
    </div>
  );
}
