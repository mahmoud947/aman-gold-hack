"use client";
import { PRODUCT_CONFIG } from "../../config/product";
import PriceChart from "../../components/PriceChart";
import { useNav } from "../../components/nav";
import { Alert, Button, Card, DemoTag, Row, Screen } from "../../components/ui";
import { useStore } from "../../services/store";
import { egp } from "../../utils/format";
import { minPurchaseEgp } from "../../services/engine";

export default function Landing() {
  const nav = useNav();
  const { onboarded, buyPrice, sellPrice } = useStore();
  const c = PRODUCT_CONFIG;
  return (
    <Screen title="Aman Gold" footer={<Button variant="gold" onClick={() => (onboarded ? nav.reset("dashboard") : nav.push("onboarding"))}>{onboarded ? "Open Gold" : "Start Investing"}</Button>}>
      <div className="space-y-3 p-4">
        <div className="rounded-3xl bg-aman-gradient p-5 text-white">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-gold-soft">Invest in Gold <DemoTag /></div>
          <div className="mt-1 text-[24px] font-black leading-tight">Start investing in gold from {c.limits.minGrams} g (about {egp(minPurchaseEgp(buyPrice))})</div>
          <div className="mt-2 text-[13px] opacity-80">Buy and sell digital gold in a few taps, straight from your Aman app.</div>
        </div>
        <Card><PriceChart /></Card>
        <Card>
          <div className="mb-1 text-[14px] font-bold">Buy and sell prices</div>
          <Row k="Buy price" v={`${egp(buyPrice, 2)} / g`} />
          <Row k="Sell price" v={`${egp(sellPrice, 2)} / g`} />
          <div className="text-[12px] text-navy/50">The difference between the buy and sell price is Aman's spread ({c.pricing.spreadPctPerSide}% each side).</div>
        </Card>
        <Card>
          <div className="mb-2 text-[14px] font-bold">What is digital gold?</div>
          <p className="text-[13px] leading-relaxed text-navy/70">You own a quantity of 24k gold, measured in grams and held with an approved partner. You see its value in EGP, and you can sell it back at any time the market is open.</p>
        </Card>
        <Card>
          <div className="mb-1 text-[14px] font-bold">Why Aman Gold</div>
          {[`Start small (from ${c.limits.minGrams} g, about ${egp(minPurchaseEgp(buyPrice))})`, "See exactly what you own and what it is worth", "Pay from your Aman prepaid balance", "Clear prices: no hidden charges"].map((t) => (
            <div key={t} className="flex gap-2 py-1 text-[13px]"><span className="text-good">✓</span>{t}</div>
          ))}
        </Card>
        <Card>
          <div className="mb-1 text-[14px] font-bold">Fees and charges</div>
          <Row k="Spread" v={`${c.pricing.spreadPctPerSide}% each side`} />
          <Row k="Transaction fee" v={c.pricing.transactionFeePct === 0 ? "None" : `${c.pricing.transactionFeePct}%`} />
          <Row k="Funding" v={`${c.payment.method} (top up via ${c.payment.topUpRail})`} />
          <div className="text-[11px] text-navy/40">{c.labels.assumption}: values can change.</div>
        </Card>
        <Alert tone="warn"><b>Risk disclosure.</b> Gold prices can rise and fall, and you may get back less than you invested. Prices in this prototype are simulated. {c.labels.notAdvice}</Alert>
      </div>
    </Screen>
  );
}
