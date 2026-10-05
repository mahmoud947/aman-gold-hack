"use client";
import Home from "../features/home/Home";
import Landing from "../features/gold/Landing";
import Dashboard from "../features/gold/Dashboard";
import Onboarding from "../features/onboarding/Onboarding";
import Trade from "../features/trade/Trade";
import Portfolio from "../features/portfolio/Portfolio";
import DailyPnl from "../features/portfolio/DailyPnl";
import { Transactions, TransactionDetail } from "../features/transactions/Transactions";
import Profile from "../features/profile/Profile";
import Cash from "../features/cash/Cash";
import { StoreProvider, useStore } from "../services/store";
import { NavProvider, useNav } from "./nav";
import { Authentication } from "../features/auth/Authentication";

const PROTECTED = new Set(["dashboard", "buy", "sell", "portfolio", "transactions", "txDetail", "profile", "dailyPnl", "cash"]);

function Router() {
  const { route } = useNav();
  const { authenticated } = useStore();
  if (route.name !== "auth" && PROTECTED.has(route.name) && !authenticated) return <Authentication required destination={route.name} />;
  switch (route.name) {
    case "home": return <Home />;
    case "auth": return <Authentication />;
    case "landing": return <Landing />;
    case "onboarding": return <Onboarding />;
    case "dashboard": return <Dashboard />;
    case "buy": return <Trade key="buy" side="BUY" />;
    case "sell": return <Trade key="sell" side="SELL" />;
    case "portfolio": return <Portfolio />;
    case "transactions": return <Transactions />;
    case "txDetail": return <TransactionDetail id={route.params?.id ?? ""} />;
    case "profile": return <Profile />;
    case "dailyPnl": return <DailyPnl />;
    case "cash": return <Cash key={route.params?.dir} dir={route.params?.dir === "out" ? "out" : "in"} />;
  }
}

function Toggle({ label, on, onChange, hint }: { label: string; on: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 border-b border-black/5 py-2.5">
      <span><span className="block text-[13px] font-semibold">{label}</span>{hint && <span className="block text-[11px] text-navy/50">{hint}</span>}</span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-teal-700" />
    </label>
  );
}

function Controls() {
  const s = useStore();
  const nav = useNav();
  const btn = "rounded-lg bg-white px-3 py-2 text-[12px] font-bold shadow-sm ring-1 ring-black/10 hover:bg-aman-soft";
  return (
    <aside className="w-full max-w-[380px] space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <div><div className="text-[15px] font-extrabold">Prototype controls</div><div className="text-[12px] text-navy/50">Not part of the product. Used to demo states and edge cases.</div></div>
      <div>
        <div className="mb-1 text-[12px] font-bold text-navy/60">Customer scenario</div>
        <div className="flex flex-wrap gap-2">
          <button className={`${btn} ${s.mode === "new" ? "!bg-aman !text-white" : ""}`} onClick={() => { s.setMode("new"); nav.reset("home"); }}>Existing Aman customer (data on file), new to Gold</button>
          <button className={`${btn} ${s.mode === "brandNew" ? "!bg-aman !text-white" : ""}`} onClick={() => { s.setMode("brandNew"); nav.reset("home"); }}>Brand-new customer (nothing on file)</button>
          <button className={`${btn} ${s.mode === "existing" ? "!bg-aman !text-white" : ""}`} onClick={() => { s.setMode("existing"); nav.reset("home"); }}>Existing investor (Ahmed)</button>
        </div>
        <div className="mt-1 text-[11px] text-navy/50">Existing customer: short onboarding that reuses data on file. Brand-new customer: full 10-step onboarding (mobile, code, PIN, details, ID, selfie, eKYC signature, agreements). Existing: 20 seeded transactions (24 Aug to 21 Sep 2026) priced on real daily Egypt 24k gold prices, with winning and losing sell days. Live price then moves as a simulation.</div>
      </div>
      <div>
        <Toggle label="Provider unavailable" hint="Disables trading, shows the unavailable message" on={!s.providerUp} onChange={(v) => s.setProviderUp(!v)} />
        <Toggle label="KYC incomplete" hint="Address missing: blocks investing, shows onboarding fix" on={s.kycMissing} onChange={(v) => s.set({ kycMissing: v })} />
        <Toggle label="Market volatility banner" hint="Shows the rapid-change warning" on={s.volatility} onChange={(v) => s.set({ volatility: v })} />
        <Toggle label="Fail next transaction" hint="Shows 'We couldn't complete your transaction'" on={s.failNext} onChange={(v) => s.set({ failNext: v })} />
        <Toggle label="Fail next authentication" hint="Demonstrates recoverable, non-sensitive failure feedback" on={s.failNextAuth} onChange={(v) => s.set({ failNextAuth: v })} />
        <Toggle label="Invalidate demo session" hint="Shows protected-access behavior after state becomes invalid" on={!s.authenticated} onChange={(v) => s.set({ authenticated: !v })} />
      </div>
      <div>
        <div className="mb-1 text-[12px] font-bold text-navy/60">Simulate price move</div>
        <div className="flex gap-2"><button className={btn} onClick={() => s.shock(-1)}>-1%</button><button className={btn} onClick={() => s.shock(1)}>+1%</button><button className={btn} onClick={() => s.shock(3)}>+3%</button></div>
        <div className="mt-1 text-[11px] text-navy/50">Move the price while a quote is open to see “Price changed”. Prices also tick every 8s.</div>
      </div>
      <div className="rounded-xl bg-gold-soft p-3 text-[11px] leading-snug text-navy/70"><b>DEMO DATA.</b> Prices, balances, customer and card are fictional. Pricing, limits and KYC fields are configurable assumptions (config/product.ts). Regulatory structure: TO VALIDATE. Not legal or investment advice.</div>
    </aside>
  );
}

export default function PhoneShell() {
  return (
    <StoreProvider>
      <NavProvider>
        <main className="flex min-h-screen flex-wrap items-start justify-center gap-8 p-6">
          <div className="relative h-[844px] w-[390px] shrink-0 overflow-hidden rounded-[44px] border-[10px] border-navy bg-canvas shadow-2xl">
            <div className="flex h-8 items-center justify-between bg-white px-6 text-[12px] font-bold"><span>5:13 PM</span><span>▂▄▆ 5G ▮</span></div>
            <div className="relative h-[calc(100%-2rem)]"><Router /></div>
          </div>
          <Controls />
        </main>
      </NavProvider>
    </StoreProvider>
  );
}
