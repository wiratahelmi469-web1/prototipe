// SECTION: Authentication Hook
"use client";

import { useState, useEffect } from "react";
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from "@/lib/localStorage";
import { DEMO_ACCOUNTS } from "@/lib/constants";

const setCookie = (name, value, days = 7) => {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + expires + "; path=/; SameSite=Lax";
};

const eraseCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
};

export default function useAuth() {
  const [user, setUser] = useState(() => getLocalStorageItem("currentUser", null));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optional: listen to storage changes across tabs
    const handleStorageChange = () => {
      setUser(getLocalStorageItem("currentUser", null));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (email, password) => {
    // Get all registered users from localStorage + DEMO_ACCOUNTS
    const registeredUsers = getLocalStorageItem("registeredUsers", []);
    const allUsers = [...DEMO_ACCOUNTS, ...registeredUsers];

    const foundUser = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const sessionUser = {
        id: foundUser.id,
        email: foundUser.email,
        nama: foundUser.namaLengkap || foundUser.nama,
        role: foundUser.role,
        nimNip: foundUser.nimNip || "",
        isLoggedIn: true,
      };
      setLocalStorageItem("currentUser", sessionUser);
      setCookie("currentUser", sessionUser, 7);
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    }

    return { success: false, error: "Email atau kata sandi salah" };
  };

  const loginAsGuest = () => {
    const guestUser = {
      role: "guest",
      nama: "Tamu",
      email: "guest@nurulfikri.ac.id",
      nimNip: "GUEST01",
      isLoggedIn: true,
    };
    setLocalStorageItem("currentUser", guestUser);
    setCookie("currentUser", guestUser, 7);
    setUser(guestUser);
    return guestUser;
  };

  const register = (userData) => {
    const registeredUsers = getLocalStorageItem("registeredUsers", []);
    
    // Check if email already registered
    const emailExists = [...DEMO_ACCOUNTS, ...registeredUsers].some(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (emailExists) {
      return { success: false, error: "Email sudah terdaftar!" };
    }

    const newUser = {
      id: "MHS-" + Date.now(),
      namaLengkap: userData.namaLengkap,
      email: userData.email,
      password: userData.password,
      role: userData.role, // "mahasiswa" or "staf"
      nimNip: userData.nimNip || "",
      tanggalDaftar: new Date().toISOString().split("T")[0],
    };

    const updatedList = [...registeredUsers, newUser];
    setLocalStorageItem("registeredUsers", updatedList);
    return { success: true };
  };

  const logout = () => {
    removeLocalStorageItem("currentUser");
    eraseCookie("currentUser");
    setUser(null);
  };

  const updateProfile = (updatedProfile) => {
    if (!user) return { success: false, error: "Tidak ada session aktif" };

    const newSession = { ...user, ...updatedProfile };
    setLocalStorageItem("currentUser", newSession);
    setCookie("currentUser", newSession, 7);
    setUser(newSession);

    // Update in registeredUsers
    const registeredUsers = getLocalStorageItem("registeredUsers", []);
    const userIndex = registeredUsers.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      registeredUsers[userIndex] = {
        ...registeredUsers[userIndex],
        namaLengkap: updatedProfile.nama || registeredUsers[userIndex].namaLengkap,
        nimNip: updatedProfile.nimNip || registeredUsers[userIndex].nimNip,
      };
      setLocalStorageItem("registeredUsers", registeredUsers);
    }
    return { success: true };
  };

  return {
    user,
    loading,
    login,
    loginAsGuest,
    register,
    logout,
    updateProfile,
  };
}
