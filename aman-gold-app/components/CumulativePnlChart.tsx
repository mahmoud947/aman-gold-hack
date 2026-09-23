"use client";
import { useRef, useState } from "react";
import { egp2, signedEgp } from "../utils/format";

interface P { key: string; ts: number; daily: number; cum: number }
const NICE = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000];

/** Cumulative realized P&L line chart. Values come from the same daily figures shown in the Daily P&L calendar. */
export default function CumulativePnlChart({ points }: { points: P[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const W = 340, H = 190, L = 40, R = 8, T = 10, B = 30;
  const vals = points.map((p) => p.cum);
  const hi = Math.max(0, ...vals), lo = Math.min(0, ...vals);
  const span = Math.max(hi - lo, 1);
  const step = NICE.find((s) => span / s <= 5) ?? 100000;
  const top = Math.ceil(hi / step) * step, bottom = Math.floor(lo / step) * step || (lo < 0 ? -step : 0);
  const ticks: number[] = [];
  for (let v = bottom; v <= top + 1e-9; v += step) ticks.push(v);
  const x = (i: number) => L + (i / Math.max(1, points.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - bottom) / Math.max(top - bottom, 1)) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.cum).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const idx = hover ?? points.length - 1;
  const cur = points[idx];
  const md = (ts: number) => { const d = new Date(ts); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const onMove = (cx: number) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const rel = ((cx - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(((rel - L) / (W - L - R)) * (points.length - 1)))));
  };
  const up = last.cum >= 0;
  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className={`text-[20px] font-extrabold ${cur.cum > 0.005 ? "text-good" : cur.cum < -0.005 ? "text-bad" : ""}`}>{signedEgp(cur.cum, 2)}</div>
          <div className="text-[11px] text-navy/50">{hover === null ? "Cumulative realized P&L, last 30 days" : `${md(cur.ts)} · that day ${signedEgp(cur.daily, 2)}`}</div>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${up ? "bg-green-100 text-good" : "bg-red-100 text-bad"}`}>{md(points[0].ts)} → {md(last.ts)}</div>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" onMouseMove={(e) => onMove(e.clientX)} onMouseLeave={() => setHover(null)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)} onTouchEnd={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#1e2b4a" strokeOpacity={t === 0 ? 0.35 : 0.1} />
            <text x={L - 5} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#1e2b4a" fillOpacity=".55">{t.toLocaleString("en-US")}</text>
          </g>
        ))}
        {points.map((p, i) => (i % 4 === 0 || i === points.length - 1) && (
          <text key={p.key} x={x(i)} y={H - 10} textAnchor="middle" fontSize="9" fill="#1e2b4a" fillOpacity=".55">{md(p.ts)}</text>
        ))}
        <path d={line} fill="none" stroke="#04768d" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && <line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke="#1e2b4a" strokeOpacity=".25" strokeDasharray="3 3" />}
        <circle cx={x(idx)} cy={y(cur.cum)} r="4" fill="#04768d" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="mt-1 text-[11px] text-navy/45">{egp2(Math.abs(cur.cum))} {cur.cum >= 0 ? "profit" : "loss"} booked from sales in this period. Matches the Daily P&L calendar.</div>
    </div>
  );
}
