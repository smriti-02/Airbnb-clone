"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import HostLogo from "@/components/Host/HostLogo";
import HostMenuButton from "@/components/Host/HostMenuButton";
import { useUserSwitchRedirect } from "@/lib/useUserSwitchRedirect";
import { Check } from "lucide-react";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const { user, users, login, logout, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { handleSwitch } = useUserSwitchRedirect();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setHydrated(true);
      if (!user) {
        router.replace("/become-a-host/signup");
      } else if (!user.is_host) {
        router.replace("/become-a-host");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    let interval: any;
    const fetchCount = async () => {
      if (!user || !user.is_host) return;
      try {
        const { fetchUnreadCount } = await import("@/lib/messagesApi");
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

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="hidden md:flex items-center justify-between h-20 px-8 bg-white border-b"></header>
        <div className="p-12 animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!user || !user.is_host) return null;

  const tabs = [
    { name: "Today", path: "/host", icon: "🏠" },
    { name: "Calendar", path: "/host/calendar", icon: "📅" },
    { name: "Listings", path: "/host/listings", icon: "📋" },
    { name: "Messages", path: "/host/messages", icon: "✉️" }
  ];

  const handleLogout = () => {
    logout();
    handleSwitch(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between h-20 px-8 bg-white border-b sticky top-0 z-40">
        <div className="w-40">
          <HostLogo />
        </div>
        
        <nav className="flex h-full gap-8">
          {tabs.map(tab => (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`flex items-center h-full px-2 font-semibold relative text-gray-500 hover:text-black transition ${pathname === tab.path ? "text-black" : ""}`}
            >
              {tab.name}
              {tab.name === "Messages" && unreadCount > 0 && (
                <div className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
              {pathname === tab.path && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>}
            </Link>
          ))}
        </nav>
        
        <div className="w-40 flex justify-end gap-3 items-center">
          <HostMenuButton onOpenProfile={() => setProfileModal(true)} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0" key={user.id}>
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center z-40 pb-safe">
        {tabs.map(tab => (
          <Link key={tab.path} href={tab.path} className={`flex flex-col items-center gap-1 relative ${pathname === tab.path ? "text-red-500" : "text-gray-500"}`}>
            <span className="text-xl relative">
              {tab.icon}
              {tab.name === "Messages" && unreadCount > 0 && (
                <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </span>
            <span className="text-[10px] font-semibold">{tab.name}</span>
          </Link>
        ))}
      </nav>

      {/* Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setProfileModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Profile</h2>
              <button onClick={() => setProfileModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border mb-4">
                {user.avatar_url && <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <h3 className="text-xl font-bold">{user.name}</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Phone</span>
                {/* @ts-ignore */}
                <span>{user.phone || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
