"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthData = { month: string; tornei: number; partecipazioni: number; partite: number };

export function ParticipationChart({ data }: { data: MonthData[] }) {
  const formatted = data.map((row) => ({ ...row, label: new Intl.DateTimeFormat("it-IT", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${row.month}-01T00:00:00Z`)) }));
  return (
    <div>
      <div className="h-[340px] w-full" role="img" aria-label="Grafico delle partecipazioni mensili ai tornei">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 15, right: 8, left: -20, bottom: 0 }}>
            <defs><linearGradient id="participation" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6138" stopOpacity={0.7}/><stop offset="100%" stopColor="#ff6138" stopOpacity={0.05}/></linearGradient></defs>
            <CartesianGrid stroke="#17231e" strokeOpacity={0.14} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#17231e", fontSize: 12 }} axisLine={{ stroke: "#17231e" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#17231e", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#f5f1e8", border: "1.5px solid #17231e", borderRadius: 12 }} />
            <Area type="monotone" dataKey="partecipazioni" name="Partecipazioni" stroke="#075f52" strokeWidth={3} fill="url(#participation)" activeDot={{ r: 6, fill: "#dcef67", stroke: "#17231e" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-4"><summary className="cursor-pointer font-bold">Mostra i dati del grafico in tabella</summary><div className="table-wrap mt-3"><table><thead><tr><th>Mese</th><th>Tornei</th><th>Partecipazioni</th><th>Partite</th></tr></thead><tbody>{data.map((row) => <tr key={row.month}><td>{row.month}</td><td>{row.tornei}</td><td>{row.partecipazioni}</td><td>{row.partite}</td></tr>)}</tbody></table></div></details>
    </div>
  );
}
