"use client";
import PriceChart from "../../components/PriceChart";
import { useNav } from "../../components/nav";
import { Alert, Button, Card, DemoTag, Pill, Row, Screen, Stat } from "../../components/ui";
import { useStore } from "../../services/store";
import { egp, grams, pct, signedEgp } from "../../utils/format";
import { minPurchaseEgp } from "../../services/engine";

export default function Dashboard() {
  const nav = useNav();
  const { wallet: w, buyPrice, sellPrice, cash, providerUp, kycOk, volatility, customer } = useStore();
  const up = w.unrealizedPnl >= 0;
  const empty = w.grams === 0;
  return (
    <Screen title="Aman Gold" back={false} tabs right={<DemoTag />}>
      <div className="space-y-3 p-4">
        {!providerUp && <Alert tone="error"><b>Gold investment is temporarily unavailable.</b> You can still view your holdings. Trading resumes when our partner is back.</Alert>}
        {!kycOk && <Alert tone="warn">Please complete your information before investing. <button className="font-bold underline" onClick={() => nav.push("onboarding")}>Complete now</button></Alert>}
        {volatility && <Alert tone="warn"><b>Gold prices are changing rapidly.</b> Your final execution price may differ.</Alert>}

        <div className="rounded-3xl bg-aman-gradient p-5 text-white">
          <div className="text-[12px] font-semibold text-white/60">Hi, {customer.name.split(" ")[0]} · Portfolio value</div>
          <div className="text-[32px] font-black leading-tight">{egp(w.marketValue)}</div>
          <div className="text-[12px] text-white/60">Current value (at sell price)</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div><div className="text-[11px] text-white/60">Gold holdings</div><div className="text-[18px] font-extrabold">{grams(w.grams, 1)}</div></div>
            <div><div className="text-[11px] text-white/60">Unrealized P&L</div>
              <div className={`text-[18px] font-extrabold ${up ? "text-green-300" : "text-red-300"}`}>{empty ? "EGP 0" : signedEgp(w.unrealizedPnl)}</div>
              <div className={`text-[12px] font-bold ${up ? "text-green-300" : "text-red-300"}`}>{empty ? "—" : pct(w.unrealizedPct)}</div></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" disabled={!providerUp} onClick={() => nav.push("buy")}>Buy Gold</Button>
          <Button variant="secondary" disabled={!providerUp || empty} onClick={() => nav.push("sell")}>Sell Gold</Button>
        </div>
        {empty && <div className="text-center text-[12px] text-navy/50">You don't own any gold yet. Buy from 0.1 g (about {egp(minPurchaseEgp(buyPrice))}) to get started.</div>}

        <Card>
          <div className="mb-2 flex items-center justify-between"><div className="text-[14px] font-bold">Gold price</div><Pill tone="gold">EGP / gram · 24k</Pill></div>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-canvas p-3">
            <Stat label="Buy price" value={egp(buyPrice, 2)} />
            <Stat label="Sell price" value={egp(sellPrice, 2)} />
          </div>
          <PriceChart />
        </Card>

        <Card>
          <Row k="Available balance" v={egp(cash, 2)} />
          <Row k="Average buy price" v={empty ? "—" : `${egp(w.avgBuyPrice, 2)} / g`} />
          <Row k="Total invested" v={egp(w.costBasis)} />
          <button className="mt-2 w-full text-[13px] font-bold text-aman" onClick={() => nav.push("portfolio")}>View portfolio ›</button>
        </Card>
      </div>
    </Screen>
  );
}
