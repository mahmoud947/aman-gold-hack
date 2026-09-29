"use client";
import { useRef, type PointerEvent, type ReactNode } from "react";
import type { TxStatus } from "../types";
import { useNav, type ScreenName } from "./nav";

/* ---------- Design-system primitives (Aman Gold) ---------- */

export function Screen({ title, back = true, right, children, footer, tabs }: { title?: string; back?: boolean; right?: ReactNode; children: ReactNode; footer?: ReactNode; tabs?: boolean }) {
  const nav = useNav();
  return (
    <div className="flex h-full flex-col bg-canvas">
      {title !== undefined && (
        <div className="flex items-center gap-2 bg-white px-4 py-3 shadow-sm">
          {back && nav.canBack ? (
            <button aria-label="Back" onClick={nav.pop} className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">‹</button>
          ) : <span className="w-9" />}
          <div className="flex-1 text-center text-[17px] font-bold text-navy">{title}</div>
          <div className="flex w-9 justify-end">{right}</div>
        </div>
      )}
      <div className="no-scrollbar fade-in flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="border-t border-black/5 bg-white p-4">{footer}</div>}
      {tabs && <GoldTabs />}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", disabled, className = "" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "gold" | "secondary" | "ghost" | "danger"; disabled?: boolean; className?: string }) {
  const v = {
    primary: "bg-aman text-white active:bg-aman-dark", gold: "bg-gold text-white active:opacity-90",
    secondary: "bg-white text-aman border border-aman/30", ghost: "bg-transparent text-aman", danger: "bg-bad text-white",
  }[variant];
  return (
    <button disabled={disabled} onClick={onClick} className={`w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${v} ${className}`}>{children}</button>
  );
}

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(30,43,74,.08)] ${className}`}>{children}</div>
);

export const Row = ({ k, v, strong, tone }: { k: ReactNode; v: ReactNode; strong?: boolean; tone?: "good" | "bad" }) => (
  <div className="flex items-start justify-between gap-3 py-2 text-[14px]">
    <span className="text-navy/60">{k}</span>
    <span className={`text-right ${strong ? "font-bold" : "font-semibold"} ${tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : ""}`}>{v}</span>
  </div>
);
export const Divider = () => <div className="h-px bg-black/5" />;

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "gold" | "aman" }) {
  const t = { neutral: "bg-black/5 text-navy/70", good: "bg-green-100 text-good", bad: "bg-red-100 text-bad", gold: "bg-gold-soft text-gold", aman: "bg-aman-soft text-aman-dark" }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t}`}>{children}</span>;
}
export const StatusBadge = ({ s }: { s: TxStatus }) => <Pill tone={s === "Completed" ? "good" : s === "Failed" ? "bad" : "gold"}>{s}</Pill>;
export const TypeBadge = ({ t }: { t: "BUY" | "SELL" }) => <Pill tone={t === "BUY" ? "aman" : "gold"}>{t}</Pill>;

export function Alert({ tone = "info", children }: { tone?: "info" | "warn" | "error"; children: ReactNode }) {
  const t = { info: "bg-aman-soft text-aman-dark", warn: "bg-amber-50 text-amber-800", error: "bg-red-50 text-bad" }[tone];
  return <div className={`rounded-xl px-3 py-2.5 text-[13px] leading-snug ${t}`}>{children}</div>;
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose?: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-navy/50" onClick={onClose}>
      <div className="slide-up w-full rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" />
        <div className="mb-3 text-[17px] font-bold">{title}</div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, placeholder, readOnly, hint, type = "text", inputMode }: { label: string; value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; hint?: string; type?: string; inputMode?: "numeric" | "text" | "tel" }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[12px] font-semibold text-navy/60">{label}</span>
      <input type={type} inputMode={inputMode} value={value} readOnly={readOnly} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl border border-black/10 px-3 py-3 text-[15px] outline-none focus:border-aman ${readOnly ? "bg-canvas text-navy/70" : "bg-white"}`} />
      {hint && <span className="mt-1 block text-[11px] text-navy/50">{hint}</span>}
    </label>
  );
}

/** Draw-to-sign pad used for e-signature capture (eKYC consent, agreements). Reports a PNG data URL once a stroke is drawn, or null when cleared. */
export function SignaturePad({ value, onChange, label = "Your signature" }: { value: string | null; onChange: (dataUrl: string | null) => void; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  const pos = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  };

  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e2b4a";
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStroke.current = true;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasStroke.current && canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    onChange(null);
  };

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[14px] font-bold">{label}</div>
        {value ? <Pill tone="good">Captured</Pill> : <Pill tone="neutral">Required</Pill>}
      </div>
      <canvas
        ref={canvasRef}
        width={340}
        height={140}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded-xl border-2 border-dashed border-black/10 bg-canvas"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-navy/40">Sign with your finger or mouse.</span>
        <button onClick={clear} className="text-[12px] font-bold text-aman underline">Clear</button>
      </div>
    </Card>
  );
}

export function Spinner() { return <div className="spin h-12 w-12 rounded-full border-4 border-aman/20 border-t-aman" />; }

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "good" | "bad" }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">{label}</div>
      <div className={`text-[19px] font-extrabold ${tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : ""}`}>{value}</div>
      {sub && <div className={`text-[12px] font-semibold ${tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-navy/50"}`}>{sub}</div>}
    </div>
  );
}

export function Stepper({ step, total }: { step: number; total: number }) {
  return <div className="flex gap-1 px-4 pt-3">{Array.from({ length: total }, (_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-aman" : "bg-black/10"}`} />)}</div>;
}

export const DemoTag = () => <span className="rounded bg-gold-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold">DEMO</span>;

/* ---------- Gold bottom tab bar ---------- */
/** Drawn as SVG: the "☺" glyph renders as a colour emoji on iOS. */
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c1.4-3.8 4.4-5.5 8-5.5s6.6 1.7 8 5.5" />
  </svg>
);
const TABS: { name: ScreenName; label: string; icon: ReactNode }[] = [
  { name: "dashboard", label: "Gold", icon: "◈" }, { name: "portfolio", label: "Portfolio", icon: "◔" },
  { name: "transactions", label: "Activity", icon: "☰" }, { name: "profile", label: "Profile", icon: <ProfileIcon /> },
];
export function GoldTabs() {
  const nav = useNav();
  return (
    <div className="flex border-t border-black/5 bg-white pb-2 pt-1">
      {TABS.map((t) => (
        <button key={t.name} onClick={() => nav.reset(t.name)} className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold ${nav.route.name === t.name ? "text-aman" : "text-navy/40"}`}>
          <span className="text-[18px] leading-none">{t.icon}</span>{t.label}
        </button>
      ))}
      <button onClick={() => nav.reset("home")} className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold text-navy/40"><span className="text-[18px] leading-none">⌂</span>Aman</button>
    </div>
  );
}
