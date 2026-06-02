"use client";

import { useAuth } from "../context/AuthContext";

export function useCurrentUser() {
  const { userValue, loadingValue } = useAuthState();
  return {
    user: userValue,
    loading: loadingValue,
    isAuthenticated: !!userValue,
  };
}

function useAuthState() {
  const auth = useAuth();
  return {
    userValue: auth?.user ? {
      name: auth.user.name,
      email: auth.user.email,
      role: auth.user.role,
    } : null,
    loadingValue: auth?.loading ?? false
  };
}
