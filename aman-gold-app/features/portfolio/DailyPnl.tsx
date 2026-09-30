"use client";
import { useMemo, useRef, useState } from "react";
import { Button, Card, Row, Screen, Sheet } from "../../components/ui";
import { computeDailyPnl, dayKey, type DayPnl } from "../../services/pnl";
import { useStore } from "../../services/store";
import { dateStr, egp2, gramsTrim, signedEgp, timeStr } from "../../utils/format";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const compact = (n: number) => {
  const a = Math.abs(n), sign = n > 0 ? "+" : n < 0 ? "−" : "";
  if (a >= 100000) return `${sign}${(a / 1000).toFixed(0)}K`;
  if (a >= 10000) return `${sign}${(a / 1000).toFixed(1)}K`;
  return `${sign}${a.toLocaleString("en-US", a < 1000 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 })}`;
};
const tone = (n: number) => (Math.abs(n) < 0.005 ? "flat" : n > 0 ? "up" : "down");
const CELL = { up: "bg-green-50 text-good", down: "bg-red-50 text-bad", flat: "bg-black/5 text-navy/50" };

/** Daily REALIZED P&L calendar. Realized = booked when gold is sold. Today's cell updates live as you trade. */
export default function DailyPnl() {
  const st = useStore();
  const [view, setView] = useState<"calendar" | "bars">("calendar");
  const [sel, setSel] = useState<DayPnl | null>(null);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const pointer = useRef("mouse");
  const lastTap = useRef<number | null>(null);
  const days = useMemo(() => computeDailyPnl(st.txs), [st.txs]);
  const byKey = useMemo(() => new Map(days.map((d) => [d.key, d])), [days]);

  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const first = days[0] ? new Date(days[0].ts) : today;
  const canPrev = ym.y > first.getFullYear() || (ym.y === first.getFullYear() && ym.m > first.getMonth());
  const canNext = ym.y < today.getFullYear() || (ym.y === today.getFullYear() && ym.m < today.getMonth());
  const shift = (d: number) => { setHoverDay(null); lastTap.current = null; setYm(({ y, m }) => { const t = new Date(y, m + d, 1); return { y: t.getFullYear(), m: t.getMonth() }; }); };

  const dim = new Date(ym.y, ym.m + 1, 0).getDate();
  const lead = new Date(ym.y, ym.m, 1).getDay();
  const cells = Array.from({ length: dim }, (_, i) => {
    const key = dayKey(new Date(ym.y, ym.m, i + 1).getTime());
    return { day: i + 1, key, data: byKey.get(key) };
  });
  const monthTotal = cells.reduce((a, c) => a + (c.data?.realized ?? 0), 0);
  const winDays = cells.filter((c) => (c.data?.realized ?? 0) > 0.005).length;
  const lossDays = cells.filter((c) => (c.data?.realized ?? 0) < -0.005).length;
  const maxAbs = Math.max(1, ...cells.map((c) => Math.abs(c.data?.realized ?? 0)));
  const label = new Date(ym.y, ym.m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const isToday = (k: string) => k === dayKey(Date.now());
  const selTxs = sel ? st.txs.filter((t) => sel.txIds.includes(t.id)) : [];
  const hc = hoverDay !== null ? cells[hoverDay] : undefined;
  const hv = hc?.data?.realized ?? 0;

  return (
    <Screen title="Daily P&L">
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-white px-1 py-1 shadow-sm">
            <button disabled={!canPrev} onClick={() => shift(-1)} className="h-8 w-8 rounded-lg text-lg font-bold disabled:opacity-25">‹</button>
            <div className="min-w-[128px] text-center text-[14px] font-bold">{label}</div>
            <button disabled={!canNext} onClick={() => shift(1)} className="h-8 w-8 rounded-lg text-lg font-bold disabled:opacity-25">›</button>
          </div>
          <div className="flex rounded-xl bg-white p-1 text-[12px] font-bold shadow-sm">
            {(["calendar", "bars"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 ${view === v ? "bg-navy text-white" : "text-navy/50"}`}>{v === "calendar" ? "Calendar" : "Bars"}</button>)}
          </div>
        </div>

        <Card>
          <div className="text-[12px] font-semibold text-navy/50">Realized P&L in {label}</div>
          <div className={`text-[24px] font-black ${monthTotal > 0.005 ? "text-good" : monthTotal < -0.005 ? "text-bad" : ""}`}>{signedEgp(monthTotal, 2)}</div>
          <div className="text-[12px] text-navy/50"><span className="font-bold text-good">{winDays}</span> winning days · <span className="font-bold text-bad">{lossDays}</span> losing days</div>
        </Card>

        {days.length === 0 ? (
          <Card><div className="py-6 text-center text-[13px] text-navy/50">Daily P&L appears after your first gold transaction.</div></Card>
        ) : view === "calendar" ? (
          <Card>
            <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-navy/40">{WEEK.map((w, i) => <div key={i}>{w}</div>)}</div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: lead }, (_, i) => <div key={`l${i}`} />)}
              {cells.map((c) => {
                const v = c.data?.realized;
                const cls = v === undefined ? "text-navy/40" : CELL[tone(v)];
                return (
                  <button key={c.key} disabled={!c.data} onClick={() => c.data && setSel(c.data)}
                    className={`flex h-[52px] flex-col items-center justify-center rounded-lg text-center ${cls} ${isToday(c.key) ? "ring-2 ring-aman" : ""} ${c.data ? "" : "cursor-default"}`}>
                    <span className="text-[12px] font-extrabold text-navy">{c.day}</span>
                    {v !== undefined && <span className="mt-0.5 text-[9.5px] font-semibold leading-none">{Math.abs(v) < 0.005 ? "0.00" : compact(v)}</span>}
                  </button>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="relative pt-12" onMouseLeave={() => setHoverDay(null)}>
              {hc && (
                <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1.5 text-center text-white shadow-lg"
                  style={{ left: `${Math.min(84, Math.max(16, ((hoverDay! + 0.5) / cells.length) * 100))}%` }}>
                  <div className="text-[10.5px] text-white/60">{dateStr(new Date(ym.y, ym.m, hc.day).getTime())}</div>
                  <div className={`text-[12.5px] font-extrabold ${hv > 0.005 ? "text-green-300" : hv < -0.005 ? "text-red-300" : ""}`}>
                    {!hc.data ? "No data" : hv > 0.005 ? `Gain ${signedEgp(hv, 2)}` : hv < -0.005 ? `Loss ${signedEgp(hv, 2)}` : "No gain or loss · EGP 0.00"}
                  </div>
                </div>
              )}
              <svg viewBox="0 0 340 170" className="w-full">
                <line x1="0" x2="340" y1="85" y2="85" stroke="#1e2b4a" strokeOpacity=".15" />
                {cells.map((c, i) => {
                  const v = c.data?.realized ?? 0;
                  const h = (Math.abs(v) / maxAbs) * 75;
                  const w = 340 / cells.length;
                  const faded = hoverDay !== null && hoverDay !== i;
                  return (
                    <g key={c.key}>
                      {hoverDay === i && <rect x={i * w} width={w} y="0" height="170" fill="#1e2b4a" fillOpacity=".05" />}
                      <rect x={i * w + 1} width={Math.max(2, w - 2)} y={v >= 0 ? 85 - h : 85} height={Math.max(v === 0 ? 0 : 1, h)} rx="1.5" fill={v >= 0 ? "#15803d" : "#dc2626"} opacity={c.data ? (faded ? 0.45 : 1) : 0.15} />
                      {/* Full-height hit area: small bars are otherwise hard to hover or tap. */}
                      <rect x={i * w} width={w} y="0" height="170" fill="transparent" className="cursor-pointer"
                        onMouseEnter={() => setHoverDay(i)} onPointerDown={(e) => { pointer.current = e.pointerType; }}
                        onClick={() => {
                          // Mouse: click opens the day sheet. Touch: first tap shows the tooltip, a second tap on the same bar opens the sheet.
                          setHoverDay(i);
                          if (c.data && (pointer.current !== "touch" || lastTap.current === i)) setSel(c.data);
                          lastTap.current = i;
                        }} />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-navy/40"><span>1</span><span>{Math.ceil(dim / 2)}</span><span>{dim}</span></div>
          </Card>
        )}
        <div className="text-[11px] leading-snug text-navy/45">
          Realized P&L is booked when you sell gold: net sale proceeds − average cost of the gold sold. Days without a sale show 0.00. Today's cell updates live as you trade.
        </div>
      </div>

      <Sheet open={!!sel} onClose={() => setSel(null)} title={sel ? dateStr(sel.ts) : ""}>
        {sel && (
          <div>
            <Row k="Realized P&L" v={signedEgp(sel.realized, 2)} tone={sel.realized > 0.005 ? "good" : sel.realized < -0.005 ? "bad" : undefined} strong />
            {sel.soldBasis > 0 && <Row k="Cost of gold sold" v={egp2(sel.soldBasis)} />}
            <Row k="Gold held at day end" v={gramsTrim(sel.grams)} />
            {selTxs.length > 0 && <div className="mt-2 border-t border-black/5 pt-2 text-[12px] font-bold text-navy/50">Transactions</div>}
            {selTxs.map((t) => <Row key={t.id} k={`${t.type} ${gramsTrim(t.grams)} · ${timeStr(t.ts)}`} v={`${egp2(t.pricePerGram)} / g`} />)}
            <div className="mt-3"><Button onClick={() => setSel(null)}>Close</Button></div>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}
