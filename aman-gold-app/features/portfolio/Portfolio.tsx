"use client";
import { useMemo, useState } from "react";
import CumulativePnlChart from "../../components/CumulativePnlChart";
import { useNav } from "../../components/nav";
import { Button, Card, DemoTag, Divider, Row, Screen } from "../../components/ui";
import { computeDailyPnl, cumulativeRealized, dayKey } from "../../services/pnl";
import { useStore } from "../../services/store";
import { egp, egp2, grams, pct, signedEgp } from "../../utils/format";

const tone = (n: number) => (n > 0.005 ? "text-good" : n < -0.005 ? "text-bad" : "text-navy");

function Donut({ goldPct }: { goldPct: number }) {
  const r = 54, c = 2 * Math.PI * r, gold = (goldPct / 100) * c;
  return (
    <svg viewBox="0 0 140 140" className="h-[132px] w-[132px] shrink-0 -rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#64c2d3" strokeWidth="16" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#04768d" strokeWidth="16" strokeDasharray={`${gold} ${c - gold}`} />
    </svg>
  );
}

export default function Portfolio() {
  const nav = useNav();
  const { wallet: w, sellPrice, providerUp, cash, txs } = useStore();
  const [hide, setHide] = useState(false);
  const H = (s: string) => (hide ? "••••" : s);
  const empty = w.grams === 0;

  // Realized P&L per day, derived from the ledger. Today's value is live: it changes as soon as a sale is executed.
  const days = useMemo(() => computeDailyPnl(txs), [txs]);
  const series = useMemo(() => cumulativeRealized(days, 30), [days]);
  const today = days.find((d) => d.key === dayKey(Date.now()));
  const todayRealized = today?.realized ?? 0;
  const todayPct = today && today.soldBasis > 0 ? (today.realized / today.soldBasis) * 100 : 0;

  const totalAssets = w.marketValue + cash;
  const goldPct = totalAssets > 0 ? (w.marketValue / totalAssets) * 100 : 0;

  return (
    <Screen title="Portfolio" back={false} tabs right={<DemoTag />}>
      <div className="space-y-3 p-4">
        <Card>
          <div className="flex items-center gap-2 text-[15px] font-extrabold"><span className="border-b border-dashed border-navy/40">Portfolio value</span>
            <button aria-label="Hide balances" onClick={() => setHide(!hide)} className="text-[15px] text-navy/40">{hide ? "◌" : "◉"}</button></div>
          <div className="mt-1 text-[34px] font-black leading-tight">{H(egp(w.marketValue))}</div>
          <div className="text-[12px] text-navy/50">{H(`≈ ${grams(w.grams, 1)} of 24k gold at sell price ${egp2(sellPrice)} / g`)}</div>

          <button onClick={() => nav.push("dailyPnl")} className="mt-3 flex w-full items-center justify-between rounded-xl bg-canvas px-3 py-2.5 text-left">
            <div>
              <div className="text-[13px] font-semibold">Today's Realized P&L</div>
              <div className="text-[11px] text-navy/45">Tap to see daily P&L</div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-right text-[14px] font-extrabold ${tone(todayRealized)}`}>{H(signedEgp(todayRealized, 2))}<div className="text-[11px] font-bold">{H(pct(todayPct))}</div></div>
              <span className="text-lg text-navy/40">›</span>
            </div>
          </button>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] text-navy/50">Gold holdings</div>
              <div className="text-[18px] font-extrabold">{H(grams(w.grams, 1))}</div>
              <div className="text-[12px] text-navy/50">{H(`≈ ${egp(w.marketValue)}`)}</div>
            </div>
            <div>
              <div className="text-[12px] text-navy/50"><span className="border-b border-dashed border-navy/40">Unrealized P&L</span></div>
              <div className={`text-[18px] font-extrabold ${tone(w.unrealizedPnl)}`}>{H(empty ? "EGP 0" : signedEgp(w.unrealizedPnl))}</div>
              <div className={`text-[12px] font-bold ${tone(w.unrealizedPnl)}`}>{H(empty ? "—" : pct(w.unrealizedPct))}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-[15px] font-extrabold">Asset allocation</div>
          <div className="flex items-center gap-4">
            <Donut goldPct={goldPct} />
            <div className="flex-1 space-y-2 text-[13px]">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-aman" />Gold</span><b>{H(`${goldPct.toFixed(2)}%`)}</b></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-aman-light" />Cash (prepaid)</span><b>{H(`${(100 - goldPct).toFixed(2)}%`)}</b></div>
              <Divider />
              <div className="flex justify-between text-[12px] text-navy/50"><span>Total</span><span>{H(egp(totalAssets))}</span></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-[15px] font-extrabold">Cumulative P&L</div>
          {txs.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-navy/50">Your cumulative realized P&L will appear after your first sale.</div>
          ) : (
            <CumulativePnlChart points={series} />
          )}
        </Card>

        <Card>
          <Row k="Average buy price" v={empty ? "—" : `${egp2(w.avgBuyPrice)} / g`} />
          <Row k="Current sell price" v={`${egp2(sellPrice)} / g`} />
          <Row k="Total invested (cost of gold held)" v={H(egp(w.costBasis))} />
        </Card>

        <div className="grid grid-cols-2 gap-3"><Button disabled={!providerUp} onClick={() => nav.push("buy")}>Buy Gold</Button><Button variant="secondary" disabled={!providerUp || empty} onClick={() => nav.push("sell")}>Sell Gold</Button></div>
      </div>
    </Screen>
  );
}
