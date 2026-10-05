"use client";

import { useState } from "react";
import { Alert, Button, Card, Field, Pill, Screen, Spinner } from "../../components/ui";
import { useNav, type ScreenName } from "../../components/nav";
import { useStore } from "../../services/store";
import type { AuthenticationIntent } from "../../services/auth";

const normalizeMobile = (value: string) => value.replace(/\D/g, "").slice(0, 11);
const validMobile = (value: string) => value.length >= 10;

export function Authentication({ required = false, destination = "dashboard" }: { required?: boolean; destination?: ScreenName }) {
  const nav = useNav();
  const store = useStore();
  const [intent, setIntent] = useState<AuthenticationIntent>("login");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mobileError = submitted && !validMobile(mobile) ? "Enter a valid mobile number (at least 10 digits)." : undefined;
  const nameError = submitted && intent === "register" && name.trim().length < 3 ? "Enter your full name." : undefined;

  const submit = async () => {
    setSubmitted(true);
    if (!validMobile(mobile) || (intent === "register" && name.trim().length < 3)) return;
    const ok = intent === "register"
      ? await store.register({ mobile, name })
      : await store.login({ mobile });
    if (ok) {
      const next = intent === "register" && !store.onboarded
        ? "onboarding"
        : required
          ? destination
          : store.onboarded ? "dashboard" : "landing";
      nav.reset(next);
    }
  };

  const choose = (next: AuthenticationIntent) => {
    setIntent(next);
    setSubmitted(false);
    store.clearAuthError();
  };

  return (
    <Screen title={required ? "Sign in required" : "Welcome to Aman Gold"}>
      <div className="space-y-3 p-4">
        {required && <Alert tone="info">Sign in to continue. Protected Gold information stays hidden until authentication succeeds.</Alert>}
        <div className="grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm" role="tablist" aria-label="Authentication choice">
          {(["login", "register"] as const).map((choice) => (
            <button key={choice} role="tab" aria-selected={intent === choice} disabled={store.authPending} onClick={() => choose(choice)} className={`rounded-xl px-3 py-2.5 text-[13px] font-bold ${intent === choice ? "bg-aman text-white" : "text-navy/60"}`}>
              {choice === "login" ? "Log in" : "Create account"}
            </button>
          ))}
        </div>

        <Card>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-[18px] font-extrabold">{intent === "login" ? "Log in" : "Create your account"}</div>
            <Pill tone="gold">DEMO</Pill>
          </div>
          <p className="mb-4 text-[12px] leading-relaxed text-navy/55">
            This prototype validates the experience only. It does not contact an authentication provider, create a real account, or send a code.
          </p>
          {intent === "register" && <Field label="Full name" value={name} onChange={setName} placeholder="First and family name" hint={nameError} />}
          <Field label="Mobile number" type="tel" inputMode="tel" value={mobile} onChange={(value) => setMobile(normalizeMobile(value))} placeholder="01X XXX XXXX" hint={mobileError} />
          {store.authError && <Alert tone="error">We couldn’t complete authentication. Your details are still here—check them and try again.</Alert>}
          <div className="mt-4">
            <Button disabled={store.authPending} onClick={submit}>
              {store.authPending ? <span className="flex items-center justify-center gap-2"><span className="scale-[.35]"><Spinner /></span>Working…</span> : intent === "login" ? "Log in" : "Create account"}
            </Button>
          </div>
        </Card>
        <button disabled={store.authPending} onClick={() => nav.reset("home")} className="w-full py-2 text-[13px] font-bold text-aman">Back to Aman home</button>
      </div>
    </Screen>
  );
}
