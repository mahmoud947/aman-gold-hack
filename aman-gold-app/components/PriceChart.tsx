"use client";
import { useMemo, useRef, useState } from "react";
import { getHistoricalGoldPrices } from "../services/pricing";
import { useStore } from "../services/store";
import type { Range } from "../types";
import { dateTime, egp, pct } from "../utils/format";

const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y"];

export default function PriceChart() {
  const { version } = useStore();
  const [range, setRange] = useState<Range>("1D");
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  // Data comes only from the pricing service (mock today, provider API later).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pts = useMemo(() => getHistoricalGoldPrices(range), [range, version]);
  const W = 340, H = 150, pad = 6;
  const ps = pts.map((p) => p.p);
  const hi = Math.max(...ps), lo = Math.min(...ps);
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i / (pts.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / span) * (H - pad * 2);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.p).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1)},${H} L${x(0)},${H} Z`;
  const first = pts[0].p, last = pts[pts.length - 1].p;
  const change = ((last - first) / first) * 100;
  const up = change >= 0;
  const colour = up ? "#15803d" : "#dc2626";
  const idx = hover ?? pts.length - 1;
  const cur = pts[idx];

  const onMove = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const rel = (clientX - r.left) / r.width;
    setHover(Math.max(0, Math.min(pts.length - 1, Math.round(rel * (pts.length - 1)))));
  };

  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className="text-[22px] font-extrabold">{egp(cur.p, 2)}<span className="ml-1 text-[12px] font-semibold text-navy/50">/ gram</span></div>
          <div className="text-[12px] text-navy/50">{hover === null ? "Mid-market price (simulated)" : dateTime(cur.t)}</div>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${up ? "bg-green-100 text-good" : "bg-red-100 text-bad"}`}>{pct(change)} · {range}</div>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" onMouseMove={(e) => onMove(e.clientX)} onMouseLeave={() => setHover(null)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)} onTouchEnd={() => setHover(null)}>
        <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={colour} stopOpacity=".22" /><stop offset="100%" stopColor={colour} stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#g)" />
        <path d={line} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" />
        <circle cx={x(idx)} cy={y(cur.p)} r="4" fill={colour} stroke="#fff" strokeWidth="2" />
        {hover !== null && <line x1={x(idx)} x2={x(idx)} y1="0" y2={H} stroke="#1e2b4a" strokeOpacity=".2" strokeDasharray="3 3" />}
      </svg>
      <div className="mt-2 flex justify-between text-[12px] text-navy/60">
        <span>Low <b className="text-navy">{egp(lo)}</b></span><span>High <b className="text-navy">{egp(hi)}</b></span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {RANGES.map((r) => (
          <button key={r} onClick={() => { setRange(r); setHover(null); }} className={`flex-1 rounded-full py-1.5 text-[12px] font-bold ${range === r ? "bg-navy text-white" : "bg-canvas text-navy/60"}`}>{r}</button>
        ))}
      </div>
    </div>
  );
}
