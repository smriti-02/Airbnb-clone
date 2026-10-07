"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Check } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useUserSwitchRedirect } from "@/lib/useUserSwitchRedirect";

export default function HostMenuButton({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { user, users, login, logout } = useUser();
  const { handleSwitch } = useUserSwitchRedirect();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleAction = (action: () => void) => {
    closeMenu();
    action();
  };

  const Divider = () => <div className="h-[1px] bg-[#DDDDDD] my-[8px]" />;

  return (
    <div className="relative flex items-center z-50">
      <div
        ref={triggerRef}
        onClick={toggleMenu}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMenu(); } }}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        role="button"
        className={`h-[42px] px-2 py-1 bg-white border ${isOpen ? 'border-gray-500 shadow-md' : 'border-[#DDDDDD]'} flex flex-row items-center justify-center gap-2 rounded-full cursor-pointer hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-black`}
      >
        <Menu size={18} className="text-neutral-600 ml-1" />
        <div className="w-[30px] h-[30px] rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-500">
          {user?.avatar_url ? (
            <img src={user?.avatar_url} alt={user?.name || "Avatar"} className="w-full h-full object-cover" title={user?.name} />
          ) : (
             <span title={user?.name}>{user?.name?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
      </div>

      {isOpen && (
        <div 
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-[52px] w-[280px] bg-white rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.12)] py-[8px] border border-[#DDD] border-opacity-50 z-50"
          style={{ 
            animation: "menu-appear 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            transformOrigin: "top right"
          }}
        >
          <div className="px-[16px] py-[8px] flex flex-col cursor-default">
            <span className="text-[14px] font-semibold">{user?.name}</span>
            <span className="text-[12px] text-[#717171]">Host account</span>
          </div>
          <Divider />
          
          <div role="menuitem" onClick={() => handleAction(() => router.push('/host/earnings'))} className="px-[16px] h-[44px] flex items-center cursor-pointer hover:bg-[#F7F7F7] transition text-[14px]">Earnings</div>
          <div role="menuitem" onClick={() => handleAction(() => router.push('/host/reservations'))} className="px-[16px] h-[44px] flex items-center cursor-pointer hover:bg-[#F7F7F7] transition text-[14px]">Reservations</div>
          <div role="menuitem" onClick={() => handleAction(onOpenProfile)} className="px-[16px] h-[44px] flex items-center cursor-pointer hover:bg-[#F7F7F7] transition text-[14px]">Profile</div>
          
          <Divider />
          <div role="menuitem" onClick={() => handleAction(() => router.push('/'))} className="px-[16px] h-[44px] flex items-center cursor-pointer hover:bg-[#F7F7F7] transition text-[14px]">Switch to travelling</div>
          
          <Divider />
          <div className="px-[16px] py-[8px]">
            <span className="text-[11px] font-bold text-[#717171] uppercase tracking-wider">Switch User (Demo)</span>
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {users.map((u: any) => (
              <div 
                key={u.id}
                role="menuitem"
                onClick={() => handleAction(() => { login(u); handleSwitch(u); })}
                className="flex items-center gap-[12px] h-[44px] px-[16px] cursor-pointer hover:bg-[#F7F7F7] transition"
              >
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-[24px] h-[24px] rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-[24px] h-[24px] rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="flex-1 truncate">
                  <span className="text-[14px]">{u.name}</span>
                  <span className="text-[12px] text-[#717171] ml-2">({u.is_host ? 'Host' : 'Guest'})</span>
                </div>
                {user?.id === u.id && <Check size={16} className="text-black shrink-0" />}
              </div>
            ))}
          </div>

          <Divider />
          <div role="menuitem" onClick={() => handleAction(() => { logout(); handleSwitch(null); })} className="px-[16px] h-[44px] flex items-center cursor-pointer hover:bg-[#F7F7F7] transition text-[14px]">Log out</div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes menu-appear {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .menu-appear { animation: none !important; }
        }
      `}} />
    </div>
  );
}
