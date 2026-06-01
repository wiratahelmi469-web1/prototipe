// SECTION: Global Toast Component
"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleAddToast = (e) => {
      const { id, message, type } = e.detail;

      setToasts((prev) => {
        // Keep maximum of 3 toasts
        const current = [...prev, { id, message, type }];
        if (current.length > 3) {
          return current.slice(current.length - 3);
        }
        return current;
      });

      // Simple auto-dismiss tracker
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    };

    window.addEventListener("app-toast", handleAddToast);
    return () => window.removeEventListener("app-toast", handleAddToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full font-sans">
      {toasts.map((toast) => {
        const { id, message, type } = toast;

        let bgColor = "bg-white border-slate-200 text-slate-800";
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (type === "success") {
          bgColor = "bg-emerald-50 border-emerald-200 text-emerald-900";
          icon = <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
        } else if (type === "error") {
          bgColor = "bg-red-50 border-red-200 text-red-950";
          icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
        } else if (type === "warning") {
          bgColor = "bg-amber-50 border-amber-200 text-amber-900";
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        } else if (type === "info") {
          bgColor = "bg-blue-50 border-blue-200 text-blue-950";
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
        }

        return (
          <div
            key={id}
            id={`toast-${id}`}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in duration-200 ${bgColor}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-5">{message}</div>
            <button
              onClick={() => removeToast(id)}
              className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
              id={`close-toast-${id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
