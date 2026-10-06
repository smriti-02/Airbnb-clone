"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_host: boolean;
}

interface UserContextType {
  user: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch available users for the switcher
    const fetchUsers = async () => {
      try {
        const data = await apiFetch<User[]>("/users");
        setUsers(data);
        
        // Restore session
        const stored = localStorage.getItem("airbnb_user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else if (data.length > 0) {
          // Default to first user if none selected
          setUser(data[0]);
          localStorage.setItem("airbnb_user", JSON.stringify(data[0]));
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("airbnb_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("airbnb_user");
  };

  return (
    <UserContext.Provider value={{ user, users, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
