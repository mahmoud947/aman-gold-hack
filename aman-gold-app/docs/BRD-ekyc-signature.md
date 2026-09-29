# Business Requirements Document — eKYC Signature Capture

**Status:** Draft | **Date:** 2026-09-27 | **Author:** Claude, from a PM discovery pass
**Written retrospectively:** Yes, after the fact — the feature was built and verified in-browser
before this BRD was written. This documents the decision after the fact rather than proposing it
in advance.

## 1. Discovery notes

**What was asked:** "the onboarding needs an eKYC signature flow." Reading the existing code first
(both onboarding flows) confirmed the gap was real: the brand-new-customer flow already does ID
capture and a selfie liveness check (eKYC evidence), and the existing-customer flow already reuses
KYC on file — but in both flows, "I agree to the terms" was only ever a checkbox. No signature, no
captured evidence of consent, on either path.

**Biggest assumption made without asking first:** that *both* flows need a signature, not just the
brand-new one. Existing customers already have KYC on file, so their signature here isn't
re-verifying identity — it's authorizing enrollment in a specific new product (Gold Investment) on
an account that didn't previously have it. This is an `ASSUMPTION`, not a confirmed business rule:
whether Aman's real compliance policy requires a distinct per-product signature, or whether the
original account-level KYC consent already covers new products, is `UNKNOWN` and listed under
Open Questions below.

**Conflict worth naming:** a checkbox is arguably sufficient consent evidence for many products,
and adding a mandatory signature step adds friction (one more screen, one more required action)
for very little proven legal benefit in a prototype with no backend persistence. This BRD's scope
(see below) resolves that conflict by building the capture UI and gating logic now, while
explicitly not building the parts (server-side storage, audit trail, legal-grade e-signature
integration) that would be required to rely on this as real evidence.

## 2. Business objective

Give Aman a first version of consent-capture UX for gold onboarding that goes beyond a checkbox,
so that if/when Compliance requires demonstrable customer authorization (for account opening and
for enrolling an existing account in a new product), the product already has a UX pattern for it
and isn't starting from zero. `ASSUMPTION`: the underlying driver is general fintech/KYC practice
and an anticipated compliance ask, not a specific cited regulation — no regulator citation for a
signature requirement (as distinct from the FRA gold-certificate research already in
`04-assumptions-compliance-risks-roadmap.md`) was found or provided.

## 3. Problem statement

**Current state (before this change):** both onboarding flows ended their "Agreements" step with a
single checkbox: "I have read and agree to the terms, fees and risk disclosure." No image, stroke,
or other artifact was captured — clicking the checkbox and clicking Continue were the entire
consent record.

**Pain point:** for the brand-new-customer flow specifically, this was inconsistent with the rest
of that flow's own design — it already captures a National ID photo and a selfie specifically to
verify identity (eKYC), but then accepted the customer's agreement to legally-relevant terms with
no comparable evidence. For the existing-customer flow, there was no consent artifact at all for
enrolling an already-KYC'd account in a new product.

## 4. Stakeholders

| Stakeholder | Role / interest | Decision authority on this? |
|---|---|---|
| Compliance / Legal | Owns whether a drawn signature is legally sufficient evidence of consent under Egyptian law, and whether product-level (vs. account-level) consent is required | Yes — final sign-off `UNKNOWN` until reviewed |
| Product (Aman Gold PM) | Owns onboarding scope and friction/conversion trade-offs | Yes, on UX scope |
| Engineering | Implements capture, gating, and (if scope expands) persistence | Implementation only |
| Customer | Signer | None — experiences the flow |

## 5. Scope

### In scope
- A reusable draw-to-sign canvas component (mouse and touch), with a Clear action and a
  Required/Captured status indicator.
- Brand-new customer flow: a new step ("eKYC signature") after ID capture and selfie, showing a
  summary of what was captured and gating progress on a drawn signature.
- Existing-customer flow: a signature pad revealed once the existing "agree to terms" checkbox is
  checked, gating "Start Investing" on a drawn signature, framed as authorizing the Gold product
  specifically (not re-verifying identity).
- Disabling the relevant Continue/Submit button until a signature is present, consistent with how
  every other onboarding sub-step in this prototype gates progress (PIN match, ID capture, selfie).

### Out of scope (explicitly)
- Persisting the signature image anywhere (server, database, or even local storage) — it lives only
  in component state for the duration of the onboarding session, same as the simulated ID-photo and
  selfie captures already in the brand-new flow.
- Any audit trail: timestamp, IP address, device fingerprint, or document-version binding of what
  was actually signed.
- Integration with a licensed e-signature provider or Egypt's national e-signature scheme.
- Signature verification against a specimen, or any fraud/forgery detection.
- Rendering the actual terms document the signature applies to as a fixed, versioned artifact (the
  Terms/Fees/Risk sheets remain placeholder text, as they were before this change).
- A decision on whether existing customers legally need a second signature at all (see Open
  Questions).

## 6. Business requirements

| ID | Requirement | Priority (Must/Should/Could) | Source (FACT/ASSUMPTION/UNKNOWN) |
|---|---|---|---|
| BR-1 | Brand-new customers must provide a drawn signature before completing eKYC, positioned after ID and selfie capture | Must | ASSUMPTION — inferred from "onboarding needs an eKYC signature flow" |
| BR-2 | Existing customers must provide a drawn signature before enrolling their account in Gold Investment | Must | ASSUMPTION — see Discovery notes; not confirmed this is legally required |
| BR-3 | The signing action must be blockable/required, not optional — matching the enforcement pattern of every other identity/consent sub-step already in onboarding | Must | FACT — consistent with existing PIN/ID/selfie gating in the codebase |
| BR-4 | The signature capture must not persist any data server-side in this prototype phase | Should | ASSUMPTION — matches this prototype's existing "demo, not backend" posture |
| BR-5 | The capture component must be reusable, not duplicated per flow | Could | ASSUMPTION — engineering-quality preference, not a stated business rule |

## 7. Assumptions and constraints

| # | Statement | Type (ASSUMPTION/CONSTRAINT/UNKNOWN) | Impact if wrong |
|---|---|---|---|
| 1 | A drawn (canvas) signature is an acceptable interim UX pattern, pending Compliance review | ASSUMPTION | If Compliance requires a different mechanism (typed name + OTP, national e-signature, etc.), this UI would need to change or be supplemented |
| 2 | Existing customers need their own product-level signature, separate from original account KYC | ASSUMPTION | If wrong, this adds unnecessary friction to the existing-customer flow for no compliance benefit |
| 3 | No server-side persistence is acceptable for now because this is a prototype, not production | CONSTRAINT (by project phase) | Before any real launch, signature evidence would need real storage, retention, and audit-trail design — none of that exists today |
| 4 | Legal validity of an electronically drawn signature under Egyptian law (and Aman's own policies) | UNKNOWN | If a drawn signature isn't legally binding, this whole mechanism is UX theater and a different consent-capture method would be needed before launch |

## 8. Success metrics

`UNKNOWN: no success metric defined yet.` This was built to close a UX/compliance-readiness gap
flagged in review, not against a stated funnel or business metric. If this ships toward production,
a real metric would likely be a completion/abandonment rate at this specific step (to catch if the
added friction meaningfully hurts onboarding conversion), but no baseline or target has been set.

## 9. Risks

| Risk | Category | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Drawn signature isn't legally sufficient evidence in Egypt, so this doesn't actually satisfy a compliance need | Legal | Unknown | High if relied upon in production | Route to Compliance/Legal for review before treating this as more than a UX placeholder |
| Extra step increases onboarding abandonment, especially for existing customers who already had a short flow | Business | Medium | Medium | Watch step-level drop-off once real usage data exists; the existing-customer flow only adds the pad after they've already opted to agree, minimizing added friction |
| No persistence means there is currently zero audit trail — if asked "prove customer X consented," there is no record to produce | Operational | High (by design, in this phase) | High before any real launch | Explicitly flagged as out of scope; must be addressed before production |

## 10. Dependencies

- Compliance/Legal input on whether this capture method is acceptable, and whether product-level
  (vs. account-level) signature is actually required.
- If this moves toward production: a decision on signature storage (where, how long, who can
  access it) and whether a licensed e-signature/audit-trail vendor is needed instead of a
  self-built canvas.

## 11. Open questions for the business owner

- Does Aman's compliance policy require a distinct signature for enrolling an *existing* customer
  in a new product (Gold Investment), or does the account-level KYC consent already cover it? This
  determines whether E21-S3 (existing-customer signature) should exist at all.
- Is a drawn (canvas) signature acceptable as legal evidence of consent, or does this need to be
  built around a licensed e-signature/national e-signature integration instead?
- If this is kept, what's the actual document the signature should apply to — should the Terms/
  Fees/Risk Disclosure content shown just before signing be a fixed, versioned document (so there's
  a specific thing being signed), rather than the current placeholder text?
