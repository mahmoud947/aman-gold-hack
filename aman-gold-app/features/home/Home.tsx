"use client";
import { useNav } from "../../components/nav";
import { DemoTag } from "../../components/ui";
import { useStore } from "../../services/store";
import { egp } from "../../utils/format";
import { getBuyPrice, getCurrentGoldPrice } from "../../services/pricing";
import { minPurchaseEgp } from "../../services/engine";

/** Recreated from the provided Aman Home screenshot (English, LTR). Prototype only, not Aman's production UI. */
const SERVICES = [
  { t: "Bill payments", i: "🧾" }, { t: "Aman installments", i: "📅" }, { t: "Aman store", i: "🛒" }, { t: "Project financing", i: "🧰" },
];
const PAY = [
  { t: "Mobile", i: "📱" }, { t: "Landline", i: "☎" }, { t: "Electricity", i: "⚡" }, { t: "Water", i: "💧" },
  { t: "Gas", i: "🔥" }, { t: "Education", i: "🎓" }, { t: "Utilities", i: "🏠" }, { t: "Games", i: "🎮" },
];

export default function Home() {
  const nav = useNav();
  const { wallet, onboarded, version } = useStore();
  void version;
  const goldTile = () => nav.push(onboarded ? "dashboard" : "landing");
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <span className="text-xl">🔔</span>
        <span className="text-[26px] font-black tracking-tight text-aman">aman</span>
        <span className="text-xl">🔍</span>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        {/* promo banner */}
        <div className="mx-4 mt-3 flex h-24 items-center justify-between overflow-hidden rounded-2xl bg-aman-gradient-flat px-4 text-white">
          <div><div className="text-[12px] opacity-80">Installments on all products</div><div className="text-[20px] font-black">0% interest</div><div className="text-[11px] opacity-80">up to 6 months</div></div>
          <div className="text-4xl">🎧📱</div>
        </div>

        {/* gold price strip: NEW entry point */}
        <button onClick={goldTile} className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-gradient-to-r from-gold-soft to-white p-3 text-left shadow-[0_1px_3px_rgba(30,43,74,.1)] ring-1 ring-gold/25">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-xl text-white">◈</div>
          <div className="flex-1">
            <div className="text-[15px] font-extrabold">Invest in Gold <DemoTag /></div>
            <div className="text-[12px] text-navy/60">{onboarded && wallet.grams > 0 ? `You hold ${wallet.grams.toFixed(1)} g · ${egp(wallet.marketValue)}` : `Start investing in gold from 0.1 g (about ${egp(minPurchaseEgp(getBuyPrice()))})`}</div>
          </div>
          <div className="text-right"><div className="text-[13px] font-bold">{egp(getCurrentGoldPrice(), 0)}</div><div className="text-[10px] text-navy/50">per gram</div></div>
        </button>

        <div className="px-4 pt-4 text-[15px] font-extrabold">Aman services</div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-2">
          <button onClick={goldTile} className="col-span-2 flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-2 ring-gold/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-2xl text-gold">◈</span>
            <div><div className="text-[14px] font-bold">Aman Gold</div><div className="text-[11px] text-navy/50">Buy and sell digital gold</div></div>
            <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
          </button>
          {SERVICES.map((s) => (
            <div key={s.t} className="flex h-20 items-center gap-2 rounded-2xl bg-white p-3 shadow-sm"><span className="text-3xl">{s.i}</span><span className="text-[13px] font-bold">{s.t}</span></div>
          ))}
        </div>

        <div className="px-4 pt-4 text-[15px] font-extrabold">Pay now</div>
        <div className="mx-4 mt-2 grid grid-cols-4 gap-y-3 rounded-2xl bg-white p-3 shadow-sm">
          {PAY.map((p) => (<div key={p.t} className="flex flex-col items-center gap-1"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-aman-soft text-xl">{p.i}</span><span className="text-[11px]">{p.t}</span></div>))}
        </div>

        <div className="px-4 pt-4 text-[15px] font-extrabold">Buy now, pay later</div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-2">
          {["Wireless earbuds", "Smartphone 128GB"].map((n, i) => (
            <div key={n} className="rounded-2xl bg-white p-3 shadow-sm"><div className="flex h-24 items-center justify-center rounded-xl bg-canvas text-4xl">{i ? "📱" : "🎧"}</div><div className="mt-2 text-[12px] font-semibold">{n}</div><div className="text-[13px] font-extrabold">EGP {i ? "8,999" : "699"}</div><div className="mt-1 rounded-lg bg-aman py-1.5 text-center text-[11px] font-bold text-white">Add to cart</div></div>
          ))}
        </div>
      </div>
      <div className="relative flex items-center justify-around border-t border-black/5 bg-white pb-2 pt-1 text-[10px] font-semibold text-navy/50">
        <span className="flex flex-col items-center py-1"><span className="text-lg">🏷</span>Offers</span>
        <span className="flex flex-col items-center py-1"><span className="text-lg">💳</span>Balance</span>
        <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-aman text-2xl text-white shadow-lg">⌂</span>
        <span className="flex flex-col items-center py-1"><span className="text-lg">🛒</span>Cart</span>
        <span className="flex flex-col items-center py-1"><span className="text-lg">☰</span>List</span>
      </div>
    </div>
  );
}
