// SECTION: Metrics Statistic Display Card
"use client";

export default function StatsCard({ title, value, icon: Ikon, colorClass = "bg-blue-50 text-blue-600" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md duration-200">
      <div className={`p-3.5 rounded-xl ${colorClass} shrink-0`}>
        {Ikon && <Ikon className="w-5 h-5 md:w-6 md:h-6" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium tracking-tight mb-0.5 uppercase">{title}</p>
        <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
          {value !== undefined ? value : "0"}
        </p>
      </div>
    </div>
  );
}
