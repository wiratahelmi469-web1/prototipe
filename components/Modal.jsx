// SECTION: Custom Reusable Modal Component
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden" id="custom-modal-overlay">
      {/* Background Mask */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        id="modal-backdrop-mask"
      />

      {/* Modal Card Pane */}
      <div
        className="relative bg-white w-full sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-slide-in overflow-hidden border border-slate-100"
        id="custom-modal-panel"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150 bg-slate-50">
          <h3 className="font-bold text-slate-950 text-base md:text-lg tracking-tight select-none truncate pr-4">
            {title || "Konfirmasi"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            id="modal-btn-close"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content viewport */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-700 leading-normal" id="modal-children-viewport">
          {children}
        </div>
      </div>
    </div>
  );
}
