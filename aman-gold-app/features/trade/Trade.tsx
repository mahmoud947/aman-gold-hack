"use client";
import { useEffect, useState } from "react";
import { PRODUCT_CONFIG } from "../../config/product";
import { useNav } from "../../components/nav";
import { Alert, Button, Card, Divider, Row, Screen, Sheet, Spinner } from "../../components/ui";
import { ERROR_TEXT, minPurchaseEgp, quoteBuy, quoteSell, snapDown, validateBuy, validateSell } from "../../services/engine";
import { useStore } from "../../services/store";
import type { Quote, Transaction, TxType } from "../../types";
import { dateTime, egp, egp2, grams, round2 } from "../../utils/format";

type Phase = "amount" | "summary" | "pin" | "processing" | "success" | "failed";
const STEP = PRODUCT_CONFIG.limits.quantityStepGrams;
const g1 = (n: number) => Math.round(n * 10) / 10;

export default function Trade({ side }: { side: TxType }) {
  const nav = useNav();
  const st = useStore();
  const isBuy = side === "BUY";
  const [phase, setPhase] = useState<Phase>("amount");
  const [amount, setAmount] = useState("");
  const [by, setBy] = useState<"grams" | "egp">("grams");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pin, setPin] = useState("");
  const [tx, setTx] = useState<Transaction | null>(null);
  const [topUp, setTopUp] = useState(false);
  const [changed, setChanged] = useState(false);
  const [now, setNow] = useState(Date.now());
  const c = PRODUCT_CONFIG;

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);

  const num = Number(amount) || 0;
  const livePrice = isBuy ? st.buyPrice : st.sellPrice;
  const price = quote?.price ?? livePrice;
  const input = by === "grams" ? { grams: num } : { egp: num };
  const bq = isBuy ? quoteBuy(input, price) : null;
  const sq = !isBuy ? quoteSell(input, price) : null;
  const err = num <= 0 ? null : isBuy
    ? validateBuy(bq!, st.cash, st.todayBuyEgp, st.kycOk, st.providerUp)
    : validateSell(sq!, st.wallet.grams, st.providerUp);

  const remaining = quote ? Math.max(0, Math.floor((quote.expiresAt - now) / 1000)) : 0;
  const expired = phase === "summary" && quote !== null && now > quote.expiresAt;
  useEffect(() => { if (expired) setChanged(true); }, [expired]);

  const goSummary = () => { setQuote(st.makeQuote(side)); setPhase("summary"); };
  const confirm = () => {
    if (!quote) return;
    const drift = Math.abs(livePrice - quote.price) / quote.price;
    if (now > quote.expiresAt || drift >= 0.005) { setChanged(true); return; }
    setPin(""); setPhase("pin");
  };
  const [submitted, setSubmitted] = useState(false);
  const run = async () => {
    if (submitted) return; // one submission per order, however many keys are tapped
    setSubmitted(true);
    setPhase("processing");
    try { setTx(await (isBuy ? st.executeBuy(bq!) : st.executeSell(sq!))); setPhase("success"); }
    catch { setPhase("failed"); }
    finally { setSubmitted(false); }
  };
  const press = (k: string) => {
    if (submitted || (pin.length >= 4 && k !== "⌫")) return; // ignore taps after the 4th digit
    const p = k === "⌫" ? pin.slice(0, -1) : pin + k;
    setPin(p);
    if (p.length === 4 && k !== "⌫") setTimeout(run, 250);
  };

  const q = (isBuy ? bq : sq)!;
  const title = isBuy ? "Buy Gold" : "Sell Gold";

  if (phase === "processing") return (
    <Screen title={title} back={false}><div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"><Spinner /><div className="text-[18px] font-extrabold">Processing your {isBuy ? "purchase" : "sale"}</div><div className="text-[13px] text-navy/60">Please don't close the app.</div></div></Screen>
  );

  if (phase === "failed") return (
    <Screen title={title} back={false} footer={<div className="space-y-2"><Button onClick={() => { setPhase("summary"); setQuote(st.makeQuote(side)); }}>Try again</Button><Button variant="ghost" onClick={() => nav.reset("dashboard")}>Done</Button></div>}>
      <div className="p-8 pt-16 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-bad">!</div><div className="mt-4 text-[20px] font-black">We couldn't complete your transaction</div><div className="mt-2 text-[13px] text-navy/60">No money or gold was moved. Your balances are unchanged.</div></div>
    </Screen>
  );

  if (phase === "success" && tx) return (
    <Screen title={isBuy ? "Purchase complete" : "Sale complete"} back={false}
      footer={<div className="space-y-2"><Button variant="gold" onClick={() => nav.reset("portfolio")}>View Investment</Button><Button variant="secondary" onClick={() => nav.reset("dashboard")}>Done</Button></div>}>
      <div className="space-y-3 p-4">
        <div className="pt-4 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-good">✓</div>
          <div className="mt-3 text-[20px] font-black">{isBuy ? "Gold purchased successfully" : "Gold sold successfully"}</div></div>
        <Card>
          <Row k="Quantity" v={grams(tx.grams, 1)} />
          <Row k={isBuy ? "Purchase price" : "Sell price"} v={`${egp2(tx.pricePerGram)} / g`} />
          <Row k="Fee" v={egp2(tx.fee)} />
          <Row k={isBuy ? "Total paid" : "Net received"} v={egp2(tx.net)} strong />
          <Divider />
          <Row k="Transaction ID" v={tx.id} />
          <Row k="Date & time" v={dateTime(tx.ts)} />
          <Row k="Gold balance" v={`${grams(tx.goldBefore, 1)} → ${grams(tx.goldAfter, 1)}`} />
          <Row k="Cash balance" v={`${egp2(tx.cashBefore)} → ${egp2(tx.cashAfter)}`} />
          {!isBuy && tx.realizedPnl !== undefined && <Row k="Realized P&L" v={`${tx.realizedPnl >= 0 ? "+" : "-"}${egp2(Math.abs(tx.realizedPnl))}`} tone={tx.realizedPnl >= 0 ? "good" : "bad"} />}
        </Card>
        {!isBuy && <Alert tone="info">The amount has been credited to your Aman balance.</Alert>}
        <button className="w-full text-center text-[13px] font-bold text-aman" onClick={() => nav.push("txDetail", { id: tx.id })}>View transaction details ›</button>
      </div>
    </Screen>
  );

  if (phase === "pin") return (
    <Screen title="Confirm with PIN" back={false} right={<button onClick={() => setPhase("summary")} className="text-[13px] font-bold text-aman">Cancel</button>}>
      <div className="p-6 text-center">
        <div className="text-[15px] font-bold">Enter your 4-digit PIN</div><div className="text-[12px] text-navy/50">Demo: enter any 4 digits (simulated authentication)</div>
        <div className="my-6 flex justify-center gap-3">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-4 w-4 rounded-full ${i < pin.length ? "bg-aman" : "bg-black/10"}`} />)}</div>
        <div className="mx-auto grid max-w-[260px] grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) => k === "" ? <span key={i} /> : (
            <button key={i} onClick={() => press(k)} className="rounded-2xl bg-white py-4 text-[20px] font-bold shadow-sm active:bg-aman-soft">{k}</button>
          ))}
        </div>
      </div>
    </Screen>
  );

  if (phase === "summary" && quote) return (
    <Screen title="Order summary" right={<button onClick={() => setPhase("amount")} className="text-[13px] font-bold text-aman">Edit</button>}
      footer={<Button variant={isBuy ? "primary" : "gold"} disabled={!!err || !st.providerUp} onClick={confirm}>{isBuy ? "Confirm Purchase" : "Confirm Sale"}</Button>}>
      <div className="space-y-3 p-4">
        <div className={`rounded-xl px-3 py-2 text-center text-[13px] font-bold ${remaining <= 10 ? "bg-red-50 text-bad" : "bg-aman-soft text-aman-dark"}`}>Price locked for {remaining}s</div>
        {st.volatility && <Alert tone="warn"><b>Gold prices are changing rapidly.</b> Your final execution price may differ.</Alert>}
        <Card>
          <Row k="Gold quantity" v={grams(q.grams, 1)} strong />
          <Row k={isBuy ? "Gold buy price" : "Gold sell price"} v={`${egp2(price)} / g`} />
          {isBuy ? <Row k="Investment" v={egp2(bq!.investment)} /> : <Row k="Gross value" v={egp2(sq!.gross)} />}
          <Row k="Fee" v={q.fee === 0 ? "EGP 0.00 (spread only)" : egp2(q.fee)} />
          <Divider />
          <Row k={isBuy ? "Total" : "Net amount"} v={egp2(isBuy ? bq!.total : sq!.net)} strong />
          <Row k={isBuy ? "Payment method" : "Credited to"} v={isBuy ? `${c.payment.method} ${c.payment.maskedCard.slice(-9)}` : "Aman prepaid balance"} />
        </Card>
        <Alert tone="info">Gold prices may change before your order is executed.</Alert>
        {!isBuy && <Alert tone="info">Amount will be credited to your Aman balance.</Alert>}
        {err && <Alert tone="error">{ERROR_TEXT[err]}</Alert>}
      </div>
      <Sheet open={changed} title="Price changed">
        <p className="mb-4 text-[14px] text-navy/70">The gold price has changed. Please review the updated price.</p>
        <Button onClick={() => { setQuote(st.makeQuote(side)); setChanged(false); }}>Review updated price ({egp2(livePrice)} / g)</Button>
      </Sheet>
    </Screen>
  );

  // ---- amount ----
  const held = st.wallet.grams;
  const chips: { label: string; value: string }[] = isBuy
    ? by === "grams" ? c.payment.quickGrams.map((v) => ({ label: `${v} g`, value: String(v) })) : c.payment.quickAmountsEgp.map((v) => ({ label: `EGP ${v.toLocaleString()}`, value: String(v) }))
    : [25, 50, 75, 100].map((p) => {
        const gr = p === 100 ? held : snapDown((held * p) / 100);
        return { label: `${p}%`, value: by === "grams" ? String(g1(gr)) : String(Math.floor(gr * price)) };
      });
  const stepBy = (d: number) => setAmount(String(Math.max(0, g1(num + d))));
  const remainder = isBuy && by === "egp" && bq && bq.grams > 0 ? round2(num - bq.investment) : 0;
  const preview = num <= 0 || err === "NOT_STEP" ? null : isBuy
    ? `You'll buy ${grams(bq!.grams, 1)} for ${egp2(bq!.investment)}`
    : `You'll sell ${grams(sq!.grams, 1)} for ${egp2(sq!.gross)}`;

  return (
    <Screen title={title} footer={<Button variant={isBuy ? "primary" : "gold"} disabled={num <= 0 || !!err} onClick={goSummary}>Review order</Button>}>
      <div className="space-y-3 p-4">
        {!st.providerUp && <Alert tone="error"><b>Gold investment is temporarily unavailable.</b> Please try again later.</Alert>}
        {!st.kycOk && <Alert tone="warn">Please complete your information before investing. <button className="font-bold underline" onClick={() => nav.push("onboarding")}>Complete now</button></Alert>}
        {st.volatility && <Alert tone="warn"><b>Gold prices are changing rapidly.</b> Your final execution price may differ.</Alert>}
        <div className="flex rounded-xl bg-white p-1 text-[13px] font-bold">
          {(["grams", "egp"] as const).map((m) => <button key={m} onClick={() => { setBy(m); setAmount(""); }} className={`flex-1 rounded-lg py-2 ${by === m ? "bg-navy text-white" : "text-navy/60"}`}>{m === "grams" ? `${isBuy ? "Buy" : "Sell"} by grams` : `${isBuy ? "Buy" : "Sell"} by EGP`}</button>)}
        </div>
        <Card>
          <div className="text-[12px] font-semibold text-navy/50">{by === "grams" ? `Grams (steps of ${STEP} g)` : isBuy ? "Amount to invest" : "Value to sell"}</div>
          <div className="flex items-center gap-2 py-2">
            {by === "grams" && <button aria-label="Less" onClick={() => stepBy(-STEP)} className="h-10 w-10 shrink-0 rounded-full bg-canvas text-xl font-bold">−</button>}
            <div className="flex flex-1 items-baseline gap-2"><span className="text-[20px] font-bold text-navy/40">{by === "egp" ? "EGP" : "g"}</span>
              <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" className="w-full min-w-0 bg-transparent text-[34px] font-black outline-none" /></div>
            {by === "grams" && <button aria-label="More" onClick={() => stepBy(STEP)} className="h-10 w-10 shrink-0 rounded-full bg-canvas text-xl font-bold">+</button>}
          </div>
          <div className="text-[13px] font-semibold text-navy/60">{preview ?? `Price: ${egp2(livePrice)} / g`}</div>
          {remainder > 0 && <div className="text-[11px] text-navy/45">Gold is sold in {STEP} g steps, so we round down. EGP {remainder.toFixed(2)} stays in your balance.</div>}
        </Card>
        <div className="flex flex-wrap gap-2">
          {chips.map((ch) => <button key={ch.label} onClick={() => setAmount(ch.value)} className="rounded-full bg-white px-4 py-2 text-[13px] font-bold shadow-sm">{ch.label}</button>)}
        </div>
        <Card>
          <Row k="Available balance" v={egp2(st.cash)} />
          {!isBuy && <Row k="Gold available" v={grams(held, 1)} />}
          <Row k={isBuy ? "Buy price" : "Sell price"} v={`${egp2(livePrice)} / g`} />
          <Row k="Minimum" v={`${c.limits.minGrams} g${isBuy ? ` (about ${egp(minPurchaseEgp(livePrice))})` : ""}`} />
          {isBuy && <Row k="Maximum per order" v={egp(c.limits.maxInvestmentEgp)} />}
        </Card>
        {err && (
          <Alert tone="error">{ERROR_TEXT[err]}
            {err === "INSUFFICIENT_BALANCE" && <button className="ml-2 font-bold underline" onClick={() => setTopUp(true)}>Top up via {c.payment.topUpRail}</button>}
          </Alert>
        )}
      </div>
      <Sheet open={topUp} onClose={() => setTopUp(false)} title={`Top up via ${c.payment.topUpRail}`}>
        <p className="mb-3 text-[13px] text-navy/60">Simulated top-up of your {c.payment.method}. No real payment is made.</p>
        <div className="grid grid-cols-3 gap-2">{[5000, 10000, 25000].map((v) => <button key={v} onClick={() => { st.topUp(v); setTopUp(false); }} className="rounded-xl bg-aman-soft py-3 text-[14px] font-bold text-aman-dark">+{v.toLocaleString()}</button>)}</div>
      </Sheet>
    </Screen>
  );
}
