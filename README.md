# Aman Gold

Internal exploration for a Gold Investment product inside the Aman Super App: a business-case decision tool, a clickable customer prototype, and the delivery/QA paperwork for both.

**Status:** internal prototype work, not reviewed or approved by Aman management. All customer data is fictional (DEMO DATA). Regulatory structure is not validated.

## Folders

| Folder | What it is | Run it |
|---|---|---|
| [`aman-gold-lab/`](aman-gold-lab) | **Business Case Lab** — 5 AI agents (CEO/CFO/CMO/R&D/Risk) debate the opportunity over 7 rounds and reach an evidence-graded decision, with a full financial model, scenarios, stress tests and sourced market research. | `cd aman-gold-lab && npm install && npm run dev` (port 3100) |
| [`aman-gold-app/`](aman-gold-app) | **Customer prototype** — clickable Next.js/Tailwind mobile prototype: discovery, onboarding (existing Aman customer and brand-new customer), buy/sell, portfolio, daily P&L, transactions. | `cd aman-gold-app && npm install && npm run dev` (port 3200), or double-click `Start Aman Gold.bat` |
| [`delivery-pack/`](delivery-pack) | **Delivery pack** — retrospective sprint backlog, QA backlog, test cases with results, defect log, change-request log, and the generator for the delivery workbook and the Claude Design flow board. | `cd delivery-pack && npm install && node build.js` |

## Honesty notes (carried over from the delivery pack)

- Sprint tickets and QA stories were written retrospectively from the actual build; there was no live Jira project during the work.
- Test results in `delivery-pack/Aman-Gold-Delivery-Pack.xlsx` are from scripted browser checks run by Claude, not a human QA team. Cases not run are marked "Not executed".
- Effort/time figures come from file-system timestamps where possible; anything not measurable is labelled so, not estimated.
