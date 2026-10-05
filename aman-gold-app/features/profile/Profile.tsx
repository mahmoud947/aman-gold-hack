"use client";
import { useState } from "react";
import { PRODUCT_CONFIG } from "../../config/product";
import { Alert, Card, Pill, Row, Screen, Sheet, Button } from "../../components/ui";
import { useStore } from "../../services/store";
import { useNav } from "../../components/nav";

const FAQ = [
  ["Is my gold real?", "In this prototype, no: prices and balances are simulated. In a live product, holdings would be backed by an approved partner (to be validated)."],
  ["Why are buy and sell prices different?", `The gap is Aman's spread (${PRODUCT_CONFIG.pricing.spreadPctPerSide}% each side). It is shown before every order.`],
  ["Where does my money go when I sell?", "It is credited to your Aman prepaid balance."],
  ["Can prices change before my order?", "Yes. We lock a price for a short time. If it expires, we show you the updated price first."],
];

export default function Profile() {
  const store = useStore();
  const { customer: c, kycOk, cash } = store;
  const nav = useNav();
  const [sheet, setSheet] = useState<string | null>(null);
  const item = (t: string) => <button key={t} onClick={() => setSheet(t)} className="flex w-full items-center justify-between border-b border-black/5 py-3 text-left text-[14px] font-semibold last:border-0">{t}<span className="text-aman">›</span></button>;
  return (
    <Screen title="Profile" back={false} tabs>
      <div className="space-y-3 p-4">
        <Card>
          <div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-aman text-xl font-black text-white">{c.name.split(" ").map((x) => x[0]).join("")}</div>
            <div><div className="text-[17px] font-extrabold">{c.name}</div><div className="text-[12px] text-navy/50">{c.mobile}</div></div></div>
        </Card>
        <Card>
          <Row k="Authentication" v={<Pill tone="good">Authenticated</Pill>} />
          <Row k="KYC status" v={<Pill tone={kycOk ? "good" : "bad"}>{kycOk ? "Complete" : "Incomplete"}</Pill>} />
          <Row k="National ID" v={c.nationalIdMasked} />
          <Row k="Linked payment method" v={`${PRODUCT_CONFIG.payment.method} ${PRODUCT_CONFIG.payment.maskedCard.slice(-4)}`} />
          <Row k="Prepaid balance" v={`EGP ${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
          <Row k="Investment preferences" v="Notifications: price alerts (roadmap)" />
        </Card>
        <Card>{["Terms & Conditions", "Gold Investment Terms", "Risk Disclosure", "Privacy Policy"].map(item)}</Card>
        <Card>{["FAQ", "Support"].map(item)}</Card>
        {!kycOk && <Alert tone="warn">Your identity is authenticated, but KYC is incomplete. This demo does not assume eligibility; complete the missing profile information before investing.</Alert>}
        <Button variant="secondary" disabled={store.authPending} onClick={async () => { await store.logout(); nav.reset("home"); }}>{store.authPending ? "Logging out…" : "Log out"}</Button>
        <div className="text-center text-[11px] text-navy/40">{PRODUCT_CONFIG.labels.notAdvice}</div>
      </div>
      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet ?? ""}>
        {sheet === "FAQ" ? <div className="max-h-64 space-y-3 overflow-y-auto">{FAQ.map(([q, a]) => <div key={q}><div className="text-[13px] font-bold">{q}</div><div className="text-[13px] text-navy/60">{a}</div></div>)}</div>
          : sheet === "Support" ? <div className="text-[13px] text-navy/70">Contact Aman support from the Super App help centre. (Prototype placeholder.)</div>
          : <div className="text-[13px] leading-relaxed text-navy/70">Placeholder legal text for the prototype. Final wording to be provided by Legal and Compliance.</div>}
        <div className="mt-3"><Button onClick={() => setSheet(null)}>Close</Button></div>
      </Sheet>
    </Screen>
  );
}
