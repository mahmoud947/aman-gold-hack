const ExcelJS = require("exceljs");
const fs = require("fs");
const D = require("./data");

const TEAL = "FF04768D", LIGHT = "FFE4F4F7";
const wb = new ExcelJS.Workbook();
wb.creator = "Claude (retrospective delivery pack)";
wb.created = new Date();

function sheet(name, headers, rows, widths, opts = {}) {
  const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.addRow(headers);
  rows.forEach((r) => ws.addRow(r));
  const h = ws.getRow(1);
  h.font = { bold: true, color: { argb: "FFFFFFFF" } };
  h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
  h.alignment = { vertical: "middle", wrapText: true };
  h.height = 26;
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.eachRow((row, n) => {
    if (n > 1) row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((c) => (c.border = { bottom: { style: "thin", color: { argb: "FFE2E6EE" } } }));
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  if (opts.resultCol) {
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const c = row.getCell(opts.resultCol);
      const v = String(c.value);
      const fill = v === "Pass" ? "FFDCFCE7" : v.startsWith("Fail") ? "FFFEE2E2" : "FFFEF3C7";
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      c.font = { bold: true };
    });
  }
  if (opts.epicCol) {
    ws.eachRow((row, n) => {
      if (n > 1 && row.getCell(opts.epicCol).value === "Epic") { row.font = { bold: true }; row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }; }
    });
  }
  return ws;
}

// ---- Overview ----
const ov = wb.addWorksheet("Overview");
ov.getColumn(1).width = 44; ov.getColumn(2).width = 22; ov.getColumn(3).width = 90;
ov.addRow(["AMAN GOLD - DELIVERY PACK (retrospective)"]).font = { bold: true, size: 16, color: { argb: TEAL } };
ov.addRow(["Generated from the actual session evidence. Read the honesty notes before using the numbers."]);
ov.addRow([]);
const honesty = [
  "Sprint tickets and QA stories were written AFTER the work as a retrospective; no live Jira project existed during the build.",
  "No Figma file was created. The design flow is a Claude Design canvas (screens + prototype links).",
  "Test results come from scripted browser checks run by Claude, not from a human QA team. Cases not run are marked 'Not executed'.",
  "Times come from file-system timestamps. 'Elapsed' includes time spent waiting for the PM; active build time is shorter. Human-equivalent effort is an ESTIMATE.",
];
honesty.forEach((t) => { const r = ov.addRow(["NOTE", "", t]); r.getCell(1).font = { bold: true, color: { argb: "FFB45309" } }; r.getCell(3).alignment = { wrapText: true }; });
ov.addRow([]);
const head = ov.addRow(["Metric", "Value", "Detail"]); head.font = { bold: true, color: { argb: "FFFFFFFF" } };
head.eachCell((c) => (c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } }));
const c = D.counts;
const tcCount = (res) => ({ formula: `COUNTIF('Test Cases'!H:H,"${res}")`, result: res === "Pass" ? c.pass : res === "Fail -> Fixed" ? c.fixed : c.notExec });
[
  ["Epics / stories / tasks (delivered)", `${c.epics} / ${c.stories} / ${c.tasks}`, "Sprint Backlog sheet"],
  ["Story points delivered (ESTIMATE)", c.points, "Stories only; tasks roll up"],
  ["QA stories / tasks (new, for testing team)", `${c.qaStories} / ${c.qaTasks}`, "QA Backlog sheet"],
  ["Test cases", { formula: "COUNTA('Test Cases'!A:A)-1", result: c.tc }, "Test Cases sheet"],
  ["  Pass", tcCount("Pass"), "Executed and passed"],
  ["  Failed then fixed", tcCount("Fail -> Fixed"), "Found a defect, fixed, re-verified"],
  ["  Not executed", tcCount("Not executed"), "Still to run (see QA Backlog)"],
  ["Defects logged", { formula: "COUNTA(Defects!A:A)-1", result: c.defects }, "Defects sheet"],
  ["Change requests / decisions", { formula: "COUNTA('Change Requests'!A:A)-1", result: c.crs }, "Change Requests sheet"],
  ["Business Case Lab size", "30 files / ~1,600 lines", "2026-09-20 21:34 to 2026-09-21 17:02"],
  ["Customer Prototype size", "36 files / ~1,846 lines", "2026-09-21 22:39 to 2026-09-22 02:50 (incl. 4 docs)"],
  ["Core prototype code generation", "8 minutes", "22:39-22:47, config + services + all screens"],
  ["Debugging and fixing", "about 40 minutes", "DEF-01..03 about 14 min; daylight-saving defect about 25 min; plus small fixes"],
].forEach((r) => ov.addRow(r));

// ---- Timeline ----
sheet("Timeline & Effort", ["Phase", "Start", "End", "Elapsed", "What happened", "Evidence"], D.timeline, [52, 18, 18, 18, 80, 22]);
const ws = wb.getWorksheet("Timeline & Effort");
ws.addRow([]);
const eh = ws.addRow(["Effort summary", "Wall-clock (real)", "Files", "Lines", "Human-equivalent (ESTIMATE, not measured)", ""]);
eh.font = { bold: true };
D.effort.forEach((r) => ws.addRow([r[0], r[1], r[2], r[3], r[4], ""]));

sheet("Sprint Backlog", ["Type", "ID", "Parent", "Summary", "Acceptance / detail", "Points (ESTIMATE)", "Status", "Sprint", "Component"], D.backlog, [9, 10, 10, 62, 62, 10, 10, 34, 14], { epicCol: 1 });
sheet("QA Backlog", ["Type", "ID", "Parent", "Summary", "Acceptance / detail", "Points (ESTIMATE)", "Status", "Sprint", "Component"], D.qa, [9, 10, 10, 62, 62, 10, 10, 22, 12], { epicCol: 1 });
sheet("Test Cases", ["ID", "Area", "Title", "Preconditions", "Steps", "Expected", "Actual", "Result", "Method", "Defect", "Linked CR"], D.tc, [10, 11, 44, 22, 32, 40, 44, 14, 30, 10, 12], { resultCol: 8 });
sheet("Defects", ["ID", "Severity", "Found by", "Summary", "Root cause", "Fix", "Verified"], D.defects, [9, 10, 26, 48, 48, 48, 16]);
sheet("Change Requests", ["ID", "Date", "Requester", "Title", "Detail", "Impact", "Status"], D.crs, [10, 12, 10, 56, 44, 48, 20]);

wb.xlsx.writeFile("Aman-Gold-Delivery-Pack.xlsx").then(() => console.log("xlsx ok"));

// ---- Jira-importable CSV (backlog + QA) ----
const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const rows = [["Issue Type", "Issue Id", "Parent", "Summary", "Description", "Story Points", "Status", "Sprint", "Component"]];
[...D.backlog, ...D.qa].forEach((r) => rows.push([r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]]));
fs.writeFileSync("jira-import.csv", rows.map((r) => r.map(esc).join(",")).join("\n"), "utf8");
console.log("csv ok", D.counts);
