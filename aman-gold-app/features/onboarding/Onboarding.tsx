"use client";
import { useState } from "react";
import { PRODUCT_CONFIG } from "../../config/product";
import { useNav } from "../../components/nav";
import { Alert, Button, Card, Field, Pill, Row, Screen, Sheet, Stepper } from "../../components/ui";
import { useStore } from "../../services/store";
import OnboardingNew from "./OnboardingNew";

const STEPS = ["Introduction", "Account check", "Mobile number", "Identity", "Payment method", "Agreements", "Done"];

/** Existing Aman customer: most data is already on file. Brand-new customer: full capture flow (OnboardingNew). */
export default function Onboarding() {
  const { mode } = useStore();
  return mode === "brandNew" ? <OnboardingNew /> : <OnboardingExisting />;
}

function OnboardingExisting() {
  const nav = useNav();
  const st = useStore();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [addr, setAddr] = useState(st.customer.address ?? "");
  const [agree, setAgree] = useState(false);
  const [fund, setFund] = useState<"prepaid" | "new">("prepaid");
  const [doc, setDoc] = useState<string | null>(null);
  const c = st.customer;
  const missing = !st.kycOk;
  const next = () => setStep((s) => Math.min(s + 1, 7));
  const back = () => (step > 1 ? setStep(step - 1) : nav.pop());

  const finish = () => { st.completeOnboarding(); nav.reset("dashboard"); };

  return (
    <Screen title={STEPS[step - 1]} back={false} right={step > 1 && step < 7 ? <button onClick={back} className="text-[13px] font-bold text-aman">Back</button> : undefined}
      footer={
        step === 1 ? <Button onClick={next}>Get Started</Button> :
        step === 2 ? <Button onClick={() => (missing ? setStep(4) : next())}>{missing ? "Complete your information" : "Continue"}</Button> :
        step === 3 ? <Button disabled={otp.length < 4} onClick={next}>Continue</Button> :
        step === 4 ? <Button disabled={addr.trim().length < 5} onClick={() => { st.set({ customer: { ...c, address: addr }, kycMissing: false }); setStep(5); }}>Continue</Button> :
        step === 5 ? <Button onClick={next}>Continue</Button> :
        step === 6 ? <Button disabled={!agree} onClick={next}>Start Investing</Button> :
        <Button variant="gold" onClick={finish}>View Gold</Button>
      }>
      <Stepper step={step} total={7} />
      <div className="space-y-3 p-4">
        {step === 1 && (<>
          <div className="rounded-3xl bg-aman-gradient p-6 text-center text-white"><div className="text-5xl">◈</div><div className="mt-2 text-[24px] font-black">Invest in Gold</div></div>
          {[["Buy digital gold", "Own real 24k gold, measured in grams."], ["Start with a small amount", `From ${PRODUCT_CONFIG.limits.minGrams} g (about EGP ${Math.round(PRODUCT_CONFIG.limits.minGrams * st.buyPrice).toLocaleString()}).`], ["Track your investment from Aman", "See value, holdings and profit or loss."], ["Buy and sell digitally", "Fund with your Aman prepaid balance."]].map(([t, s]) => (
            <Card key={t}><div className="text-[14px] font-bold">{t}</div><div className="text-[13px] text-navy/60">{s}</div></Card>
          ))}
        </>)}

        {step === 2 && (<>
          <Alert tone="info">We already have some of your details from your Aman account, so you won't need to enter them twice.</Alert>
          <Card>
            <Row k="Full name" v={c.name} />
            <Row k="Mobile number" v={c.mobile} />
            <Row k="Aman account" v={<Pill tone="good">{c.accountStatus}</Pill>} />
            {PRODUCT_CONFIG.kycFields.map((f) => {
              const ok = f !== "Address" || !missing;
              return <Row key={f} k={f} v={ok ? <Pill tone="good">On file</Pill> : <Pill tone="bad">Missing</Pill>} />;
            })}
          </Card>
          {missing && <Alert tone="warn">Some required information is missing. Complete your information to continue.</Alert>}
          <div className="text-[11px] text-navy/40">Required fields are a configurable checklist for this prototype, not a statement of legal requirements.</div>
        </>)}

        {step === 3 && (<>
          <Field label="Registered mobile number" value={c.mobile} readOnly />
          <Alert tone="info">We sent a 4-digit code to your mobile. Demo: enter any 4 digits.</Alert>
          <Field label="Verification code" value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 4))} placeholder="0000" />
        </>)}

        {step === 4 && (<>
          <Field label="Full name" value={c.name} readOnly />
          <Field label="National ID" value={c.nationalIdMasked} readOnly />
          <Field label="Date of birth" value={c.dob} readOnly />
          <Field label="Nationality" value={c.nationality} readOnly />
          <Field label="Address" value={addr} onChange={setAddr} placeholder="Street, area, city" hint={missing ? "Required: this field was missing from your account." : undefined} />
          <div className="text-[11px] text-navy/40">Demo data. Real KYC rules are to be validated with Compliance.</div>
        </>)}

        {step === 5 && (<>
          <div className="text-[14px] font-bold">How will you pay?</div>
          <button onClick={() => setFund("prepaid")} className={`w-full rounded-2xl p-4 text-left ring-2 ${fund === "prepaid" ? "bg-aman-soft ring-aman" : "bg-white ring-transparent"}`}>
            <div className="rounded-xl bg-aman-gradient p-4 text-white"><div className="text-[11px] opacity-70">{PRODUCT_CONFIG.payment.method}</div><div className="mt-3 text-[16px] tracking-widest">{PRODUCT_CONFIG.payment.maskedCard}</div><div className="mt-2 text-[11px] opacity-70">Balance: EGP {st.cash.toLocaleString()}</div></div>
            <div className="mt-2 text-[12px] text-navy/60">Existing Aman payment card. Top up any time via {PRODUCT_CONFIG.payment.topUpRail}.</div>
          </button>
          <button onClick={() => { setFund("new"); setDoc("newcard"); }} className="w-full rounded-2xl bg-white p-4 text-left text-[14px] font-bold text-aman ring-2 ring-transparent">+ Add a payment card</button>
          <Sheet open={doc === "newcard"} onClose={() => { setDoc(null); setFund("prepaid"); }} title="Add a payment card">
            <Alert tone="warn">External cards go through a payment gateway and are not part of this MVP (roadmap). Gold purchases use your Aman prepaid balance.</Alert>
            <div className="mt-3"><Button onClick={() => { setDoc(null); setFund("prepaid"); }}>Use Aman prepaid card</Button></div>
          </Sheet>
        </>)}

        {step === 6 && (<>
          <Card>
            {["Terms & Conditions", "Gold Investment Terms", "Fees", "Risk Disclosure", "Privacy Policy"].map((d) => (
              <button key={d} onClick={() => setDoc(d)} className="flex w-full items-center justify-between border-b border-black/5 py-3 text-left text-[14px] font-semibold last:border-0">{d}<span className="text-aman">›</span></button>
            ))}
          </Card>
          <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-[13px]"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-teal-700" />I have read and agree to the terms, fees and risk disclosure.</label>
          <Sheet open={!!doc && doc !== "newcard"} onClose={() => setDoc(null)} title={doc ?? ""}>
            <div className="max-h-56 overflow-y-auto text-[13px] leading-relaxed text-navy/70">Placeholder legal text for the prototype. Final wording is to be provided by Legal and Compliance. Gold prices can rise and fall. Spread: {PRODUCT_CONFIG.pricing.spreadPctPerSide}% each side. Regulatory structure: TO VALIDATE.</div>
            <div className="mt-3"><Button onClick={() => setDoc(null)}>Close</Button></div>
          </Sheet>
        </>)}

        {step === 7 && (
          <div className="pt-10 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-good">✓</div>
            <div className="mt-4 text-[22px] font-black">You're ready to invest in gold</div><div className="mt-1 text-[13px] text-navy/60">Your Aman Gold account is set up.</div></div>
        )}
      </div>
    </Screen>
  );
}
