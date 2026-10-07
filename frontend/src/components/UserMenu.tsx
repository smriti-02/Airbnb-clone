"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Menu, UserCircle, Heart, Luggage, MessageSquare, CircleUser, Bell, HelpCircle, Check, LogOut, LayoutDashboard, PlusCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal, Button } from "./UI";
import SafeImage from "./SafeImage";
import { formatDateShort } from "@/lib/format";
import { useUserSwitchRedirect } from "@/lib/useUserSwitchRedirect";
import { fetchUnreadCount } from "@/lib/messagesApi";

export default function UserMenu() {
  const { user, users, login, logout } = useUser();
  const router = useRouter();
  const { handleSwitch } = useUserSwitchRedirect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [comingSoonModal, setComingSoonModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let interval: any;
    const fetchCount = async () => {
      if (!user) { setUnreadCount(0); return; }
      try {
        const data = await fetchUnreadCount(user.id);
        setUnreadCount(data.count || 0);
      } catch (e) {}
    };

    const handleVis = () => {
      if (document.hidden) clearInterval(interval);
      else {
        fetchCount();
        interval = setInterval(fetchCount, 10000);
      }
    };
    
    fetchCount();
    interval = setInterval(fetchCount, 10000);
    document.addEventListener("visibilitychange", handleVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  };

  const handleAction = (action: () => void) => {
    closeMenu();
    action();
  };

  const MenuItem = ({ icon: Icon, text, onClick, bold = false, badgeCount = 0 }: any) => (
    <div 
      onClick={() => handleAction(onClick)}
      role="menuitem"
      className={`flex items-center gap-[12px] h-[44px] px-[16px] cursor-pointer hover:bg-[#F7F7F7] transition-colors text-[14px] justify-between ${bold ? 'font-medium' : ''}`}
    >
      <div className="flex items-center gap-[12px]">
        <Icon size={20} className="text-neutral-700 stroke-[1.5]" />
        <span>{text}</span>
      </div>
      {badgeCount > 0 && (
        <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badgeCount > 99 ? '99+' : badgeCount}
        </div>
      )}
    </div>
  );

  const Divider = () => <div className="h-[1px] bg-[#DDDDDD] my-[8px]" />;

  return (
    <div className="relative flex items-center gap-1 md:gap-3 z-50">
      <div className="hidden md:block text-sm font-semibold py-2 px-4 rounded-full hover:bg-[#F8F8F8] transition cursor-pointer" onClick={() => router.push(user?.is_host ? "/host" : "/become-a-host")}>
        {user?.is_host ? "Switch to hosting" : "Become a host"}
      </div>
      
      <div 
        className="hidden md:flex w-10 h-10 rounded-full hover:bg-neutral-100 bg-[#F2F2F2] transition cursor-pointer items-center justify-center text-neutral-600"
      >
        <Globe size={18} />
      </div>

      <div 
        ref={triggerRef}
        onClick={toggleMenu}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMenu(); } }}
        className="w-10 h-10 md:w-auto md:px-2 md:py-1 bg-[#F2F2F2] border border-[#DDD] md:border-transparent flex flex-row items-center justify-center gap-2 rounded-full cursor-pointer hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-black"
      >
        <Menu size={18} className="hidden md:block text-neutral-600" />
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <UserCircle size={24} className="text-neutral-500" />
        )}
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          role="menu"
          className="absolute w-[280px] bg-white right-0 top-[52px] flex flex-col py-[8px] rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.12)] border border-[#DDD] border-opacity-50 overflow-y-auto"
          style={{ 
            maxHeight: "calc(100vh - 100px)",
            transformOrigin: "top right",
            animation: "menu-appear 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          {user ? (
            <>
              {/* Group 0: Identity */}
              <div className="px-[16px] py-[8px] flex flex-col cursor-default">
                <span className="text-[14px] font-semibold">{user.name}</span>
                <span className="text-[12px] text-[#717171]">{user.is_host ? "Host account" : "Guest account"}</span>
              </div>
              <Divider />
              
              {/* Group 1 */}
              <MenuItem icon={Heart} text="Wishlists" bold onClick={() => router.push('/wishlists')} />
              <MenuItem icon={Luggage} text="Trips" bold onClick={() => router.push('/trips')} />
              <MenuItem icon={MessageSquare} text="Messages" bold badgeCount={unreadCount} onClick={() => router.push('/messages')} />
              <MenuItem icon={CircleUser} text="Profile" bold onClick={() => setProfileModal(true)} />
              <Divider />

              {/* Group 2 */}
              {user.is_host && <MenuItem icon={LayoutDashboard} text="Host dashboard" onClick={() => router.push('/host')} />}
              <MenuItem icon={Bell} text="Notifications" onClick={() => setComingSoonModal(true)} />
              <MenuItem icon={HelpCircle} text="Help Centre" onClick={() => setComingSoonModal(true)} />
              <Divider />

              {/* Group 3: Become a host card (if not host) */}
              {!user.is_host && (
                <>
                  <div 
                    onClick={() => handleAction(() => router.push('/become-a-host'))}
                    className="mx-[16px] my-[4px] p-[16px] bg-white border border-[#DDD] rounded-[12px] flex items-center justify-between cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex flex-col gap-[4px] pr-4">
                      <span className="text-[14px] font-semibold">Become a host</span>
                      <span className="text-[12px] text-[#717171] leading-tight">It's easy to start hosting and earn extra income.</span>
                    </div>
                    <div className="w-[48px] h-[48px] bg-red-50 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xl">🏠</span>
                    </div>
                  </div>
                  <Divider />
                </>
              )}

              {/* Group 4 */}
              <MenuItem icon={PlusCircle} text="Refer a host" onClick={() => setComingSoonModal(true)} />
              <MenuItem icon={UserCircle} text="Find a co-host" onClick={() => setComingSoonModal(true)} />
              <Divider />
            </>
          ) : (
             <div className="px-[16px] py-[8px] flex flex-col cursor-default">
                <span className="text-[14px] font-semibold">Not logged in</span>
                <span className="text-[12px] text-[#717171]">Please select a demo user below</span>
             </div>
          )}

          {/* Group 5: Switch User Demo */}
          <div className="px-[16px] py-[8px]">
            <span className="text-[11px] font-bold text-[#717171] uppercase tracking-wider">Switch User (Demo)</span>
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {users.map(u => (
              <div 
                key={u.id}
                role="menuitem"
                onClick={() => handleAction(() => { login(u); handleSwitch(u); })}
                className="flex items-center gap-[12px] h-[44px] px-[16px] cursor-pointer hover:bg-[#F7F7F7] transition"
              >
                <SafeImage src={u.avatar_url} alt={u.name} className="w-[24px] h-[24px] rounded-full object-cover shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-[14px]">{u.name}</span>
                  <span className="text-[12px] text-[#717171] ml-2">({u.is_host ? 'Host' : 'Guest'})</span>
                </div>
                {user?.id === u.id && <Check size={16} className="text-black shrink-0" />}
              </div>
            ))}
          </div>

          {user && (
            <>
              <Divider />
              <MenuItem icon={LogOut} text="Log out" onClick={() => { logout(); handleSwitch(null); }} />
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={comingSoonModal} onClose={() => setComingSoonModal(false)} title="Feature Not Available">
        <div className="flex flex-col gap-4 text-center py-6">
          <div className="mx-auto bg-neutral-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-xl font-bold">Coming Soon</h2>
          <p className="text-neutral-500">This feature is part of a future update and is not yet available in the demo.</p>
          <Button primary className="mt-4" onClick={() => setComingSoonModal(false)}>Got it</Button>
        </div>
      </Modal>

      {user && (
        <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="Your Profile">
          <div className="flex flex-col gap-6 py-4">
            <div className="flex gap-6 items-center">
              <SafeImage src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full object-cover shadow-sm" />
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <span className="text-neutral-500">{user.is_host ? "Host" : "Guest"}</span>
              </div>
            </div>
            
            <div className="border border-[#DDD] rounded-xl p-4 flex flex-col gap-4">
              <div>
                <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Email</div>
                <div>{user.email}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Joined</div>
                {/* @ts-ignore */}
                <div>{formatDateShort(user.joined_at)}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">About</div>
                {/* @ts-ignore */}
                <div className="whitespace-pre-wrap">{user.bio || "No bio provided."}</div>
              </div>
            </div>
          </div>
        </Modal>
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
