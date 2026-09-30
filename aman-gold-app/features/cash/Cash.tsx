"use client";
import { useState } from "react";
import { PRODUCT_CONFIG } from "../../config/product";
import { useNav } from "../../components/nav";
import { Alert, Button, Card, Divider, Field, Row, Screen, Spinner } from "../../components/ui";
import { useStore } from "../../services/store";
import { egp2, round2 } from "../../utils/format";

type Dir = "in" | "out";
type Method = "prepaid" | "bank";
type Phase = "form" | "processing" | "done";

const QUICK = [1000, 5000, 10000, 25000];
/** DEMO validation only: Egyptian IBAN shape (EG + 27 digits). Real bank-account checks are out of scope. */
const ibanOk = (v: string) => /^EG\d{27}$/.test(v);
const maskIban = (v: string) => `${v.slice(0, 4)} •••• ${v.slice(-4)}`;

/**
 * Cash in (top up) and cash out (withdraw) for the balance used to buy gold.
 * Funding source: Aman prepaid card, or a bank account over ACH. DEMO: no money moves and bank details are not saved.
 */
export default function Cash({ dir }: { dir: Dir }) {
  const nav = useNav();
  const st = useStore();
  const isIn = dir === "in";
  const [method, setMethod] = useState<Method>("prepaid");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState({ name: "", holder: st.customer.name, iban: "" });
  const [phase, setPhase] = useState<Phase>("form");
  const [ref, setRef] = useState("");

  const num = round2(Number(amount) || 0);
  const bankOk = bank.name.trim().length >= 2 && bank.holder.trim().length >= 3 && ibanOk(bank.iban);
  const tooMuch = !isIn && num > st.cash;
  const canSubmit = num > 0 && !tooMuch && (method === "prepaid" || bankOk);
  const card = `${PRODUCT_CONFIG.payment.method} ${PRODUCT_CONFIG.payment.maskedCard.slice(-9)}`;
  const account = method === "prepaid" ? card : `${bank.name.trim()} ${maskIban(bank.iban)}`;
  const after = round2(isIn ? st.cash + num : st.cash - num);
  const title = isIn ? "Add money" : "Withdraw";

  const submit = () => {
    setRef(`CASH-${String(Date.now()).slice(-6)}`);
    setPhase("processing");
    setTimeout(() => { if (isIn) st.topUp(num); else st.withdraw(num); setPhase("done"); }, 1200);
  };

  if (phase === "processing") return (
    <Screen title={title} back={false}><div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"><Spinner /><div className="text-[18px] font-extrabold">{isIn ? "Adding money" : "Sending your money"}</div></div></Screen>
  );

  if (phase === "done") return (
    <Screen title={title} back={false} footer={<Button onClick={() => nav.pop()}>Done</Button>}>
      <div className="space-y-3 p-4">
        <div className="pt-4 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-good">✓</div>
          <div className="mt-3 text-[20px] font-black">{isIn ? `${egp2(num)} added` : `${egp2(num)} withdrawn`}</div></div>
        <Card>
          <Row k="Amount" v={egp2(num)} strong />
          <Row k={isIn ? "From" : "To"} v={account} />
          <Row k="Method" v={method === "prepaid" ? "Aman prepaid card" : "Bank transfer (ACH)"} />
          <Divider />
          <Row k="Available balance" v={egp2(st.cash)} strong />
          <Row k="Reference" v={ref} />
        </Card>
        {method === "bank" && <Alert tone="info">Simulated. In a live product, ACH bank transfers may not be instant; timing and limits are to be confirmed.</Alert>}
      </div>
    </Screen>
  );

  const option = (m: Method, label: string, sub: string) => (
    <button key={m} onClick={() => setMethod(m)} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ring-2 ${method === m ? "bg-aman-soft ring-aman" : "bg-white ring-transparent"}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${method === m ? "border-aman" : "border-black/20"}`}>{method === m && <span className="h-2.5 w-2.5 rounded-full bg-aman" />}</span>
      <span><span className="block text-[14px] font-bold">{label}</span><span className="block text-[12px] text-navy/55">{sub}</span></span>
    </button>
  );

  return (
    <Screen title={title} footer={<Button disabled={!canSubmit} onClick={submit}>{isIn ? "Add money" : "Withdraw"}{num > 0 ? ` ${egp2(num)}` : ""}</Button>}>
      <div className="space-y-3 p-4">
        <div className="text-[13px] font-bold text-navy/60">{isIn ? "Add money from" : "Send money to"}</div>
        {option("prepaid", "Aman prepaid card", `${PRODUCT_CONFIG.payment.maskedCard.slice(-9)} · instant`)}
        {option("bank", "Bank account (ACH)", "Enter your bank account details")}

        {method === "bank" && (
          <Card>
            <div className="mb-2 flex items-center justify-between"><div className="text-[14px] font-bold">Bank account details</div>
              <button onClick={() => setBank({ name: "Demo Bank", holder: st.customer.name || "Demo Customer", iban: "EG380019000500000000263180002" })} className="text-[12px] font-bold text-aman underline">Fill demo data</button></div>
            <Field label="Bank name" value={bank.name} onChange={(v) => setBank((b) => ({ ...b, name: v }))} placeholder="e.g. your bank" />
            <Field label="Account holder name" value={bank.holder} onChange={(v) => setBank((b) => ({ ...b, holder: v }))} placeholder="As shown on your bank account" />
            <Field label="IBAN" value={bank.iban} onChange={(v) => setBank((b) => ({ ...b, iban: v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 29) }))} placeholder="EG00 0000 0000 0000 0000 0000 0000 0"
              hint={bank.iban.length === 29 && !ibanOk(bank.iban) ? "That doesn't look like an Egyptian IBAN (EG + 27 digits)." : "Egyptian IBAN: EG followed by 27 digits (demo validation)."} />
            <div className="text-[11px] text-navy/40">Demo: bank details are not saved or verified.</div>
          </Card>
        )}

        <Card>
          <div className="text-[12px] font-semibold text-navy/50">Amount</div>
          <div className="flex items-baseline gap-2 py-2"><span className="text-[20px] font-bold text-navy/40">EGP</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" className="w-full min-w-0 bg-transparent text-[34px] font-black outline-none" /></div>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((v) => <button key={v} onClick={() => setAmount(String(v))} className="rounded-full bg-canvas px-3 py-1.5 text-[12px] font-bold">{v.toLocaleString()}</button>)}
            {!isIn && st.cash > 0 && <button onClick={() => setAmount(String(Math.floor(st.cash * 100) / 100))} className="rounded-full bg-canvas px-3 py-1.5 text-[12px] font-bold">All</button>}
          </div>
        </Card>

        <Card>
          <Row k="Available balance" v={egp2(st.cash)} />
          {num > 0 && !tooMuch && <Row k="Balance after" v={egp2(after)} strong />}
        </Card>
        {tooMuch && <Alert tone="error">You can withdraw up to {egp2(st.cash)}.</Alert>}
      </div>
    </Screen>
  );
}
