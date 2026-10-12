"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const demonstrationData = [
  { periode: "Jan", activites: 8 },
  { periode: "Fév", activites: 11 },
  { periode: "Mar", activites: 9 },
  { periode: "Avr", activites: 14 },
  { periode: "Mai", activites: 12 },
  { periode: "Juin", activites: 17 },
];

export function RapportGraphique() {
  return (
    <section className="mt-10 rounded-3xl border border-ink/[0.07] bg-white p-5 shadow-[0_10px_36px_rgba(23,45,78,0.055)] sm:p-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-forest">Aperçu du tableau de bord</p>
          <h2 className="mt-2 font-display text-lg font-bold text-ink">Activités par période</h2>
        </div>
        <p className="text-[11px] text-ink/45">Données fictives de démonstration</p>
      </div>
      <div className="mt-6 h-[240px] w-full">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={demonstrationData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4e9c76" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4e9c76" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(23,45,78,0.08)" strokeDasharray="3 5" vertical={false} />
            <XAxis axisLine={false} dataKey="periode" tick={{ fill: "#758092", fontSize: 11 }} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tick={{ fill: "#758092", fontSize: 11 }} tickLine={false} />
            <Tooltip
              contentStyle={{ border: "1px solid rgba(23,45,78,.08)", borderRadius: 12, fontSize: 12 }}
              formatter={(value) => [`${value} activités`, "Volume"]}
            />
            <Area dataKey="activites" fill="url(#activityFill)" stroke="#367a5d" strokeWidth={2.5} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
