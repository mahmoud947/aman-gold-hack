# Aman Gold: delivery pack

| File | What it is |
|---|---|
| `Aman-Gold-Delivery-Pack.xlsx` | One workbook: Overview, Timeline & Effort, Sprint Backlog, QA Backlog, Test Cases (with results), Defects, Change Requests |
| `jira-import.csv` | Sprint backlog and QA backlog, import-ready for Jira |
| `PRD.md` | Product requirements (copy of `docs/01-PRD.md`) |
| `docs/` | PRD, business flow and journey, architecture and data model, assumptions / compliance / risk register / roadmap |
| Design canvas (Claude Design) | Delivery overview plus 10 clickable customer screens: https://claude.ai/artifact/SQEXUfFN5BaEonuDSLmPMT |
| `../aman-gold-lab` | Business Case Lab (Next.js), port 3100 |
| `../aman-gold-app` | Customer prototype (Next.js + Tailwind), port 3200; launcher: `Start Aman Gold.bat` |

## Honesty notes
- Tickets and QA stories were written after the work (retrospective). No live Jira project existed.
- No Figma file was created. The flow is a Claude Design canvas.
- Test results are from scripted browser checks by Claude, not a human QA team. 15 of 56 cases are "Not executed".
- Times come from file-system timestamps. "Elapsed" includes waiting for the PM. Human-equivalent effort is an estimate.

To rebuild the workbook and CSV after editing `data.js`: `node build.js`.
