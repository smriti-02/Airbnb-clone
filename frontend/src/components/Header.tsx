"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Globe, Menu, UserCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function Header() {
  const { user, users, login, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[color:var(--color-airbnb-border)]">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0 py-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 cursor-pointer text-[color:var(--color-airbnb-primary)]">
            <svg viewBox="0 0 1000 1000" fill="currentColor" className="w-8 h-8 md:w-10 md:h-10">
              <path d="M499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-27 45-40 80-40s62 13 80 40c17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43c-7 47-39 86-83 105-85 37-169.1-22-241.1-102 119.1-149.1 141.1-265.1 90-340.2-30-43-73-64-128.1-64-55 0-98 21-128.1 64-51 75.1-29 191.1 90 340.2-72 80-156.1 139-241.1 102-44-19-76-58-83-105-9-58 14-118 72-177.1 27.1-28.1 62.1-59.1 103.1-91.1 25.1-20.1 53.1-39.1 84.1-55.1 24-12 51-24 81-34 9-3 19-6 29-9l34-9c17-4 35-7 55-9 11-1 22-2 34-2 12 0 23 1 34 2 20 2 38 5 55 9l34 9c10 3 20 6 29 9 30 10 57 22 81 34 31 16 59 35 84.1 55.1 41 32 76 63 103.1 91.1 58 59.1 81 119.1 72 177.1z"></path>
            </svg>
            <span className="hidden lg:block font-bold text-xl tracking-tight">airbnb</span>
          </Link>

          {/* Search Pill */}
          <div className="flex-1 md:flex-none flex items-center justify-center">
            <div className="border border-[color:var(--color-airbnb-border)] w-full md:w-auto py-2 rounded-full shadow-[var(--shadow-airbnb)] hover:shadow-[var(--shadow-airbnb-hover)] transition cursor-pointer flex items-center justify-between md:justify-start">
              <div className="text-sm font-semibold px-4 md:px-6">Anywhere</div>
              <div className="hidden sm:block text-sm font-semibold px-6 border-x border-[color:var(--color-airbnb-border)]">
                Any week
              </div>
              <div className="text-sm pl-4 pr-2 text-[color:var(--color-airbnb-secondary)] flex items-center gap-3">
                <div className="hidden sm:block">Add guests</div>
                <div className="p-2 bg-[color:var(--color-airbnb-primary)] rounded-full text-white">
                  <Search size={14} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative flex items-center gap-1 md:gap-3">
            <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer">
              Airbnb your home
            </div>
            <div className="hidden md:flex p-3 rounded-full hover:bg-neutral-100 transition cursor-pointer items-center justify-center">
              <Globe size={18} />
            </div>

            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 md:py-2 md:px-2 border border-[color:var(--color-airbnb-border)] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
            >
              <Menu size={18} className="ml-2 hidden md:block" />
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-7 h-7 md:w-8 md:h-8 rounded-full" />
              ) : (
                <UserCircle size={28} className="text-neutral-500" />
              )}
            </div>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute rounded-xl shadow-[var(--shadow-airbnb-hover)] w-[250px] bg-white overflow-hidden right-0 top-14 text-sm flex flex-col cursor-pointer border border-[color:var(--color-airbnb-border)]">
                <div className="px-4 py-3 border-b border-[color:var(--color-airbnb-border)]">
                  <p className="font-semibold">{user ? user.name : "Not logged in"}</p>
                  <p className="text-[color:var(--color-airbnb-secondary)] text-xs">{user?.is_host ? "Host Account" : "Guest Account"}</p>
                </div>
                
                <div className="py-2">
                  <div className="px-4 py-3 hover:bg-neutral-100 transition font-semibold">Trips</div>
                  <div className="px-4 py-3 hover:bg-neutral-100 transition font-semibold">Wishlists</div>
                  <hr className="my-2 border-[color:var(--color-airbnb-border)]" />
                  <div className="px-4 py-3 hover:bg-neutral-100 transition">Airbnb your home</div>
                  <div className="px-4 py-3 hover:bg-neutral-100 transition">Help</div>
                  
                  <hr className="my-2 border-[color:var(--color-airbnb-border)]" />
                  <div className="px-4 py-2 text-xs font-bold text-[color:var(--color-airbnb-secondary)] uppercase">Switch User (Mock Auth)</div>
                  {users.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => { login(u); setIsMenuOpen(false); }}
                      className={`px-4 py-2 hover:bg-neutral-100 transition ${user?.id === u.id ? 'bg-neutral-50 font-semibold' : ''}`}
                    >
                      Log in as {u.name} ({u.is_host ? 'Host' : 'Guest'})
                    </div>
                  ))}
                  <div onClick={logout} className="px-4 py-3 hover:bg-neutral-100 transition text-[color:var(--color-airbnb-primary)]">Log out</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
