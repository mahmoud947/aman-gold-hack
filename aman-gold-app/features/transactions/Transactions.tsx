"use client";
import { useNav } from "../../components/nav";
import { Card, Divider, Row, Screen, StatusBadge, TypeBadge } from "../../components/ui";
import { useStore } from "../../services/store";
import { dateStr, egp2, grams, gramsTrim, timeStr } from "../../utils/format";

export function Transactions() {
  const nav = useNav();
  const { txs } = useStore();
  const list = [...txs].sort((a, b) => b.ts - a.ts);
  return (
    <Screen title="Transactions" back={false} tabs>
      <div className="space-y-2 p-4">
        {list.length === 0 && <div className="pt-20 text-center text-[14px] text-navy/50">No transactions yet.<br />Your gold purchases and sales will appear here.</div>}
        {list.map((t) => (
          <button key={t.id} onClick={() => nav.push("txDetail", { id: t.id })} className="block w-full text-left">
            <Card>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><TypeBadge t={t.type} /><span className="text-[15px] font-extrabold">{gramsTrim(t.grams)}</span></div><StatusBadge s={t.status} /></div>
              <div className="mt-1 flex justify-between text-[13px]"><span className="text-navy/60">{egp2(t.pricePerGram)} / g</span><b>{egp2(t.gross)}</b></div>
              <div className="mt-1 flex justify-between text-[11px] text-navy/40"><span>{dateStr(t.ts)} · {timeStr(t.ts)}</span><span>{t.id}</span></div>
            </Card>
          </button>
        ))}
      </div>
    </Screen>
  );
}

export function TransactionDetail({ id }: { id: string }) {
  const { txs } = useStore();
  const t = txs.find((x) => x.id === id);
  if (!t) return <Screen title="Transaction"><div className="p-8 text-center text-navy/50">Transaction not found.</div></Screen>;
  const buy = t.type === "BUY";
  return (
    <Screen title="Transaction details">
      <div className="space-y-3 p-4">
        <div className="text-center"><TypeBadge t={t.type} /><div className="mt-1 text-[28px] font-black">{gramsTrim(t.grams)}</div><StatusBadge s={t.status} /></div>
        <Card>
          <Row k="Transaction ID" v={t.id} />
          <Row k="Type" v={t.type} />
          <Row k="Date & time" v={`${dateStr(t.ts)}, ${timeStr(t.ts)}`} />
          <Row k="Gold quantity" v={gramsTrim(t.grams)} />
          <Row k="Gold price" v={`${egp2(t.pricePerGram)} / g`} />
          <Divider />
          <Row k="Gross amount" v={egp2(t.gross)} />
          <Row k="Fees" v={egp2(t.fee)} />
          <Row k={buy ? "Total paid" : "Net amount"} v={egp2(t.net)} strong />
          <Row k={buy ? "Payment method" : "Credited to"} v={t.paymentMethod} />
          {t.realizedPnl !== undefined && <Row k="Realized P&L" v={`${t.realizedPnl >= 0 ? "+" : "-"}${egp2(Math.abs(t.realizedPnl))}`} tone={t.realizedPnl >= 0 ? "good" : "bad"} />}
        </Card>
        <Card>
          <div className="mb-1 text-[13px] font-bold">What happened to your money and gold</div>
          <Row k="Cash balance before" v={egp2(t.cashBefore)} />
          <Row k="Cash balance after" v={egp2(t.cashAfter)} strong />
          <Divider />
          <Row k="Gold balance before" v={grams(t.goldBefore, 1)} />
          <Row k="Gold balance after" v={grams(t.goldAfter, 1)} strong />
        </Card>
      </div>
    </Screen>
  );
}
