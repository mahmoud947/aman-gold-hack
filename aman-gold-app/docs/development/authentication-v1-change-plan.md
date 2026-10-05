# Authentication vertical slice change plan

## Governed inputs

- Product Definition V2: `8b4addff-d0a0-4510-8b48-097a35f4de84`
- Accepted Design Definition V3: `e6c8c841-b47a-4d27-9322-d9dc0205222e` (known warnings preserved)
- Architecture Definition V1: `99d91274-43e4-411b-9877-20c07a1cd4b9`
- Repository Context V3: `c937c792-76df-47dc-a362-35af07e23070` at commit `93282f1dd0ce13dfbf9296450b713aefb129624c`

## Repository-grounded change surface

`aman-gold-app` owns the customer-facing experience. It is a Next.js 15/React 19 app using an in-memory React context persisted to local storage, a small in-app navigation stack, shared Tailwind-based UI primitives, and an existing onboarding/KYC/Profile journey. Supabase is currently an optional read-only gold-price source; there is no governed authentication backend or confirmed credential/session policy.

The slice therefore adds only a clearly labelled local demo authentication state and UI. It does not add JWT, OAuth, OTP delivery, Firebase, Supabase Auth, cookies, API endpoints, or secrets.

Planned files/modules:

- `features/auth/Authentication.tsx`: registration/login, validation, progress, failure/retry, and protected-access explanation.
- `services/auth.ts`: bounded demo-operation result with no external integration.
- `services/store.tsx`: persisted product-level authenticated state and login/register/logout actions.
- `components/nav.tsx` and `components/PhoneShell.tsx`: auth route and protected experience gate.
- `features/home/Home.tsx` and `features/profile/Profile.tsx`: authenticated identity/status and logout entry.
- Existing `components/ui.tsx` patterns are reused unchanged.

## Story and acceptance-criterion mapping

- US-001 / AC-001–006: registration entry, name/mobile requirements, field feedback, single in-flight submission, success continuation, simulated recoverable failure.
- US-002 / AC-007–011: login entry, mobile validation, single in-flight submission, authenticated continuation, simulated recoverable failure.
- US-003 / AC-012–014: persisted local demo authentication, restored state, and explicit demo session invalidation control.
- US-004 / AC-015–016: protected Gold experiences are hidden behind a reusable authentication-required state and open after authentication.
- US-005 / AC-017–019: visible Profile logout action, completion feedback, cleared authentication, and protected-access enforcement afterward.
- US-006 / AC-020–021: Profile uses the authenticated customer identity and reports known KYC status without inferring eligibility.

## Validation

Use the repository-owned npm lockfile and scripts. Run dependency verification, `npx tsc --noEmit`, and `npm run build`. No test runner or lint script exists; add no framework solely for this slice. Manually verify login, registration, failure/retry, protected access, persisted session, logout, and KYC/Profile presentation at `/` on port 3200.
