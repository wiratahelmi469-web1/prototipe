"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserSessionData {
  isLoggedIn: boolean;
  email: string;
  name: string;
  role: "po" | "panitia" | "mahasiswa" | "staff" | "guest";
}

interface AuthContextType {
  user: UserSessionData | null;
  loading: boolean;
  login: (email: string, role: string, name?: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (name: string, email: string, role: string) => Promise<boolean>;
  registeredUsers: { name: string; email: string; role: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_USERS = [
  { name: "Andi Saputra (Panitia)", email: "panitia@nurulfikri.ac.id", role: "panitia", password: "panitia123" },
  { name: "Rudi Hartono (PO)", email: "po@nurulfikri.ac.id", role: "po", password: "po123" },
  { name: "Ahmad Junaidi (Mhs)", email: "mahasiswa@nurulfikri.ac.id", role: "mahasiswa", password: "mhs123" },
  { name: "Staf Kemahasiswaan", email: "staff@nurulfikri.ac.id", role: "staff", password: "staff123" }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<{ name: string; email: string; role: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Sync login state
    const savedAuth = localStorage.getItem("eventhub_auth");
    if (savedAuth) {
      try {
        setUser(JSON.parse(savedAuth));
      } catch (err) {
        localStorage.removeItem("eventhub_auth");
      }
    }

    // Sync registered list
    const savedUsers = localStorage.getItem("eventhub_registered_users");
    if (savedUsers) {
      try {
        setRegisteredUsers(JSON.parse(savedUsers));
      } catch (err) {
        setRegisteredUsers([]);
      }
    } else {
      const initialStore = DEFAULT_USERS.map(({ name, email, role }) => ({ name, email, role }));
      localStorage.setItem("eventhub_registered_users", JSON.stringify(initialStore));
      setRegisteredUsers(initialStore);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, role: string, name?: string): Promise<boolean> => {
    const activeUser: UserSessionData = {
      isLoggedIn: true,
      email: email.toLowerCase().trim(),
      name: name || email.split("@")[0],
      role: role.toLowerCase() as any
    };

    localStorage.setItem("eventhub_auth", JSON.stringify(activeUser));
    setUser(activeUser);

    // Dynamic redirect after state flush
    setTimeout(() => {
      if (activeUser.role === "staff") {
        router.push("/dashboard/staff");
      } else {
        router.push(`/dashboard/${activeUser.role}`);
      }
    }, 100);

    return true;
  };

  const logout = () => {
    localStorage.removeItem("eventhub_auth");
    setUser(null);
    router.push("/login");
  };

  const registerUser = async (name: string, email: string, role: string): Promise<boolean> => {
    const newUser = {
      name,
      email: email.toLowerCase().trim(),
      role: role.toLowerCase()
    };

    const updated = [...registeredUsers, newUser];
    localStorage.setItem("eventhub_registered_users", JSON.stringify(updated));
    setRegisteredUsers(updated);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser, registeredUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
