"use client";
import { useState } from "react";
import { PRODUCT_CONFIG } from "../../config/product";
import { useNav } from "../../components/nav";
import { Alert, Button, Card, Field, Pill, Row, Screen, Sheet, Stepper } from "../../components/ui";
import { useStore } from "../../services/store";

/**
 * Onboarding for a BRAND-NEW customer: nothing is on file, so we capture everything.
 * All checks here are DEMO validations. The list of required data is a configurable checklist
 * (config/product.ts), NOT a statement of Egyptian regulatory requirements: to be validated with Compliance.
 */
const STEPS = ["Introduction", "Mobile number", "Verification code", "Create PIN", "Personal details", "ID document", "Selfie check", "Aman prepaid card", "Agreements", "Done"];
const TOTAL = STEPS.length;
const digits = (v: string, n: number) => v.replace(/\D/g, "").slice(0, n);
const maskId = (id: string) => (id.length >= 8 ? `${id.slice(0, 4)}${"*".repeat(id.length - 8)}${id.slice(-4)}` : id);
const TOPUPS = [1000, 5000, 10000, 25000];

export default function OnboardingNew() {
  const nav = useNav();
  const st = useStore();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ mobile: "", otp: "", pin: "", pin2: "", name: "", nid: "", dob: "", nationality: "Egyptian", address: "" });
  const [front, setFront] = useState(false);
  const [back, setBack] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [cardIssued, setCardIssued] = useState(false);
  const [topUp, setTopUp] = useState(0);
  const [agree, setAgree] = useState(false);
  const [doc, setDoc] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const next = () => setStep((s) => Math.min(s + 1, TOTAL));
  const back1 = () => (step > 1 ? setStep(step - 1) : nav.pop());

  const detailsOk = f.name.trim().length >= 3 && f.nid.length === 14 && /^\d{2}\/\d{2}\/\d{4}$/.test(f.dob) && f.nationality.trim().length > 1 && f.address.trim().length >= 5;
  const pinOk = f.pin.length === 4 && f.pin === f.pin2;
  const fillDemo = () => setF((p) => ({ ...p, name: "Sara Mahmoud", nid: "29001011234567", dob: "01/01/1990", nationality: "Egyptian", address: "5 Example St, Maadi, Cairo" }));

  const finish = () => {
    st.set({ customer: { name: f.name.trim(), mobile: `+20 ${f.mobile.replace(/^0/, "")}`, nationalIdMasked: maskId(f.nid), dob: f.dob, address: f.address.trim(), nationality: f.nationality.trim(), accountStatus: "Active Aman account (new)" }, kycMissing: false });
    if (topUp > 0) st.topUp(topUp);
    st.completeOnboarding();
    nav.reset("dashboard");
  };

  const footer =
    step === 1 ? <Button onClick={next}>Get Started</Button> :
    step === 2 ? <Button disabled={f.mobile.replace(/\D/g, "").length < 10} onClick={next}>Send code</Button> :
    step === 3 ? <Button disabled={f.otp.length < 4} onClick={next}>Verify</Button> :
    step === 4 ? <Button disabled={!pinOk} onClick={next}>Continue</Button> :
    step === 5 ? <Button disabled={!detailsOk} onClick={next}>Continue</Button> :
    step === 6 ? <Button disabled={!(front && back)} onClick={next}>Continue</Button> :
    step === 7 ? <Button disabled={!selfie} onClick={next}>Continue</Button> :
    step === 8 ? <Button disabled={!cardIssued} onClick={next}>Continue</Button> :
    step === 9 ? <Button disabled={!agree} onClick={next}>Start Investing</Button> :
    <Button variant="gold" onClick={finish}>View Gold</Button>;

  return (
    <Screen title={STEPS[step - 1]} back={false} right={step > 1 && step < TOTAL ? <button onClick={back1} className="text-[13px] font-bold text-aman">Back</button> : undefined} footer={footer}>
      <Stepper step={step} total={TOTAL} />
      <div className="space-y-3 p-4">
        {step === 1 && (<>
          <div className="rounded-3xl bg-aman-gradient p-6 text-center text-white"><div className="text-5xl">◈</div><div className="mt-2 text-[24px] font-black">Invest in Gold</div><div className="mt-1 text-[13px] opacity-90">New to Aman? It takes a few minutes.</div></div>
          <Card>
            <div className="mb-2 text-[14px] font-bold">What you'll do</div>
            {["Verify your mobile number", "Create a PIN to approve orders", "Confirm who you are (details, ID, selfie)", "Get your Aman prepaid card and add money via InstaPay", "Read and accept the terms"].map((t, i) => (
              <div key={t} className="flex gap-3 py-1.5 text-[13px]"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aman-soft text-[11px] font-bold text-aman-dark">{i + 1}</span>{t}</div>
            ))}
          </Card>
          <Alert tone="info">We couldn't find an Aman profile with your details, so we'll set one up now.</Alert>
        </>)}

        {step === 2 && (<>
          <Field label="Mobile number" type="tel" value={f.mobile} onChange={(v) => set("mobile", digits(v, 11))} placeholder="1XX XXX XXXX" hint="We'll send a 4-digit code to this number (demo: no SMS is sent)." />
        </>)}

        {step === 3 && (<>
          <Alert tone="info">Code sent to +20 {f.mobile.replace(/^0/, "")}. Demo: enter any 4 digits.</Alert>
          <Field label="Verification code" value={f.otp} onChange={(v) => set("otp", digits(v, 4))} placeholder="0000" />
        </>)}

        {step === 4 && (<>
          <Alert tone="info">Your PIN approves every gold order. Demo: any 4 digits.</Alert>
          <Field label="Create a 4-digit PIN" type="password" value={f.pin} onChange={(v) => set("pin", digits(v, 4))} placeholder="••••" />
          <Field label="Confirm PIN" type="password" value={f.pin2} onChange={(v) => set("pin2", digits(v, 4))} placeholder="••••" hint={f.pin2.length === 4 && f.pin !== f.pin2 ? "PINs do not match." : undefined} />
        </>)}

        {step === 5 && (<>
          <div className="flex justify-end"><button onClick={fillDemo} className="text-[12px] font-bold text-aman underline">Fill demo data</button></div>
          <Field label="Full name (as on National ID)" value={f.name} onChange={(v) => set("name", v)} placeholder="First and family name" />
          <Field label="National ID number" inputMode="numeric" value={f.nid} onChange={(v) => set("nid", digits(v, 14))} placeholder="14 digits" hint="Demo validation: 14 digits (configurable)." />
          <Field label="Date of birth" value={f.dob} onChange={(v) => set("dob", v)} placeholder="DD/MM/YYYY" />
          <Field label="Nationality" value={f.nationality} onChange={(v) => set("nationality", v)} />
          <Field label="Address" value={f.address} onChange={(v) => set("address", v)} placeholder="Street, area, city" />
          <div className="text-[11px] text-navy/40">Required data is a configurable checklist, not a statement of legal requirements. To validate with Compliance.</div>
        </>)}

        {step === 6 && (<>
          <Alert tone="info">Take a clear photo of each side of your National ID. Demo: tap to simulate a capture.</Alert>
          {[["Front of National ID", front, setFront], ["Back of National ID", back, setBack]].map(([label, done, setter]) => (
            <Card key={label as string}>
              <div className="flex items-center justify-between"><div className="text-[14px] font-bold">{label as string}</div>{done ? <Pill tone="good">Captured</Pill> : <Pill tone="neutral">Required</Pill>}</div>
              <div className="my-3 flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-canvas text-[12px] text-navy/40">{done ? "ID image captured (simulated)" : "Camera preview"}</div>
              <Button variant={done ? "secondary" : "primary"} onClick={() => (setter as (v: boolean) => void)(true)}>{done ? "Retake" : "Capture"}</Button>
            </Card>
          ))}
        </>)}

        {step === 7 && (<>
          <Alert tone="info">A quick selfie confirms it's you. Demo: tap to simulate the check.</Alert>
          <Card>
            <div className="mx-auto my-2 flex h-40 w-40 items-center justify-center rounded-full border-4 border-dashed border-aman/40 bg-canvas text-[12px] text-navy/40">{selfie ? "Verified (simulated)" : "Face the camera"}</div>
            <div className="mb-3 text-center">{selfie ? <Pill tone="good">Match confirmed</Pill> : <Pill tone="neutral">Waiting</Pill>}</div>
            <Button variant={selfie ? "secondary" : "primary"} onClick={() => setSelfie(true)}>{selfie ? "Retake" : "Take selfie"}</Button>
          </Card>
        </>)}

        {step === 8 && (<>
          <Alert tone="info">Gold purchases are paid from your Aman prepaid card balance. Add money via {PRODUCT_CONFIG.payment.topUpRail}.</Alert>
          {!cardIssued ? (
            <Card><div className="text-[14px] font-bold">Your Aman prepaid card</div><div className="my-2 text-[13px] text-navy/60">We'll issue a virtual card linked to your new profile. Demo: no card is really issued.</div><Button onClick={() => setCardIssued(true)}>Get my Aman prepaid card</Button></Card>
          ) : (<>
            <div className="rounded-2xl bg-aman-gradient p-4 text-white"><div className="text-[11px] opacity-80">{PRODUCT_CONFIG.payment.method}</div><div className="mt-3 text-[16px] tracking-widest">{PRODUCT_CONFIG.payment.maskedCard}</div><div className="mt-2 text-[11px] opacity-80">Balance: EGP {topUp.toLocaleString()}</div></div>
            <Card>
              <div className="mb-2 text-[14px] font-bold">Add money via {PRODUCT_CONFIG.payment.topUpRail} (optional now)</div>
              <div className="grid grid-cols-4 gap-2">{TOPUPS.map((v) => <button key={v} onClick={() => setTopUp(topUp === v ? 0 : v)} className={`rounded-xl py-3 text-[13px] font-bold ${topUp === v ? "bg-aman text-white" : "bg-aman-soft text-aman-dark"}`}>{v >= 1000 ? `${v / 1000}K` : v}</button>)}</div>
              <div className="mt-2 text-[11px] text-navy/45">Simulated. You can top up later from the buy screen.</div>
            </Card>
          </>)}
        </>)}

        {step === 9 && (<>
          <Card>
            {["Terms & Conditions", "Gold Investment Terms", "Fees", "Risk Disclosure", "Privacy Policy"].map((d) => (
              <button key={d} onClick={() => setDoc(d)} className="flex w-full items-center justify-between border-b border-black/5 py-3 text-left text-[14px] font-semibold last:border-0">{d}<span className="text-aman">›</span></button>
            ))}
          </Card>
          <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-[13px]"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-teal-700" />I have read and agree to the terms, fees and risk disclosure.</label>
          <Sheet open={!!doc} onClose={() => setDoc(null)} title={doc ?? ""}>
            <div className="max-h-56 overflow-y-auto text-[13px] leading-relaxed text-navy/70">Placeholder legal text for the prototype. Final wording is to be provided by Legal and Compliance. Gold prices can rise and fall. Spread: {PRODUCT_CONFIG.pricing.spreadPctPerSide}% each side. Regulatory structure: TO VALIDATE.</div>
            <div className="mt-3"><Button onClick={() => setDoc(null)}>Close</Button></div>
          </Sheet>
        </>)}

        {step === 10 && (
          <div className="pt-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-good">✓</div>
            <div className="mt-4 text-[22px] font-black">You're ready to invest in gold</div>
            <div className="mt-1 text-[13px] text-navy/60">Your Aman profile and prepaid card are set up.</div>
            <Card><div className="mt-3 text-left"><Row k="Name" v={f.name} /><Row k="Mobile" v={`+20 ${f.mobile.replace(/^0/, "")}`} /><Row k="National ID" v={maskId(f.nid)} /><Row k="Prepaid balance" v={`EGP ${topUp.toLocaleString()}`} /></div></Card>
          </div>
        )}
      </div>
    </Screen>
  );
}
