// SECTION: Global Toast Trigger Hook
"use client";

export default function useToast() {
  const showToast = (message, type = "success") => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("app-toast", {
        detail: { id: Date.now() + Math.random().toString(36).substr(2, 5), message, type }
      });
      window.dispatchEvent(event);
    }
  };

  return { showToast };
}
