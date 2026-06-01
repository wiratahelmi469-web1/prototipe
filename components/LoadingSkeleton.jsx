// SECTION: UI Pulsing Loader Skeletons Component
"use client";

export function EventSkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-[360px] animate-pulse flex flex-col justify-between">
      <div className="h-32 bg-slate-200" />
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
          <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
          <div className="h-3 bg-slate-200 rounded-lg w-5/6" />
        </div>
        <div>
          <div className="h-2 bg-slate-200 rounded-lg w-1/3 mb-2" />
          <div className="h-2 bg-slate-200 rounded-lg w-full" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
          <div className="h-9 bg-slate-200 rounded-xl" />
          <div className="h-9 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = "cardGrid", count = 3 }) {
  if (type === "cardGrid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <EventSkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded-lg w-2/5" />
            <div className="h-3 bg-slate-200 rounded-lg w-1/5" />
          </div>
          <div className="h-7 bg-slate-200 rounded-lg w-20" />
        </div>
      ))}
    </div>
  );
}
